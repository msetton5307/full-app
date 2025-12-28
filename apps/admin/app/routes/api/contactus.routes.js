const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const contactUsControllerApi = require('../../modules/webservices/contactus.controller');


namedRouter.all('/contact-us*', auth.authenticateAPI);

/**
* @swagger
* /contact-us:
*   post:
*     summary: Contact Us
*     tags:
*       - Contact Us
*     security:
*       - Token: []
*     produces:
*       - application/json
*     parameters:
*         - name: body
*           in: body
*           description: Contact Us
*           required: true 
*           schema:
*             type: object
*             required:
*                  - title
*                  - description
*             properties:
*                 title:
*                     type: string
*                 description:
*                     type: string
*     responses:
*        200:
*          description: Contact Successfully
*        400:
*          description: Bad Request
*        500:
*          description: Server Error
*/

namedRouter.post("contact-us", "/contact-us", contactUsControllerApi.saveContact);

// Export the express.Router() instance
module.exports = router;