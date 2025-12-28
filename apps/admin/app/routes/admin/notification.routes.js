const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const multer = require('multer');
const request_param = multer();
const notificationController = require('notification/controllers/notification.controller');

namedRouter.all('/notifications*', auth.authenticate);

namedRouter.get('admin.notification.compose', '/notifications', notificationController.compose);

namedRouter.post('admin.notification.send', '/notifications/send', request_param.any(), notificationController.broadcast);

module.exports = router;
