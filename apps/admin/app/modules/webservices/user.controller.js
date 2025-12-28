const userModel = require("../user/models/user.model")
const userRepo = require("../user/repositories/user.repository")
const roleRepo = require("../role/repositories/role.repository")
const refreshTokenRepo = require("../refreshToken/repositories/refresh.token.repository");
const _ = require("lodash")
const validator = require("../../validators/user")
const jwt = require("jsonwebtoken")
const notificationRepo = require("../notification/repositories/notification.repository")

// response helper
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const requestHandler = new RequestHandler(logger);
// response helper

const fs = require("fs")
const utils = require("../../helper/utils")
let mailHelper = require("../../helper/gmailMailer")
const moment = require("moment")
let stripe = require("../../helper/stripe")
const { default: mongoose } = require("mongoose")
const helper = require("../../helper/helper")

const normalizeDeviceType = (deviceTypeValue) => {
    const deviceTypeMap = {
        ios: 'ios',
        iphone: 'ios',
        ipad: 'ios',
        apple: 'ios',
        android: 'android'
    };

    if (!deviceTypeValue) {
        return undefined;
    }

    const normalizedValue = deviceTypeValue.toString().trim().toLowerCase();
    return deviceTypeMap[normalizedValue];
};


class UserControllerApi {

    async signup(req, res) {
        try {
            console.log(req.body);
            const validationError = await validator.signup(req.body);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            const deviceToken = req.body.deviceToken || req.body.device_token;
            const normalizedDeviceType = normalizeDeviceType(req.body.deviceType || req.body.device_type);

            const user = new userModel()
            const userRole = await roleRepo.getByField({ role: "user" });

            if (!userRole || !userRole._id) {
                return requestHandler.throwError(500, 'Internal Server Error', 'User role is not configured')()
            }

            const newUserData = {
                ...req.body,
                role: userRole._id,
                password: user.generateHash(req.body.password)
            };

            if (deviceToken) {
                newUserData.device_token = deviceToken;
            }

            if (normalizedDeviceType) {
                newUserData.device_type = normalizedDeviceType;
            }

            const emailExists = await userRepo.getByField({ email: req.body.email, isDeleted: false });
            console.log(emailExists);

            if (!_.isNil(emailExists)) {
                console.log("Sorry, account already exist with this email.");
                return requestHandler.throwError(400, 'A User with same email is already exist')()
            }

            if (req.body.password !== req.body.confirmPassword) {
                return requestHandler.throwError(400, 'Password and Confirm Password do not match')()
            }

            // console.log(req.body);
            let saved = await userRepo.save(newUserData);
            console.log("saved: ", saved);
            if (!_.isEmpty(saved) && saved._id) {

                // console.log("User Successfully saved");
                let payload = {
                    id: saved._id
                }
                let otp = await utils.otpGenerator();
                // let otp='1234'
                const otpExpirationTime = moment().add(10, 'minutes'); //moment
                let token = jwt.sign(payload, config.auth.jwtSecret, {
                    expiresIn: config.auth.jwt_expiresin.toString(), // token expiration time
                });

                let data = {
                    user_fullname: req.body.fullName,
                    verification_code: otp
                }
                let project_name = "Sysavings"

                let sendMail = await mailHelper.sendMail(
                    `${project_name} Admin<${process.env.SITE_EMAIL}>`,
                    req.body.email,
                    `Email Verification || ${project_name}`,
                    "api-signup",
                    data
                );

                if (!_.isEmpty(sendMail)) {
                    console.log("User Succesfully SignUp");
                    await userRepo.updateByField({ otp, otpExpireTime: otpExpirationTime }, { _id: saved._id })
                    return requestHandler.sendSuccess(res, 'Mail Sent Successfully')(saved, { token: token });
                } else {
                    return requestHandler.throwError(400, "Error in sending Mail");
                }
            }


        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async emailVerified(req, res) {
        try {

            const validationError = await validator.otp(req.body);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            let matchOTP = await userRepo.getByField({
                otp: req.body.otp,
                email: req.user.email
            });
            if (_.isNull(matchOTP)) {
                return requestHandler.throwError(400, "OTP does not match")();
            }

            const currentTime = new Date();

            if (matchOTP.otpExpireTime < currentTime) {
                return requestHandler.throwError(400, "OTP has expired")();
            }
            // let payload = {
            //     id: matchOTP._id
            // }
            // let token = jwt.sign(payload, config.auth.jwtSecret, {
            //     expiresIn: config.auth.jwt_expiresin.toString(), // token expiration time
            // });
            let updatedData = await userRepo.updateByField({ isEmailVerified: true }, { _id: matchOTP._id })
            if (!_.isEmpty(updatedData)) {
                return requestHandler.sendSuccess(res, 'Email Verified Successfully')(updatedData);
            }

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async resendEmailVerify(req, res) {
        try {
            // console.log('hittttttt');

            const validationError = await validator.forgetPassword(req.body);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            let emailExists = await userRepo.getByField({ email: req.body.email })
            // console.log(emailExists);

            if (_.isNull(emailExists)) {
                return requestHandler.throwError(400, "User does not exists")();
            }
            let otp = await utils.otpGenerator();
            const otpExpirationTime = moment().add(10, 'minutes'); //moment
            let payload = {
                id: emailExists._id
            }
            let token = jwt.sign(payload, config.auth.jwtSecret, {
                expiresIn: config.auth.jwt_expiresin.toString(), // token expiration time
            });
            let data = {
                user_fullname: emailExists.fullName,
                verification_code: otp,
            }

            let sendMail = await mailHelper.sendMail(
                `${process.env.SITE_EMAIL}`,
                req.body.email,
                `Email Verification`,
                "api-signup",
                data
            );

            if (!_.isEmpty(sendMail)) {
                console.log("mail send");
                await userRepo.updateByField({ otp, otpExpireTime: otpExpirationTime }, { _id: emailExists._id })
                return requestHandler.sendSuccess(res, 'Mail Sent Successfully')(sendMail, { token: token });
            } else {
                return requestHandler.throwError(400, "Error in sending Mail");
            }

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async login(req, res) {
        try {
            // console.log(req.body);
            const validationError = await validator.login(req.body);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            const deviceToken = req.body.deviceToken || req.body.device_token;
            const normalizedDeviceType = normalizeDeviceType(req.body.deviceType || req.body.device_type);

            const user = new userModel()
            let emailExists = await userRepo.getByField({ email: req.body.email, isDeleted: false })
            // console.log(emailExists);
            if (_.isEmpty(emailExists)) {
                return requestHandler.throwError(404, 'Email Does Not Exist')()
            }
            if (!_.isEmpty(emailExists) && emailExists.isEmailVerified === false) {
                return requestHandler.throwError(403, 'Email is Not Verified Please Check you Mail For Verification')()
            }
            // console.log('hitttttttt');
            // console.log(user.validPassword(req.body.password,emailExists.password));

            if (user.validPassword(req.body.password, emailExists.password)) {
                let payload = {
                    id: emailExists._id
                }

                let token = jwt.sign(payload, config.auth.jwtSecret, {
                    expiresIn: process.env.JWT_EXPIRES_IN, // token expiration time
                });
                const updateDeviceInfo = {};
                if (deviceToken) {
                    updateDeviceInfo.device_token = deviceToken;
                }
                if (normalizedDeviceType) {
                    updateDeviceInfo.device_type = normalizedDeviceType;
                }
                if (!_.isEmpty(updateDeviceInfo)) {
                    await userRepo.updateByField(updateDeviceInfo, { _id: emailExists._id })
                }
                let refresh_token = await helper.createRefreshToken(payload)
                let logincrediatials = {
                    email: req.body.email,
                    fullName: emailExists.fullName,
                    token: token,
                    refreshToken: refresh_token,
                    personalized_category: emailExists.personalized_category
                }
                if (!_.isEmpty(logincrediatials)) {
                    console.log("User Successfully saved");
                    return requestHandler.sendSuccess(res, 'User Login successfully')(logincrediatials);
                }

            }
            else {
                return requestHandler.throwError(400, 'Password is Wrong')()
            }

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async forgotpassword(req, res) {
        try {
            // console.log('hittttttt');

            const validationError = await validator.forgetPassword(req.body);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            let emailExists = await userRepo.getByField({ email: req.body.email })
            // console.log(emailExists);

            if (_.isNull(emailExists)) {
                return requestHandler.throwError(404, "User does not exists")();
            }
            let otp = await utils.otpGenerator();
            const otpExpirationTime = moment().add(10, 'minutes'); //moment
            let payload = {
                id: emailExists._id
            }
            let token = jwt.sign(payload, config.auth.jwtSecret, {
                expiresIn: config.auth.jwt_expiresin.toString(), // token expiration time
            });
            let data = {
                user_fullname: emailExists.fullName,
                verification_code: otp,
            }

            let sendMail = await mailHelper.sendMail(
                `${process.env.SITE_EMAIL}`,
                emailExists.email,
                `Forgot Password`,
                "forgot-password",
                data
            );

            if (!_.isEmpty(sendMail)) {
                console.log("mail send");
                await userRepo.updateByField({ otp, otpExpireTime: otpExpirationTime }, { _id: emailExists._id })
                return requestHandler.sendSuccess(res, 'Mail Sent Successfully')(sendMail, { token: token });
            } else {
                return requestHandler.throwError(400, "Error in sending Mail");
            }

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async validateOTP(req, res) {
        try {

            const validationError = await validator.otp(req.body);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            let matchOTP = await userRepo.getByField({
                otp: req.body.otp,
                email: req.user.email
            });
            if (_.isNull(matchOTP)) {
                return requestHandler.throwError(400, "OTP does not match")();
            }

            const currentTime = new Date();

            if (matchOTP.otpExpireTime < currentTime) {
                return requestHandler.throwError(400, "OTP has expired")();
            }
            let payload = {
                id: matchOTP._id
            }
            let token = jwt.sign(payload, config.auth.jwtSecret, {
                expiresIn: config.auth.jwt_expiresin.toString(), // token expiration time
            });
            let updatedData = await userRepo.updateByField({ isOtpVerified: true }, { _id: matchOTP._id })
            if (!_.isEmpty(updatedData)) {
                return requestHandler.sendSuccess(res, 'OTP Verified Successfully')({ token: token });
            }

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async resetPassword(req, res) {
        try {
            console.log(req.user);

            const validationError = await validator.resetPassword(req.body);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            let existData = await userRepo.getByField({ email: req.user.email })

            if (existData.isOtpVerified === false) {
                return requestHandler.throwError(400, "OTP is not Verified")();
            }

            if (req.body.password !== req.body.confirmPassword) {
                return requestHandler.throwError(400, "Password and Confirm Password Does Not Match")();
            }
            let user = new userModel();
            req.body.password = user.generateHash(req.body.password);
            let updatedPassword = await userRepo.updateByField({
                password: req.body.password,
                isOtpVerified: false
            }, { _id: req.user._id })
            if (!_.isEmpty(updatedPassword)) {
                return requestHandler.sendSuccess(res, 'Password Reset Successfully')(updatedPassword);
            }

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async profileDetails(req, res) {

        let userDetails = await userRepo.getByField({ _id: req.user._id })
        if (_.isEmpty(userDetails)) {
            return requestHandler.throwError(404, 'Email Does Not Exist')()
        }
        return requestHandler.sendSuccess(res, 'User Profile Fetched successfully')({
            fullName: userDetails.fullName,
            email: userDetails.email,
            profile_image: userDetails.profile_image,
            personalized_category: userDetails.personalized_category
        });

    }

    async updateProfile(req, res) {
        try {
            // console.log(req.user, "reqqqqqqqqqqq");

            const validationError = await validator.editProfile(req.body);
            console.log(validationError);

            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            let existData = await userRepo.getByField({
                _id: req.user._id
            })

            // let emailExists = await userRepo.getByField({
            //     email: req.body.email,
            //     _id: { $ne: req.user._id }
            // })

            // if (!_.isEmpty(emailExists)) {
            //     return requestHandler.throwError(400, "Email Already Exists")();
            // }
            // console.log(emailExists.profile_image);
            if (!_.isEmpty(req.file) && !_.isEmpty(existData.profile_image)) {
                if (fs.existsSync(`./public/uploads/users/${existData.profile_image}`)) {
                    fs.unlinkSync(`./public/uploads/users/${existData.profile_image}`);
                }
            }

            let data = {
                fullName: req.body.fullName,
                profile_image: !_.isEmpty(req.file) ? req.file.filename : existData.profile_image,
                // personalized_category: !_.isEmpty(personalized_category) ? req.body.personalized_category : []
            }
            console.log(data);

            let updatedData = await userRepo.updateByField(data, { _id: req.user._id });
            console.log(updatedData);

            if (!_.isEmpty(updatedData)) {
                return requestHandler.sendSuccess(res, 'User Profile Updated successfully')(updatedData);
            }
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }

    }

    async addBankDetails(req, res) {
        try {

            let savedBank = await stripe.accountCreateByExpress(req.body);
            if (!_.isEmpty(savedBank)) {
                return requestHandler.sendSuccess(res, 'Bank Account Created successfully')(savedBank.accountLink);
            }

        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async logout(req, res) {
        try {
            const token = req.headers['token'];
            requestHandler.sendSuccess(res, 'Logged out successfully')({ token: null });
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    };

    async changepassword(req, res) {
        try {
            let checkoldpass = new userModel().validPassword(req.body.old_password, req.user.password);
            if (checkoldpass === false) {
                return requestHandler.throwError(400, 'Old Password Do not Match')()
            }
            if (req.body.new_password !== req.body.confirm_password) {
                return requestHandler.throwError(400, 'Password and Confirm Password Do not Match')()
            }
            let savePassword = await userRepo.updateByField({ password: new userModel().generateHash(req.body.new_password) }, { _id: req.user._id });
            if (!_.isEmpty(savePassword)) {
                return requestHandler.sendSuccess(res, 'Change Password Successfully')(savePassword);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    async deleteUser(req, res) {
        try {
            let existData = await userRepo.getByField({ _id: req.user._id });
            if (!_.isEmpty(existData.profile_image)) {
                if (fs.existsSync(`./public/uploads/users/${existData.profile_image}`)) {
                    fs.unlinkSync(`./public/uploads/users/${existData.profile_image}`);
                }
            }
            let deletedData = await userRepo.updateByField({ isDeleted: true }, { _id: req.user._id });
            if (!_.isEmpty(deletedData)) {
                return requestHandler.sendSuccess(res, 'User Deleted Successfully')(deletedData);
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    async updatePersonalizedCategory(req, res) {
        try {
            // console.log(req.user);
            // console.log(req.body);
            // req.body["personalized_category"]=req.body;
            // console.log(req.body);
            let personlized_category = req.body
            console.log(personlized_category);


            // for(let obj of req.body)
            // {
            //     personalized_category[]
            // }
            let saved = await userRepo.updateByField({ personalized_category: req.body }, { _id: req.user._id });
            console.log(saved);

            if (!_.isEmpty(saved)) {
                return requestHandler.sendSuccess(res, 'User Personalize Category Updated Successfully')(saved);
            }
        }
        catch (error) {
            return requestHandler.sendError(req, res, error);
        }


    }

    async getDealsByUser(req, res) {

        let existData = await userRepo.getByField({ _id: req.user._id });
        // if(!_.isEmpty(existData.personalized_category))
        // {
        //     return requestHandler.throwError(400, 'Users List does not exist')()
        // }
        let allList = await userRepo.getAllDeals({ _id: new mongoose.Types.ObjectId(req.user._id) });
        if (_.isEmpty(allList)) {
            return requestHandler.throwError(400, 'Users List does not exist')()
        }
        return requestHandler.sendSuccess(res, 'Deal List By User Listing Successfully')(allList);
    }

    async saveorUpdateSettings(req, res) {
        try {
            const validationError = await validator.savesettings(req.body);


            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            const saved = await userRepo.updateById(req.body, { _id: req.user._id });
            console.log(saved, "saveddddddd");


            return requestHandler.sendSuccess(res, 'Settings saved successfully')(saved);

        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async refreshToken(req, res) {
        try {

            if (!_.has(req.body, 'refresh_token') || ((_.has(req.body, 'refresh_token') && (_.isUndefined(req.body.refresh_token)) || _.isNull(req.body.refresh_token) || _.isEmpty(req.body.refresh_token.trim())))) {
                requestHandler.throwError(400, 'Bad Request', 'Refresh token is required!')();
            }

            const providedRefreshToken = req.body.refresh_token.trim();

            const existingRefreshToken = await refreshTokenRepo.getByField({ refresh_token: providedRefreshToken });
            if (_.isEmpty(existingRefreshToken)) {
                requestHandler.throwError(400, 'Bad Request', 'Invalid refresh token!')();
            }

            if (existingRefreshToken.expiry_date && moment().isAfter(existingRefreshToken.expiry_date)) {
                await refreshTokenRepo.deleteOne({ _id: existingRefreshToken._id });
                requestHandler.throwError(401, 'Bad Request', 'Refresh token has expired!')();
            }

            const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

            if (!refreshSecret || _.isEmpty(refreshSecret.trim())) {
                requestHandler.throwError(500, 'Server Error', 'Refresh token secret is not configured!')();
            }

            if (providedRefreshToken.split('.').length === 3) {
                try {
                    const decoded = jwt.verify(providedRefreshToken, refreshSecret);
                    if (_.get(decoded, 'params.id') && decoded.params.id.toString() !== existingRefreshToken.user_id.toString()) {
                        requestHandler.throwError(400, 'Bad Request', 'Invalid refresh token!')();
                    }
                } catch (error) {
                    const statusCode = error.name === 'TokenExpiredError' ? 401 : 400;
                    const message = error.name === 'TokenExpiredError' ? 'Refresh token has expired!' : 'Invalid refresh token!';
                    requestHandler.throwError(statusCode, 'Bad Request', message)();
                }
            }

            const payload = { id: existingRefreshToken.user_id }

            let token = jwt.sign(payload, config.auth.jwtSecret, {
                expiresIn: process.env.JWT_EXPIRES_IN, // token expiration time
            });

            let refresh_token = await helper.updateRefreshToken(payload, existingRefreshToken._id);

            if (!refresh_token) {
                requestHandler.throwError(400, 'Bad Request', 'Refresh token is not generated, something went wrong!')();
            }

            requestHandler.sendSuccess(res, 'Tokens generated successfully!')({ refreshToken: refresh_token, token: token });

        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async notificationlisting(req, res) {
        try {

            await notificationRepo.updateMany({ target_user_id: req.user._id }, { marked_as_read: true });
            const notificationListing = await notificationRepo.getAllByField({ target_user_id: req.user._id })
            if (!_.isNull(notificationListing)) {
                requestHandler.sendSuccess(res, 'Notification Retrived successfully!')({ notificationListing });
            }


        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async socialSignupSignin(req, res) {
        try {
            const { email, socialId, registerType } = req.body;
            const deviceToken = req.body.deviceToken || req.body.device_token;
            const deviceType = normalizeDeviceType(req.body.deviceType || req.body.device_type);

            if (!email || !socialId || !registerType) {
                return requestHandler.throwError(400, 'Bad Request', 'Missing required fields: email, socialId, or registerType')();
            }

            const normalizedRegisterType =
                registerType.charAt(0).toUpperCase() + registerType.slice(1).toLowerCase();

            const validRegisterTypes = ['Google', 'Apple'];
            if (!validRegisterTypes.includes(normalizedRegisterType)) {
                return requestHandler.throwError(400, 'Bad Request', 'Please provide a valid social account type!')();
            }
            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await userRepo.getByField({
                socialId: socialId,
                registerType: normalizedRegisterType,
                isDeleted: false
            });

            const emailMatchUser = await userRepo.getByField({
                email: normalizedEmail,
                isDeleted: false
            });

            if (existingUser && existingUser._id) {
                // Update device info if provided
                if (deviceToken || deviceType) {
                    await userRepo.updateById(
                        {
                            ...(deviceToken ? { device_token: deviceToken } : {}),
                            ...(deviceType ? { device_type: deviceType } : {})
                        },
                        existingUser._id
                    );
                }

                // Generate tokens
                const payload = { id: existingUser._id };
                const token = jwt.sign(payload, config.auth.jwtSecret, { expiresIn: config.auth.jwt_expiresin });
                const refresh_token = await helper.createRefreshToken(payload);

                // Fetch user details and send success response
                const userDetails = await userRepo.getUserDetails({ _id: existingUser._id });

                return requestHandler.sendSuccess(res, 'Logged in successfully.')(userDetails[0], { token, refresh_token });
            } else if (emailMatchUser && emailMatchUser._id) {
                const payload = { id: emailMatchUser._id };
                const token = jwt.sign(payload, config.auth.jwtSecret, { expiresIn: config.auth.jwt_expiresin });
                const refresh_token = await helper.createRefreshToken(payload);

                const updateData = { socialId, registerType: normalizedRegisterType };

                if (deviceToken) {
                    updateData.device_token = deviceToken;
                }

                if (deviceType) {
                    updateData.device_type = deviceType;
                }

                await userRepo.updateById(updateData, emailMatchUser._id);

                const userDetails = await userRepo.getUserDetails({ _id: emailMatchUser._id });

                return requestHandler.sendSuccess(res, 'Logged in successfully.')(userDetails[0], { token, refresh_token });
            } else {
                // New user signup
                const userRole = await roleRepo.getByField({ role: 'user' });
                if (!userRole || !userRole._id) {
                    return requestHandler.throwError(500, 'Internal Server Error', 'User role not found!')();
                }

                const newUserData = {
                    ...req.body,
                    email: normalizedEmail,
                    role: userRole._id,
                    registrationCompleted: true,
                    isEmailVerified: true,
                    socialId,
                    registerType: normalizedRegisterType
                };

                if (deviceToken) {
                    newUserData.device_token = deviceToken;
                }

                if (deviceType) {
                    newUserData.device_type = deviceType;
                }

                // Remove password if present (should not be used for social login)
                if (newUserData.password) delete newUserData.password;

                const newUser = await userRepo.save(newUserData);

                if (!newUser || !newUser._id) {
                    return requestHandler.throwError(400, 'Bad Request', 'Failed to create new user!')();
                }

                // Generate tokens
                const payload = { id: newUser._id };
                const token = jwt.sign(payload, config.auth.jwtSecret, { expiresIn: config.auth.jwt_expiresin });
                const refresh_token = await helper.createRefreshToken(payload);

                if (!refresh_token) {
                    return requestHandler.throwError(400, 'Bad Request', 'Failed to generate refresh token!')();
                }

                // Fetch user details and send success response
                const userData = await userRepo.getUserDetails({ _id: newUser._id });

                return requestHandler.sendSuccess(res, 'Account has been created successfully.')(
                    userData[0],
                    { token, refresh_token }
                );
            }
        } catch (error) {
            return requestHandler.sendError(req, res, error);
        }
    }

    // async socialSignupSignin(req, res) {
    //     try {
    //         const validationError = await validator.socialsignin(req.body);
    //         console.log(validationError);

    //         if (validationError && !_.isUndefined(validationError)) {
    //             return requestHandler.validation_error(res, 'Validation Error')(validationError);
    //         }
    //         let { email, social_id } = req.body
    //         let existUser = await userRepo.getByField({ email, social_id });
    //         if (existUser) {
    //             let payload = { id: existUser._id };
    //             let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    //             let refresh_token = await helper.createRefreshToken(payload);
    //             return requestHandler.sendSuccess(res, 'Account has been created successfully.')(existUser, { token, refresh_token });
    //         }
    //         else {
    //             let savedUser = await userRepo.save(req.body);
    //             let payload = { id: savedUser._id };
    //             let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    //             let refresh_token = await helper.createRefreshToken(payload);
    //             return requestHandler.sendSuccess(res, 'Account has been created successfully.')(savedUser, { token, refresh_token });
    //         }
    //     } catch (error) {
    //         return requestHandler.sendError(req, res, error);
    //     }
    // }

    // async socialSignupSignin(req, res) {
    //     try {
    //         const validationError = await validator.socialsignin(req.body);
    //         if (!_.isEmpty(validationError)) {
    //             return requestHandler.validation_error(res, 'Validation Error')(validationError);
    //         }

    //         const { email, sociald } = req.body;

    //         let existUser = await userRepo.getByField({ socialId });

    //         if (!existUser) {
    //             existUser = await userRepo.getByField({ email });
    //         }

    //         let user;

    //         // if (existUser) {
    //         //     user = existUser;
    //         // } else {
    //         //     user = await userRepo.save(req.body);
    //         // }

    //         user = existUser ? existUser : await userRepo.save(req.body)

    //         const payload = { id: user._id };
    //         const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    //         const refresh_token = await helper.createRefreshToken(payload);

    //         const message = existUser ? 'Login successful.' : 'Account has been created successfully.';
    //         return requestHandler.sendSuccess(res, message)(user, { token, refresh_token });

    //     } catch (error) {
    //         console.error('Social signup/signin error:', error);
    //         return requestHandler.sendError(req, res, error);
    //     }
    // }

}

module.exports = new UserControllerApi()
