const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const settingsControllerApi = require('../../modules/webservices/settings.controller');


namedRouter.all('/settings*', auth.authenticateAPI);



/**
  * @swagger
  * /settings/get/{id}:
  *   get:
  *     summary: Get Settings
  *     tags:
  *       - Settings
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
  *         description: Settings Fetched Successfully
  *       400:
  *         description: Bad Request
  *       500:
  *         description: Server Error
*/

namedRouter.get("api.settings", "/settings/:id", settingsControllerApi.getSettings);

// Export the express.Router() instance
module.exports = router;