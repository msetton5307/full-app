const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const categoryControllerApi = require('../../modules/webservices/category.controller');
const keywordControllerApi = require("../../modules/webservices/keywords.controller");


namedRouter.post("keywords.add", "/keyword/add", keywordControllerApi.saveKeyword);

namedRouter.all('/category*', auth.authenticateAPI);

/**
* @swagger
* /category/listing:
*   post:
*     summary: Category Listing
*     tags:
*       - Category
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Category Listing
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
*          description: Category Listing Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/

namedRouter.post("category.listing", "/category/listing", categoryControllerApi.listing);

/**
* @swagger
* /category/keyword/listing:
*   post:
*     summary: Category Listing
*     tags:
*       - Category
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Category Listing
*           required: true 
*           schema:
*             type: object
*             required:
*                  - search
*             properties:
*                 search:
*                     type: string
*     responses:
*        200:
*          description: Category Listing Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/
namedRouter.post("keyword.listing", "/category/keyword/listing", categoryControllerApi.getKeywordsByCategory);

// Export the express.Router() instance
module.exports = router;