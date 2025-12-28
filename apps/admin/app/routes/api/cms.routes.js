const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const cmsController = require('../../modules/webservices/cms.controller');

/**
  * @swagger
  * /cms/details/{slug}:
  *   get:
  *     summary: Get CMS By Slug
  *     tags:
  *       - CMS
  *     produces:
  *       - application/json
  *     parameters:
  *      - name: slug
  *        in: path
  *        description: Get CMS By Slug
  *        enum: [terms-policies, privacy-policy] 
  *        required: true
  *     responses:
  *       200:
  *         description: CMS Data Fetched Successfully
  *       400:
  *         description: Bad Request
  *       500:
  *         description: Server Error
*/

// Get CMS Detail Route
namedRouter.get("api.cms.details", "/cms/details/:slug", cmsController.details);


// Export the express.Router() instance
module.exports = router;