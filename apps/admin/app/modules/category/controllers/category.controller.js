const express = require("express");
const routeLabel = require("route-label");
const router = express.Router();
const namedRouter = routeLabel(router);
const querystring = require("querystring");
const fs = require("fs");
const CategoryRepository = require("../repositories/category.repository");
const mongoose = require("mongoose");

class CategoryController {
  constructor() {}

  /**
   * @Method list
   * @Description To Show The Category Listing Page
   */
  async list(req, res) {
    try {
      let status = "";
      if (req.query.status) {
        status = req.query.status;
      }

      let data = await CategoryRepository.getStats(req);
      res.render("category/views/list", {
        page_name: "category-management",
        page_title: "Category List",
        user: req.user,
        status,
        data,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method getAll
   * @Description Get All Category
   */
  async getAll(req, res) {
    try {
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      let currentPage = 1;
      if (start > 0) {
        currentPage = parseInt((start + length) / length);
      }
      req.body.page = currentPage;
      let category = await CategoryRepository.getAll(req);

      let data = {
        recordsTotal: category.total,
        recordsFiltered: category.total,
        data: category.docs,
      };
      return {
        status: 200,
        data: data,
        message: `Data fetched successfully.`,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method renderAddFaqPage
   * @Description to render add Category page
   */

  async renderAddDealPage(req, res) {
    try {
      const category = await CategoryRepository.getAllByField({
        parentId: null,
        isDeleted: false,
        status: "Active",
      });
      res.render("category/views/add", {
        page_name: "category-management",
        page_title: "Add Category",
        user: req.user,
        category,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method insert
   * @Description To Insert Category Management Data To Collection
   */
  async insert(req, res) {
    try {
      if (_.isEmpty(req.body.title)) {
        req.flash("error", "Field Should Not Be Empty!");
        res.redirect(namedRouter.urlFor("category.add"));
      }
      req.body.title = req.body.title.trim();

      if (!_.isEmpty(req.body.parentId)) {
        req.body.parentId = new mongoose.Types.ObjectId(req.body.parentId);
      }else{
        req.body.parentId = null
      }
      if(!_.isEmpty(req.files))
      {
        req.body.image = req.files[0].filename;
      }
      
      // console.log(" req.body.image: ",  req.body.image);
      const save = await CategoryRepository.save(req.body);
      if (!_.isEmpty(save) && save._id) {
        req.flash("success", "Category Added Successfully");
        res.redirect(namedRouter.urlFor("admin.category.listing"));
      } else {
        req.flash("error", "Category Failed To Add!");
        res.redirect(namedRouter.urlFor("category.add"));
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  /**
   * @Method renderEditpage
   * @Description to render category edit page
   */
  async renderEditpage(req, res) {
    try {
      const getData = await CategoryRepository.getByField({
        _id: new mongoose.Types.ObjectId(req.params.id),
        isDeleted: false,
      });
      const category = await CategoryRepository.getAllByField({parentId: { $eq: null }, isDeleted: false})
      console.log("getData: ", getData);

      console.log("category: ", category);
      res.render("category/views/edit", {
        page_name: "category-management",
        page_title: "Edit Category",
        user: req.user,
        response: getData,
        category
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method update
   * @Description To Update Data
   */
  async update(req, res) {
    try {

      req.body.title = req.body.title.trim();

      if (_.isEmpty(req.body.title)) {
        req.flash("error", "Field Should Not Be Empty!");
        res.redirect(namedRouter.urlFor("admin.category.listing"));
      } else {
        if (!_.isEmpty(req.body.parentId)) {
          req.body.parentId = new mongoose.Types.ObjectId(req.body.parentId);
        }else{
          req.body.parentId = null
        }
        
        const categorylId = new mongoose.Types.ObjectId(req.body.id);

        // Check if category with the same title already exists
        let isCategoryExists = await CategoryRepository.getByField({
          title: { $regex: req.body.title.trim(), $options: "i" },
          _id: { $ne: categorylId },
          isDeleted: false,
        });

        if (!_.isEmpty(isCategoryExists)) {
          req.flash("error", "Category Already Exists!");
          res.redirect(
            namedRouter.urlFor("admin.category.listing", { id: categorylId })
          );
        } else {
          // Fetch current category record to get old image path
          let existingCategory = await CategoryRepository.getById(categorylId);

          // Handle image upload
          if (req.files && req.files.length > 0) {
            // Unlink (delete) the old image file
            if (existingCategory.image) {
              const oldImagePath = `./public/uploads/category/${existingCategory.image}`;
              if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
              }
            }

            // Save new image filename to req.body.image
            req.body.image = req.files[0].filename;
          } else {
            // If no new file uploaded, retain old image in the database
            req.body.image = existingCategory.image;
          }

          // Update the category record
          let updatedCategory = await CategoryRepository.updateById(
            req.body,
            categorylId
          );

          if (!_.isEmpty(updatedCategory) && updatedCategory._id) {
            req.flash("success", "Category Updated Successfully");
            res.redirect(namedRouter.urlFor("admin.category.listing"));
          } else {
            req.flash("error", "Category Failed To Update!");
            res.redirect(namedRouter.urlFor("admin.category.listing"));
          }
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method statusChange
   * @Description To Change The Status
   */
  async statusChange(req, res) {
    try {
      let data = await CategoryRepository.getById(req.params.id);
      if (!_.isEmpty(data)) {
        let dataStatus = data.status == "Active" ? "Inactive" : "Active";
        await CategoryRepository.updateById(
          { status: dataStatus },
          req.params.id
        );

        req.flash("success", "Status Has Been Changed Successfully");
        res.redirect(namedRouter.urlFor("admin.category.listing"));
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * @Method delete
   * @Description Delete Data
   */
  async delete(req, res) {
    try {
      let dealData = await CategoryRepository.getById(req.params.id);
      if (!_.isEmpty(dealData)) {
        let deleteDeal = await CategoryRepository.updateById(
          { isDeleted: true },
          dealData._id
        );
        if (!_.isEmpty(deleteDeal) && deleteDeal._id) {
          req.flash("success", "Category Deleted Successfully");
          res.redirect(namedRouter.urlFor("admin.category.listing"));
        } else {
          req.flash("error", "Sorry Category Not Deleted");
          res.redirect(namedRouter.urlFor("admin.category.listing"));
        }
      } else {
        req.flash("error", "Sorry Category not found");
        res.redirect(namedRouter.urlFor("admin.category.listing"));
      }
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new CategoryController();
