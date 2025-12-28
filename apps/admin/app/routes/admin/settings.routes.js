const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const settingsController = require('settings/controllers/settings.controller');

const multer = require('multer');
const request_param = multer();

//authentication section of admin-settings
namedRouter.all('/settings*', auth.authenticate);

namedRouter.get("settings.edit", '/settings/edit', settingsController.edit);

namedRouter.post("settings.update", '/settings/update', request_param.any(), settingsController.update);



//Export the express.Router() instance
module.exports = router;