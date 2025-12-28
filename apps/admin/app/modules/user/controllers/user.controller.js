const mongoose = require("mongoose");
const User = require("user/models/user.model");
const userRepo = require("user/repositories/user.repository");
const roleRepo = require("role/repositories/role.repository");
const userActivityTimelinesRepo = require("userActivityTimelines/repositories/userActivityTimelines.repository");
const userDevicesRepo = require("user_devices/repositories/user_devices.repository");

const faqRepo = require("faq/repositories/faq.repository");
const express = require("express");
const routeLabel = require("route-label");
const router = express.Router();
const namedRouter = routeLabel(router);
const fs = require("fs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const mailHelper = require("../../../helper/gmailMailer");
const utils = require("../../../helper/utils");
const CategoryRepository = require("../../category/repositories/category.repository");
userDevicesRepo.bulkDelete({ isDeleted: false });

class UserController {
  constructor() {
    this.users = [];
  }

  /* @Method: login
    // @Description: user Login Render
    */
  async login(req, res) {
    try {
      if (req.session && req.session.token) {
        res.redirect(namedRouter.urlFor("user.dashboard"));
      } else {
        res.render("user/views/login.ejs");
      }
    } catch (e) {
      throw e;
    }
  }

  /* @Method: signin
    // @Description: user Login
    */
  async signin(req, res) {
    try {
      req.body.email = req.body.email.trim().toLowerCase();
      let roles = await roleRepo.getDistinctDocument("_id", {
        rolegroup: "backend",
        isDeleted: false,
      });
      req.body.roles = roles;
      let userData = await userRepo.findOneWithRole(req.body);
      if (userData.status == 500) {
        req.flash("error", userData.message);
        return res.redirect(namedRouter.urlFor("user.login"));
      }
      let user = userData.data;
      if (user.status == "Block") {
        req.flash("error", "Account was set Block by the Administrator");
        return res.redirect(namedRouter.urlFor("user.login"));
      } else if (user.status == "Banned") {
        req.flash("error", "Account was Banned by the Administrator");
        return res.redirect(namedRouter.urlFor("user.login"));
      } else if (!_.isEmpty(user.role)) {
        const payload = {
          id: user._id,
        };

        let token = jwt.sign(payload, config.auth.jwtSecret, {
          expiresIn: config.auth.jwt_expiresin.toString(), // token expiration time
        });

        req.session.token = token;
        req.user = user;

        req.flash("success", "You have successfully logged in");
        return res.redirect(namedRouter.urlFor("user.dashboard"));
      } else {
        req.flash("error", "Authentication failed. You are not a valid user.");
        return res.redirect(namedRouter.urlFor("user.login"));
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /*  @Method: insert
        @Description: save User
   */
  async insert(req, res) {
    try {
      let roleDetails = await roleRepo.getByField({ role: "user" });
      if (!_.isEmpty(roleDetails)) {
        req.body.role = roleDetails._id;
      }
      const newUser = new User();
      const readable_pass = req.body.password;
      req.body.password = newUser.generateHash(req.body.password);
      req.body.email = req.body.email.trim().toLowerCase();
      req.body.phone = req.body.phone.trim();
      req.body.userName = req.body.userName.trim();
      // req.body.user_type = 'normal';
      req.body.age = utils.calculateAge(req.body.dob);
      req.body = await utils.handleNameFields(req.body);
      var chk = { isDeleted: false, email: req.body.email };
      var chkPhone = { isDeleted: false, phone: req.body.phone };
      var chkuserName = { isDeleted: false, userName: req.body.userName };
      // console.log(chkuserName);

      let checkEmail = await userRepo.getByField(chk);
      let checkPhone = await userRepo.getByField(chkPhone);
      let checkUserName = await userRepo.getByField(chkuserName);

      if (!_.isEmpty(checkEmail)) {
        req.flash("error", "Sorry, account already exist with this email.");
        return res.redirect(namedRouter.urlFor("admin.user.listing"));
      }

      if (!_.isEmpty(checkPhone)) {
        req.flash(
          "error",
          "Sorry, account already exist with this phone-number."
        );
        return res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
      if (!_.isEmpty(checkUserName)) {
        req.flash("error", "Sorry, account already exist with this user-name.");
        return res.redirect(namedRouter.urlFor("admin.user.listing"));
      }

      if (req.files && req.files.length) {
        for (let file of req.files) {
          console.log(file);
          req.body[file.fieldname] = file.filename;
        }
      }
      req.body.isSignupCompleted = true;
      // req.body.isGenderVerified = true;
      // req.body.manualGenderVeificationStatus = "accept";

      let saveUser = await userRepo.save(req.body);
      // console.log(saveUser,"RRRRRRRRRRRRRRRRRRRRRRRRRR");
      if (saveUser && saveUser._id) {
        utils.saveUserActivity({
          userId: saveUser._id,
          title: "Account Created!",
          description:
            (req.user.full_name
              ? req.user.full_name
              : req.user.first_name + " " + req.user.last_name) +
            " has created User account.",
        });

        let emailData = {
          name: saveUser.first_name,
          email: saveUser.email,
          password: readable_pass,
        };
        await mailHelper.sendMail(
          `${project_name} Admin<${config.sendgrid.from_email}>`,
          saveUser.email,
          `Registration Successful || ${project_name}`,
          "admin-user-registration",
          emailData
        );
        req.flash("success", "Account created successfully");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      } else {
        req.flash("error", "Failed to create new account");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (e) {
      console.log(e);
      req.flash("error", e.message);
      //res.status(500).send({message: error.message});
      res.redirect(namedRouter.urlFor("admin.user.listing"));
    }
  }

  /* @Method: list
    // @Description: To get all the User from DB
    */
  async list(req, res) {
    try {
      let status = "";
      if (req.query.status) {
        status = req.query.status;
      }
      let userRole = await roleRepo.getByField({ role: "user" });
      let totalUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        role: userRole._id,
      });
      let recentUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        createdAt: { $gte: new Date(moment().subtract(24, "hours").format()) },
        role: userRole._id,
      });
      let activeUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        status: "Unblock",
        role: userRole._id,
      });
      let bannedUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        status: "Banned",
        role: userRole._id,
      });
      let inactiveUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        status: "Block",
        role: userRole._id,
      });
      res.render("user/views/list.ejs", {
        page_name: "user-management",
        page_title: "User Management",
        user: req.user,
        status,
        stats: {
          totalUsers,
          recentUsers,
          activeUsers,
          bannedUsers,
          inactiveUsers,
        },
      });
    } catch (e) {
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /*
    @Method : renderEditPage
    @Desc : to render edit page 
     */

  async renderEditPage(req, res) {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const getuser = await userRepo.getUserDetails({
        _id: id,
        isDeleted: false,
      });
      const date = new Date(getuser[0].dob);
      const formattedDate = date.toISOString().split("T")[0];
      delete getuser.dob;
      let response = {
        ...getuser[0],
        dob: formattedDate,
      };

      // console.log(getuser,"##################");

      res.render("user/views/edit.ejs", {
        page_name: "user-management",
        page_title: "Users Edit",
        user: req.user,
        response: response,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  /**
   * @Method renderAddPage
   * @Description to render user add page
   */
  async renderAddPage(req, res) {
    res.render("user/views/add.ejs", {
      page_name: "user-management",
      page_title: "Add User",
      user: req.user,
      // response:getuser[0],
    });
  }

  /* @Method: getAllUser
    // @Description: To get all the User from DB
    */
  async getAllUser(req, res) {
    try {
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      let currentPage = 1;
      if (start > 0) {
        currentPage = parseInt((start + length) / length);
      }
      req.body.page = currentPage;
      req.body.role = "user";
      let user = await userRepo.getAllUsers(req);
      let data = {
        recordsTotal: user.total,
        recordsFiltered: user.total,
        data: user.docs,
      };
      return {
        status: 200,
        data: data,
        message: `Data fetched successfully.`,
      };
    } catch (e) {
      return {
        status: 500,
        data: [],
        message: e.message,
      };
    }
  }

  /* @Method: getAllUser
    // @Description: To get all the User from DB
    */
  async getAllManualCheckUser(req, res) {
    try {
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      let currentPage = 1;
      if (start > 0) {
        currentPage = parseInt((start + length) / length);
      }
      req.body.page = currentPage;
      req.body.role = "user";
      let user = await userRepo.getAllManualCheckUsers(req);
      let data = {
        recordsTotal: user.total,
        recordsFiltered: user.total,
        data: user.docs,
      };
      return {
        status: 200,
        data: data,
        message: `Data fetched successfully.`,
      };
    } catch (e) {
      return {
        status: 500,
        data: [],
        message: e.message,
      };
    }
  }

  /**
   * @Method: detail
   * @Description: To get User account detail information
   */
  async detail(req, res) {
    try {
      let details = await userRepo.getById(
        new mongoose.Types.ObjectId(req.params.id)
      );
      if (!_.isEmpty(details)) {
        let activities =
          await userActivityTimelinesRepo.getAllByFieldWithSortAndLimit(
            { userId: details._id, isDeleted: false },
            { createdAt: -1 },
            10
          );
        res.render("user/views/user-details.ejs", {
          page_name: "user-management",
          page_title: "User Account",
          user: req.user,
          response: details,
          activities: activities ? activities : [],
        });
      } else {
        req.flash("error", "Sorry User not found!");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * @Method: requestDetails
   * @Description: To get User account detail information
   */
  async requestDetails(req, res) {
    try {
      let details = await userRepo.getById(
        new mongoose.Types.ObjectId(req.params.id)
      );
      if (!_.isEmpty(details)) {
        // let activities = await userActivityTimelinesRepo.getAllByFieldWithSortAndLimit({ userId: details._id, isDeleted: false }, { createdAt: -1 }, 10);
        res.render("user/views/user-request-details.ejs", {
          page_name: "manual-check-user-management",
          page_title: "Face Recognition Rrequest Details",
          user: req.user,
          response: details,
          // activities: activities ? activities : []
        });
      } else {
        req.flash("error", "Sorry User not found!");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * @Method: userSecurity
   * @Description: To get User security information
   */
  async userSecurity(req, res) {
    try {
      let details = await userRepo.getByIdWithUserDevices(
        new mongoose.Types.ObjectId(req.params.id)
      );
      if (!_.isEmpty(details)) {
        res.render("user/views/user-security.ejs", {
          page_name: "user-management",
          page_title: "User Security",
          user: req.user,
          response: details,
        });
      } else {
        req.flash("error", "Sorry User not found!");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (e) {
      throw e;
    }
  }

  /* @Method: resetPassword
    // @Description: user Reset Password
    */
  async resetPassword(req, res) {
    try {
      let user = await userRepo.getById(req.params.id);
      if (user) {
        let random_pass = utils.betweenRandomNumber(10000000, 99999999);
        let readable_pass = random_pass;
        random_pass = new User().generateHash(random_pass);
        let userUpdate = await userRepo.updateById(
          {
            password: random_pass,
          },
          user._id
        );
        if (!userUpdate) {
          req.flash("error", "Account Not Found.");
          res.redirect(namedRouter.urlFor("admin.user.listing"));
        } else {
          utils.saveUserActivity({
            userId: userUpdate._id,
            title: "Account Password Reset!",
            description:
              (req.user.full_name
                ? req.user.full_name
                : req.user.first_name + " " + req.user.last_name) +
              " has reset User account password.",
          });
          let emailData = { name: user.fullName, password: readable_pass };
          await mailHelper.sendMail(
            `${project_name} Admin<${config.sendgrid.from_email}>`,
            user.email,
            `Reset Password || ${project_name}`,
            "admin-user-change-password",
            emailData
          );
          req.flash("success", "User will receive a new password via email.");
          res.redirect(namedRouter.urlFor("admin.user.view", { id: user._id }));
        }
      } else {
        req.flash("error", "Account not found.");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /* @Method: delete
    // @Description: user Delete
    */
  async delete(req, res) {
    try {
      let userDelete = await userRepo.updateById(
        {
          isDeleted: true,
        },
        req.params.id
      );
      if (!_.isEmpty(userDelete) && userDelete._id) {
        utils.deleteUserActivity({ userId: userDelete._id });
        req.flash("success", "Account Deleted Successfully");
        if (userDelete.profile_image) {
          if (
            fs.existsSync(
              "./public/uploads/user/profile_pic/" + userDelete.profile_image
            )
          ) {
            fs.unlinkSync(
              "./public/uploads/user/profile_pic/" + userDelete.profile_image
            );
          }
        }
      } else {
        req.flash("error", "Failed to delete account");
      }
      res.redirect(namedRouter.urlFor("admin.user.listing"));
    } catch (e) {
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /*
        @Method: statusChange
        @Description: Change The status Of User
    
    */
  async statusChange(req, res) {
    try {
      let userInfo = await userRepo.getById(req.params.id);
      if (!_.isEmpty(userInfo)) {
        let userStatus = req.query.status;
        let userUpdate = await userRepo.updateById(
          { status: userStatus },
          req.params.id
        );
        if (!_.isEmpty(userUpdate) && userUpdate._id) {
          utils.saveUserActivity({
            userId: userUpdate._id,
            title: "Account Status Changed!",
            description:
              (req.user.full_name
                ? req.user.full_name
                : req.user.first_name + " " + req.user.last_name) +
              ' has changed account status from <b>"' +
              userInfo.status +
              '"</b> to <b>"' +
              userStatus +
              '"</b>.',
          });
          req.flash("success", "Account Status Has Been Changed Successfully");
        } else {
          req.flash("error", "Something went wrong!");
        }
        if (req.query.path) {
          res.redirect(req.query.path);
        } else {
          res.redirect(namedRouter.urlFor("admin.user.listing"));
        }
      } else {
        req.flash("error", "Account status has not been changed successfully");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (err) {
      throw err;
    }
  }

  /*
        @Method: userUpdatePassword
        @Description: User password change
    */
  async userUpdatePassword(req, res) {
    try {
      let user = await userRepo.getById(req.body.id);
      if (user && user._id) {
        let new_password = new User().generateHash(req.body.newPassword);
        let userUpdate = await userRepo.updateById(
          {
            password: new_password,
          },
          user._id
        );

        if (userUpdate && userUpdate._id) {
          utils.saveUserActivity({
            userId: userUpdate._id,
            title: "Account Password Changed!",
            description:
              (req.user.full_name
                ? req.user.full_name
                : req.user.first_name + " " + req.user.last_name) +
              " has changed account password.",
          });
          let emailData = {
            name: user.fullName,
            password: req.body.newPassword,
          };
          await mailHelper.sendMail(
            `${project_name} Admin<${config.sendgrid.from_email}>`,
            user.email,
            `Change Password || ${project_name}`,
            "admin-user-change-password",
            emailData
          );
          req.flash(
            "success",
            "Account password has been changed successfully."
          );
        } else {
          req.flash("error", "Failed to update password.");
        }
        res.redirect(
          namedRouter.urlFor("admin.user.security", { id: user._id })
        );
      } else {
        req.flash("error", "Something went wrong! No account found.");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (e) {
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /* @Method: Dashboard
    // @Description: User Dashboard
    */
  async dashboard(req, res) {
    try {
      let greetings_data = await utils.returnGreetings();

      const getUserRole = await roleRepo.getByField({ role: "user" });

      let totalUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        role: getUserRole._id,
      });
      let activeUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        role: getUserRole._id,
        status: "Unblock",
      });
      let inActiveUsers = await userRepo.getUserCountByParam({
        isDeleted: false,
        role: getUserRole._id,
        status: "Block",
      });

      let totalFaqUsers = await faqRepo.getFaqCountByParam({
        isDeleted: false,
      });
      let activeFaqUsers = await faqRepo.getFaqCountByParam({
        isDeleted: false,
        status: "Active",
      });
      let inActiveFaqUsers = await faqRepo.getFaqCountByParam({
        isDeleted: false,
        status: "Inactive",
      });

      let totalCategory = await CategoryRepository.getCountByParam({
        isDeleted: false,
      });
      let totalActiveCategory = await CategoryRepository.getCountByParam({
        isDeleted: false,
        status: "Active",
      });
      let totalInactiveCategory = await CategoryRepository.getCountByParam({
        isDeleted: false,
        status: "Inactive",
      });

      /* Html render here */
      res.render("user/views/dashboard.ejs", {
        page_name: "user-dashboard",
        page_title: "Dashboard",
        user: req.user,
        greetings_data,

        totalUsers,
        activeUsers,
        inActiveUsers,

        totalFaqUsers,
        activeFaqUsers,
        inActiveFaqUsers,

        totalCategory,
        totalActiveCategory,
        totalInactiveCategory,
      });
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  }

  /* @Method: Logout
    // @Description: User Logout
    */
  async logout(req, res) {
    try {
      if (req.session.token) {
        let findDevice = await userDevicesRepo.getByField({
          access_token: req.session.token,
          isDeleted: false,
          userId: req.user._id,
        });
        if (findDevice) {
          await userDevicesRepo.delete(findDevice._id);
        }
      }

      req.session.destroy(function (err) {
        res.redirect("/");
      });
    } catch (e) {
      console.log(e);
      res.redirect("/");
    }
  }

  /* @Method: viewmyprofile
    // @Description: To get Admin Profile Info from db
    */
  async viewmyprofile(req, res) {
    try {
      const id = req.params.id;
      let user = await userRepo.getById(id);
      if (!_.isEmpty(user)) {
        res.render("user/views/admin-account.ejs", {
          page_name: "admin-settings",
          page_title: "Account",
          user: req.user,
          response: user,
        });
      }
    } catch (e) {
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /* @Method: security
    // @Description: To get Admin Profile Security from db
    */
  async security(req, res) {
    try {
      const id = req.params.id;
      let user = await userRepo.getByIdWithUserDevices(id);
      if (!_.isEmpty(user)) {
        res.render("user/views/admin-security.ejs", {
          page_name: "admin-security",
          page_title: "Security",
          user: req.user,
          response: user,
          current_token: req.session.token,
        });
      }
    } catch (e) {
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /* @Method: revokeUserAccess
    // @Description: To Remove Any User Access from db
    */
  async revokeUserAccess(req, res) {
    try {
      let access_id = new mongoose.Types.ObjectId(req.params.access);
      await userDevicesRepo.updateById({ expired: true }, access_id);

      req.flash("success", "Account Access Revoked Successfully.");
      if (req.query.path) {
        res.redirect(req.query.path);
      } else {
        res.redirect(namedRouter.urlFor("user.dashboard"));
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /**
   * @Method: update
   * @Description: update user information action
   */
  async update(req, res) {
    try {
      req.body.email = req.body.email.trim().toLowerCase();
      req.body.phone = req.body.phone.trim();
      req.body.userName = req.body.userName.trim();
      req.body.user_type = "normal";
      // req.body.age = utils.calculateAge(req.body.dob);
      req.body = await utils.handleNameFields(req.body);
      // req.body.phone = req.body.phone.trim();
      let chkEmail = {
        isDeleted: false,
        email: { $regex: "^" + req.body.email + "$", $options: "i" },
        _id: { $ne: new mongoose.Types.ObjectId(req.body.id) },
      };
      let checkEmail = await userRepo.getByField(chkEmail);
      let chkPhone = {
        isDeleted: false,
        phone: req.body.phone,
        _id: { $ne: new mongoose.Types.ObjectId(req.body.id) },
      };
      let checkPhone = await userRepo.getByField(chkPhone);

      let chkUserName = {
        isDeleted: false,
        phone: { $regex: "^" + req.body.phone + "$", $options: "i" },
        _id: { $ne: new mongoose.Types.ObjectId(req.body.id) },
      };
      let checkUsername = await userRepo.getByField(chkUserName);

      if (!_.isEmpty(checkEmail)) {
        req.flash("error", "Email already used for another account.");
        res.redirect(
          namedRouter.urlFor("admin.user.view", {
            id: req.body.id,
          })
        );
      }
      let accountDetails = await userRepo.getById(req.body.id);
      if (req.files && req.files.length) {
        for (let file of req.files) {
          if (
            accountDetails &&
            accountDetails[file.fieldname] &&
            fs.existsSync(
              "./public/uploads/user/profile_pic/" +
                accountDetails[file.fieldname]
            )
          ) {
            fs.unlinkSync(
              "./public/uploads/user/profile_pic/" +
                accountDetails[file.fieldname]
            );
          }
          req.body[file.fieldname] = file.filename;
        }
      }
      let userUpdate = await userRepo.updateById(
        req.body,
        new mongoose.Types.ObjectId(req.body.id)
      );
      if (_.isObject(userUpdate) && userUpdate._id) {
        utils.saveUserActivity({
          userId: userUpdate._id,
          title: "Account Updated!",
          description:
            (req.user.full_name
              ? req.user.full_name
              : req.user.first_name + " " + req.user.last_name) +
            " has updated User account.",
        });
        req.flash("success", "User updated successfully.");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      } else {
        req.flash("error", "Failed to update User account.");
        res.redirect(namedRouter.urlFor("admin.user.listing"));
      }
    } catch (e) {
      console.log(e);
      req.flash("error", e.message);
      res.redirect(namedRouter.urlFor("admin.user.listing"));
    }
  }

  /* @Method: updateAdminProfile
    // @Description: Update admin Profile 
    */
  async updateAdminProfile(req, res) {
    try {
      const id = new mongoose.Types.ObjectId(req.body.id);
      req.body.email = req.body.email.trim().toLowerCase();
      let userAvail = await userRepo.getByField({
        email: { $regex: "^" + req.body.email.trim() + "$", $options: "i" },
        _id: { $ne: id },
        isDeleted: false,
      });
      if (userAvail) {
        req.flash(
          "error",
          "Email address already taken for some other account."
        );
        res.redirect(
          namedRouter.urlFor("admin.profile", {
            id: id,
          })
        );
      } else {
        let userData = await userRepo.getByField({ _id: id });
        /* We are remove profile image after delete the user, because that user's image no more need and also increase the memory on server*/
        if (req.files && req.files.length) {
          for (let file of req.files) {
            if (userData.profile_image && file.fieldname == "profile_image") {
              if (
                fs.existsSync(
                  "./public/uploads/user/" + userData.profile_image
                ) &&
                userData.profile_image
              ) {
                fs.unlinkSync(
                  "./public/uploads/user/" + userData.profile_image
                );
              }
            }
            req.body.profile_image = file.filename;
          }
        }
        req.body.full_name = `${req.body.first_name} ${req.body.last_name}`;
        let userUpdate = await userRepo.updateById(req.body, id);
        if (!_.isEmpty(userUpdate) && userUpdate._id) {
          req.flash("success", "Profile updated successfully.");
          res.redirect(namedRouter.urlFor("user.dashboard"));
        } else {
          req.flash("error", "Failed to update profile.");
          res.redirect(
            namedRouter.urlFor("admin.profile", {
              id: id,
            })
          );
        }
      }
    } catch (err) {
      return res.status(500).send({
        message: err.message,
      });
    }
  }

  /*
        @Method: adminUpdatePassword
        @Description: Admin password change
    */
  async adminUpdatePassword(req, res) {
    try {
      let user = await userRepo.getById(req.body.id);
      if (!_.isEmpty(user)) {
        if (!user.validPassword(req.body.old_password, user.password)) {
          req.flash("error", "Sorry current password mismatched!");
          res.redirect(namedRouter.urlFor("admin.security", { id: user._id }));
        } else {
          if (req.body.password != req.body.old_password) {
            let new_password = new User().generateHash(req.body.password);
            let userUpdate = await userRepo.updateById(
              {
                password: new_password,
              },
              user._id
            );

            if (userUpdate && userUpdate._id) {
              req.flash(
                "success",
                "Your password has been changed successfully."
              );
              res.redirect(namedRouter.urlFor("user.login"));
            } else {
              req.flash("error", "Failed to update password.");
              res.redirect(namedRouter.urlFor("user.dashboard"));
            }
          } else {
            req.flash(
              "error",
              "Your New Password And Old Password should not match."
            );
            res.redirect(
              namedRouter.urlFor("admin.security", { id: user._id })
            );
          }
        }
      } else {
        req.flash("error", "Something went wrong! No user found.");
        res.redirect(namedRouter.urlFor("admin.security", { id: user._id }));
      }
    } catch (e) {
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /*
        @Method: forgotPassword
        @Description: User forgotPassword
    */
  async forgotPassword(req, res) {
    try {
      req.body.email = req.body.email.trim().toLowerCase().toString();
      let roleDetails = await roleRepo.getByField({ role: "admin" });
      let result = {};
      let userData = await User.findOne({
        email: { $regex: "^" + req.body.email + "$", $options: "i" },
        role: { $in: [roleDetails._id] },
      }).exec();
      if (!userData) {
        result.status = 500;
        // return res.status(201).send({ "result": result, "message": "User not found", "status": false });
        req.flash("error", "User not found");
        res.redirect(namedRouter.urlFor("user.login"));
      } else {
        let random_pass = utils.betweenRandomNumber(10000000, 99999999);
        // console.log(random_pass,'random_passrandom_pass');
        let readable_pass = `${random_pass}`;
        random_pass = new User().generateHash(readable_pass);
        // console.log(random_pass,'random_pass');
        let user_details = await userRepo.updateById(
          { password: random_pass },
          userData._id
        );
        if (!user_details) {
          result.status = 500;
          // return res.status(201).send({ "result": result, "message": "User not found", "status": false });
          req.flash("error", "User not found");
          res.redirect(namedRouter.urlFor("user.login"));
        } else {
          let emailData = {
            name: userData.first_name,
            password: readable_pass,
          };
          let sendMail = await mailHelper.sendMail(
            `${project_name} Admin<${process.env.GMAIL_APP_EMAIL}>`,
            userData.email,
            `Reset Password || ${project_name}`,
            "admin-user-change-password",
            emailData
          );

          if (sendMail) {
            console.log("mail send");
            req.flash(
              "success",
              "New password has been sent in your register email"
            );
            res.redirect(namedRouter.urlFor("user.login"));
          } else {
            req.flash("error", "Failed to trigger mail");
            res.redirect(namedRouter.urlFor("user.login"));
          }
        }
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send({ message: e.message });
    }
  }

  /**
   * @Method: bookingInfoList
   * @Description: view user information action
   */
  async bookingInfoList(req, res) {
    try {
      let status = "";
      if (req.query.status) {
        status = req.query.status;
      }
      res.render("user/views/bookingList.ejs", {
        page_name: "user-management",
        page_title: "Users Bookig",
        user: req.user,
        status,
        user_id: req.params.id,
      });
    } catch (e) {
      return res.status(500).send({
        message: e.message,
      });
    }
  }

  /**
   * @Method: bookingInfoList
   * @Description: view user information action
   */
  // async getAllBookingInfo (req,res){
  //     try {

  //         // console.log(req.params.id);

  //         let start = parseInt(req.body.start);
  //         let length = parseInt(req.body.length);
  //         let currentPage = 1;
  //         if (start > 0) {
  //             currentPage = parseInt((start + length) / length);
  //         }
  //         req.body.page = currentPage;

  //         let user = await bookingRepo.getAllBookingInfoforUsers(req);
  //         let data = {
  //             "recordsTotal": user.total,
  //             "recordsFiltered": user.total,
  //             "data": user.docs
  //         };
  //         return {
  //             status: 200,
  //             data: data,
  //             message: `Data fetched successfully.`
  //         };

  //     } catch (e) {
  //         return {
  //             status: 500,
  //             data: [],
  //             message: e.message
  //         };
  //     }
  // }
  /**
   * @Method verifyGender
   * @Description to verify gender of the user
   */
  async verifyGender(req, res) {
    try {
      req.params.id = new mongoose.Types.ObjectId(req.params.id);
      let userInfo = await userRepo.getById(req.params.id);
      if (!_.isEmpty(userInfo)) {
        let payload = {};

        let description = "";
        // console.log(req.query.status,"######### $$$$$$$$$$$$$$$$$$$$$");
        if (req.query.status == "accept") {
          payload.isGenderVerified = true;
          payload.manualGenderVeificationStatus = "accept";
          description =
            (req.user.full_name
              ? req.user.full_name
              : req.user.first_name + " " + req.user.last_name) +
            ' has verified gender of  <b>"' +
            userInfo.fullName +
            '"</b>';
        } else {
          payload.manualGenderVeificationStatus = "reject";
          description =
            (req.user.full_name
              ? req.user.full_name
              : req.user.first_name + " " + req.user.last_name) +
            ' has not verified gender of  <b>"' +
            userInfo.fullName +
            '"</b>';
        }
        // console.log(description,"#########");
        // console.log(payload,"#########");

        // let userStatus = req.query.status;
        let userUpdate = await userRepo.updateById(payload, req.params.id);
        // console.log(userUpdate,"#########");
        if (!_.isEmpty(userUpdate) && userUpdate._id) {
          utils.saveUserActivity({
            userId: userUpdate._id,
            title: "Account gender verified!",
            description: description,
          });
          if (userUpdate.manualGenderVeificationStatus == "accept") {
            req.flash("success", "Account Verified Successfully");
          } else {
            req.flash("success", "Account Rejected Successfully");
          }
        } else {
          req.flash("error", "Something went wrong!");
        }
        if (req.query.path) {
          res.redirect(req.query.path);
        } else {
          res.redirect(namedRouter.urlFor("admin.user.manual-chack.listing"));
        }
      } else {
        req.flash("error", "User not found");
        res.redirect(namedRouter.urlFor("admin.user.manual-chack.listing"));
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send({ message: e.message });
    }
  }
}

module.exports = new UserController();
