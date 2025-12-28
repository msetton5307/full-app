const express = require('express');
const routeLabel = require('route-label');
const dealcontrollerapi = require('../../modules/webservices/deal.controller');
const router = express.Router()
const namedRouter = routeLabel(router);
const multer = require("multer");
const fs = require("fs")

const Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!fs.existsSync("./public/uploads/DealImages")) {
      fs.mkdirSync("./public/uploads/DealImages");
    }

    callback(null, "./public/uploads/DealImages");
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
  }
});

const uploadFile = multer({
  storage: Storage
});




/**
* @swagger
* /deal/get/json:
*   post:
*     summary: Get Deal By JSON
*     tags:
*       - Deal
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Get Deal By JSON
*           required: true 
*           schema:
*             type: object
*             required:
*                  - page
*                  - length
*             properties:
*                 page:
*                     type: number
*                 limit:
*                     type: number
*     responses:
*        200:
*          description: Deal Listing Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/


namedRouter.post("deal.get.json", "/deal/get/json", dealcontrollerapi.getDealByJSON);

namedRouter.post("api.deal.notifynewdeals", "/deal/notifynewdeals", dealcontrollerapi.notifyNewDeals);

namedRouter.all('/deal*', auth.authenticateAPI);

/**
* @swagger
* /deal/listing:
*   post:
*     summary: Deal Listing
*     tags:
*       - Deal
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Deal Listing
*           required: true 
*           schema:
*             type: object
*             required:
*                  - page
*                  - length
*             properties:
*                 page:
*                     type: number
*                 length:
*                     type: number
*                 search:
*                     type: string
*                 isFeature:
*                     type: boolean
*     responses:
*        200:
*          description: Deal Listing Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/


namedRouter.post("deal.listing", "/deal/listing", dealcontrollerapi.getDealList);

/**
* @swagger
* /deal/listing/user:
*   post:
*     summary: Deal Listing
*     tags:
*       - Deal
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Deal Listing
*           required: true 
*           schema:
*             type: object
*             required:
*                  - page
*                  - length
*             properties:
*                 page:
*                     type: number
*                 length:
*                     type: number
*                 search:
*                     type: string
*                 isFeature:
*                     type: boolean
*     responses:
*        200:
*          description: Deal Listing Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/


namedRouter.post("deal.user.listing", "/deal/listing/user", dealcontrollerapi.getDealsByUser);

/**
  * @swagger
  * /deal/get/{id}:
  *   get:
  *     summary: Get Deal By ID
  *     tags:
  *       - Deal
  *     security:
  *       - Token: []
  *     parameters:
  *         - name: id
  *           in: path
  *           required: true
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Deal Data Fetched Successfully
  *       400:
  *         description: Bad Request
  *       500:
  *         description: Server Error
*/

namedRouter.get("deal.get", "/deal/get/:id", dealcontrollerapi.getDeal);

/**
* @swagger
* /deal/like:
*   post:
*     summary: Like or Dislike Deal
*     tags:
*       - Deal
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Like or Dislike Deal
*           required: true 
*           schema:
*             type: object
*             required:
*                  - isLike
*                  - dealId
*                  - userId
*             properties:
*                 isLike:
*                     type: boolean
*                 isDisLike:
*                     type: boolean
*                 dealId:
*                     type: string
*     responses:
*        200:
*          description: Like or Dislike Deal Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/

namedRouter.post("deal.like", "/deal/like", dealcontrollerapi.likeDeal);

/**
* @swagger
* /deal/favorite:
*   post:
*     summary: Favorite Deal
*     tags:
*       - Deal
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Favorite Deal
*           required: true 
*           schema:
*             type: object
*             required:
*                  - dealId
*                  - userId
*             properties:
*                 dealId:
*                     type: string
*     responses:
*        200:
*          description: Favorite Deal Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/

namedRouter.post("deal.favourite", "/deal/favorite", dealcontrollerapi.favoriteDeal);

/**
* @swagger
* /deal/add:
*   post:
*     summary: Deal Add
*     tags:
*       - Deal
*     security:
*       - Token: []
*     consumes:
*       - multipart/form-data
*     parameters:
*         - name: deal_title
*           in: formData
*           description: Title of the deal
*           required: true
*           type: string
*         - name: deal_price
*           in: formData
*           description: Price of the deal
*           required: true
*           type: string
*         - name: description
*           in: formData
*           description: Description of the deal
*           required: true
*           type: string
*         - name: discount
*           in: formData
*           description: Discount of the deal
*           required: true
*           type: string
*         - name: categoryId
*           in: formData
*           description: Category of the deal
*           required: true
*           type: string
*         - name: brand_logo
*           in: formData
*           description: Brand Logo of the deal
*           required: true
*           type: string
*         - name: image
*           in: formData
*           description: Image associated with the deal
*           required: true
*           type: file
*         - name: product_link
*           in: formData
*           description: URL to the product related to the deal
*           required: true
*           type: string
*     responses:
*        200:
*          description: Deal Listing Successfully
*        400:
*          description: Bad Request
*        409:
*          description: Conflict (Duplicate Deal or Invalid Data)
*        500:
*          description: Server Error
*/


namedRouter.post("deal.adddeal", "/deal/add", uploadFile.array("image"), dealcontrollerapi.addDeal);

/**
* @swagger
* /deal/favorite/list:
*   post:
*     summary: Deal Favorite Listing
*     tags:
*       - Deal
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Deal Listing
*           required: true 
*           schema:
*             type: object
*             required:
*                  - page
*                  - length
*             properties:
*                 page:
*                     type: number
*                 length:
*                     type: number
*                 search:
*                     type: string

*     responses:
*        200:
*          description: Deal Favorite Listing Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/


namedRouter.post("deal.favourite.list.user", "/deal/favorite/list", dealcontrollerapi.getFavouriteListByUser);

/**
* @swagger
* /deal/listing/user/created:
*   post:
*     summary: Deal Favorite Listing
*     tags:
*       - Deal
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Deal Created By UserListing
*           required: true 
*           schema:
*             type: object
*             required:
*                  - page
*                  - length
*             properties:
*                 page:
*                     type: number
*                 length:
*                     type: number
*                 search:
*                     type: string
*                 status:
*                     type: string
*                 isPaymentDone:
*                     type: boolean

*     responses:
*        200:
*          description: Deal Created By User Listing Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/


namedRouter.post("deal.created.list.user", "/deal/listing/user/created", dealcontrollerapi.getCreatedDealsByUser);

/**
* @swagger
* /deal/update:
*   put:
*     summary: Deal Update
*     tags:
*       - Deal
*     security:
*       - Token: []
*     consumes:
*       - multipart/form-data
*     parameters:
*         - name: deal_title
*           in: formData
*           description: Title of the deal
*           type: string
*         - name: deal_price
*           in: formData
*           description: Price of the deal
*           type: string
*         - name: description
*           in: formData
*           description: Description of the deal
*           type: string
*         - name: discount
*           in: formData
*           description: Discount of the deal
*           type: string
*         - name: categoryId
*           in: formData
*           description: Category of the deal
*           type: string
*         - name: brand_logo
*           in: formData
*           description: Brand Logo of the deal
*           type: string
*         - name: image
*           in: formData
*           description: Image associated with the deal
*           type: file
*         - name: product_link
*           in: formData
*           description: URL to the product related to the deal
*           type: string
*         - name: delete_image_ids
*           in: formData
*           description: Enter The ids of image which need to be deleted
*           type: [string]
*         - name: id
*           in: formData
*           description: Enter Id of the deal
*           type: string
*     responses:
*        200:
*          description: Deal Listing Successfully
*        400:
*          description: Bad Request
*        409:
*          description: Conflict (Duplicate Deal or Invalid Data)
*        500:
*          description: Server Error
*/


namedRouter.put("deal.editdeal", "/deal/update", uploadFile.array("image"), dealcontrollerapi.editDeal);

/**
  * @swagger
  * /deal/delete/{id}:
  *   delete:
  *     summary: Delete Deal
  *     tags:
  *       - Deal
  *     security:
  *       - Token: []
  *     parameters:
  *         - name: id
  *           in: path
  *           required: true
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: Deal Deleted Successfully
  *       400:
  *         description: Bad Request
  *       500:
  *         description: Server Error
*/

namedRouter.delete("api.deal.delete", "/deal/delete/:id", dealcontrollerapi.deleteDeal);


module.exports = router
