const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const userInterfaceController = require('userInterface/controllers/userInterface.controller');

const multer = require('multer');
const request_param = multer();

//authentication section of admin-theme-color
namedRouter.all('/user-interface*', auth.authenticate);

namedRouter.get("userInterface.feather", '/user-interface/feather', userInterfaceController.feather);




//Export the express.Router() instance
module.exports = router;