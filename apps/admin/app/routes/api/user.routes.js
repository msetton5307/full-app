const express = require('express');
const routeLabel = require('route-label');
const usercontrollerapi = require('../../modules/webservices/user.controller');
const router = express.Router()
const namedRouter = routeLabel(router);
const multer = require("multer")
const fs = require("fs");
const path = require("path")

const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!fs.existsSync("./public/uploads/users")) {
            fs.mkdirSync("./public/uploads/users");
        }

        callback(null, "./public/uploads/users");
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
},
);

const fileFilter = (req, file, callback) => {
    // Allowed file types (for example, image files)
    const allowedTypes = /jpeg|jpg|png|gif/;

    // Check file type
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return callback(null, true); // Accept file
    } else {
        callback(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF files are allowed.'));
    }
};

const uploadFile = multer({
    storage: Storage,
    fileFilter: fileFilter
});

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: User Sign Up
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Account creation details
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - fullName
 *             - email
 *             - password
 *             - confirmPassword
 *             - isAcceptAllPolicies
 *           properties:
 *             fullName:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             confirmPassword:
 *               type: string
 *             isAcceptAllPolicies:
 *               type: boolean
 *     responses:
 *       200:
 *         description: User SignUp Successfully.
 *       400:
 *         description: User already exists or validation error.
 *       500:
 *         description: Server Error
 */


namedRouter.post("user.signup", "/user/signup", usercontrollerapi.signup);

/**
 * @swagger
 * /user/refreshtoken:
 *   post:
 *     summary: Refresh Token
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *         - name: body
 *           in: body
 *           description: Refresh Token
 *           required: true
 *           schema:
 *             type: object
 *             required:
 *                 - refresh_token
 *             properties:
 *                 refresh_token:
 *                     type: string
 *     responses:
 *        200:
 *          description: New refresh token is generated successfully
 *        400:
 *          description: Bad Request
 *        500:
 *          description: Server Error
 */
namedRouter.post("user.refreshtoken", '/user/refreshtoken', usercontrollerapi.refreshToken);



/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: user sign in
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: User Account Sign in
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Logged in successfully!
 *       400:
 *         description: Invalid credentials or account issues
 *       403:
 *         description: Email is not Verified
 *       404:
 *         description: Email Does Not Exists
 *       500:
 *         description: Server Error
 */



namedRouter.post("user.signin", "/user/login", usercontrollerapi.login);


/**
* @swagger
* /user/forgotpassword:
*   post:
*     summary: User Forget Password Process
*     tags:
*       - User
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: User Forget Password Process
*           required: true
*           schema:
*             type: object
*             required:
*                 - email
*             properties:
*                 email:
*                     type: string
*     responses:
*        200:
*          description: Your request has been processed. Please check your mail inbox for verification
*        400:
*          description: Bad Request
*        404:
*         description: User Does Not Exists
*        500:
*          description: Server Error
*/

namedRouter.post("user.forgotPassword", "/user/forgotpassword", usercontrollerapi.forgotpassword);

/**
* @swagger
* /user/resent/emailverify:
*   post:
*     summary: Resent OTP for Email Verification
*     tags:
*       - User
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Resent OTP for Email Verification
*           required: true
*           schema:
*             type: object
*             required:
*                 - email
*             properties:
*                 email:
*                     type: string
*     responses:
*        200:
*          description: Your request has been processed. Please check your mail inbox for verification
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/

namedRouter.post("user.resent.emailverify", "/user/resent/emailverify", usercontrollerapi.resendEmailVerify);


/**
 * @swagger
 * /user/social/signin:
 *   post:
 *     summary: user social sign in
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: User Account Sign in
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - socialId
 *             - platform
 *           properties:
 *             socialId:
 *               type: string
 *             platform:
 *               type: string
 *     responses:
 *       200:
 *         description: Logged in successfully!
 *       400:
 *         description: Invalid credentials or account issues
 *       403:
 *         description: Email is not Verified
 *       404:
 *         description: Email Does Not Exists
 *       500:
 *         description: Server Error
 */



namedRouter.post("user.social.signin", "/user/social/signin", usercontrollerapi.socialSignupSignin);


namedRouter.all('/user*', auth.authenticateAPI);

/**
 * @swagger
 * /user/validateotp:
 *   post:
 *     summary: OTP Validation
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: OTP Validation
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - otp
 *           properties:
 *             otp:
 *               type: number
 *     responses:
 *       200:
 *         description: OTP Verified successfully!
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server Error
 */

namedRouter.post("user.validateOtp", "/user/validateotp", usercontrollerapi.validateOTP);

/**
 * @swagger
 * /user/email/verify:
 *   post:
 *     summary: OTP Validation
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: OTP Validation
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - otp
 *           properties:
 *             otp:
 *               type: number
 *     responses:
 *       200:
 *         description: Email Verified successfully!
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server Error
 */

namedRouter.post("user.emailValidate", "/user/email/verify", usercontrollerapi.emailVerified);

/**
 * @swagger
 * /user/resetpassword:
 *   post:
 *     summary: Reset Password
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Reset Password
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - password
 *             - confirmPassword
 *           properties:
 *             password:
 *               type: string
 *             confirmPassword:
 *               type: string
 *     responses:
 *       200:
 *         description: Reset Password successfully!
 *       400:
 *         description: Something Went Wrong
 *       500:
 *         description: Server Error
 */

namedRouter.post("user.resetPasswordApi", "/user/resetpassword", usercontrollerapi.resetPassword);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Retrieve the profile details of User
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User profile details Fetched Successfully
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server Error
 */


namedRouter.get("user.profile", "/user/profile", usercontrollerapi.profileDetails);


/**
 * @swagger
 * /user/edit/profile:
 *   put:
 *     summary: User Edit profile.
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: fullName
 *         description: Full Name of the User
 *         required: false
 *         type: string
 *       - in: formData
 *         name: profile_image
 *         description: Profile image of the User
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: User Profile Updated Successfully.
 *       400:
 *         description: Something is wrong
 *       500:
 *         description: Server error.
 */



namedRouter.put("user.updateProfile", "/user/edit/profile", uploadFile.single("profile_image"), usercontrollerapi.updateProfile);

/**
 * @swagger
 * /user/bankaccount/add:
 *   post:
 *     summary: user bank account create
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: User Bank Account create
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - country
 *           properties:
 *             email:
 *               type: string
 *             country:
 *               type: string
 *     responses:
 *       200:
 *         description: Bank Account Created Successfully!
 *       400:
 *         description: Invalid credentials or account issues
 *       500:
 *         description: Server Error
 */



namedRouter.post("user.bankaccount.add", "/user/bankaccount/add", usercontrollerapi.addBankDetails);

/**
  * @swagger
  * /user/logout:
  *   get:
  *     summary: User Logout
  *     tags:
  *       - User
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: User Logged Out Successfully
  *       400:
  *         description: Bad Request
  *       500:
  *         description: Server Error
*/
namedRouter.get('api.user.logout', '/user/logout', usercontrollerapi.logout);

/**
 * @swagger
 * /user/changepassword:
 *   post:
 *     summary: Change User Password
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Change User Password
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - old_password
 *             - new_password
 *             - confirm_password
 *           properties:
 *             old_password:
 *               type: string
 *             new_password:
 *               type: string
 *             confirm_password:
 *               type: string
 *     responses:
 *       200:
 *         description: Password Changed Created Successfully!
 *       400:
 *         description: Invalid credentials or account issues
 *       500:
 *         description: Server Error
 */


namedRouter.post("user.changepassword", "/user/changepassword", usercontrollerapi.changepassword);

/**
 * @swagger
 * /user/delete:
 *   delete:
 *     summary: Delete User
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User Deleted Successfully
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server Error
 */


namedRouter.delete("api.user.delete", "/user/delete", usercontrollerapi.deleteUser);

/**
* @swagger
* /user/settings/update:
*   put:
*     summary: Settings Update
*     tags:
*       - User
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Settings Update
*           required: true 
*           schema:
*             type: object
*             required:
*                  - notifications
*                  - preferences
*                  - email_notifications
*             properties:
*                 notifications:
*                     type: boolean
*                 preferences:
*                     type: boolean
*                 email_notifications:
*                     type: boolean
*     responses:
*        200:
*          description: Settings Updated Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/

namedRouter.put("api.settings.update", "/user/settings/update", usercontrollerapi.saveorUpdateSettings);


/**
 * @swagger
 * /user/personalized/category/update:
 *   put:
 *     summary: User Edit profile.
 *     tags:
 *       - User
 *     security:
 *       - Token: []
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: personalized_category
 *         description: Personalized category with associated keywords
 *         required: false
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             category:
 *               type: string
 *               description: Category name
 *             keywords:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of keywords for the category
 *     responses:
 *       200:
 *         description: User Profile Updated Successfully.
 *       400:
 *         description: Something is wrong
 *       500:
 *         description: Server error.
 */


namedRouter.put("api.personalized.category.update", "/user/personalized/category/update", usercontrollerapi.updatePersonalizedCategory);

namedRouter.get("user.notification.listing", '/user/notification/listing', usercontrollerapi.notificationlisting);




module.exports = router
