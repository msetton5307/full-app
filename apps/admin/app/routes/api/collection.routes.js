const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const collectionControllerApi = require('../../modules/webservices/collection.controller');

namedRouter.all('/collection*', auth.authenticateAPI);

namedRouter.get('collection.listing', '/collection/listing', collectionControllerApi.listing);
namedRouter.get('collection.deals', '/collection/:id/deals', collectionControllerApi.deals);

module.exports = router;
