const express = require('express');
const routeLabel = require('route-label');
const priceTrackerController = require('../../modules/webservices/priceTracker.controller');
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.all('/price-tracker*', auth.authenticateAPI);

/**
 * @swagger
 * /price-tracker:
 *   get:
 *     summary: Get all price trackers for the authenticated user
 *     tags:
 *       - PriceTracker
 *     security:
 *       - Token: []
 *     responses:
 *       200:
 *         description: Price trackers fetched successfully
 */
namedRouter.get('priceTracker.list', '/price-tracker', priceTrackerController.list);

/**
 * @swagger
 * /price-tracker:
 *   post:
 *     summary: Create a new price tracker
 *     tags:
 *       - PriceTracker
 *     security:
 *       - Token: []
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Price tracker payload
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - keyword
 *           properties:
 *             keyword:
 *               type: string
 *             category:
 *               type: string
 *     responses:
 *       200:
 *         description: Price tracker created successfully
 */
namedRouter.post('priceTracker.create', '/price-tracker', priceTrackerController.create);

/**
 * @swagger
 * /price-tracker/{id}:
 *   delete:
 *     summary: Remove a price tracker
 *     tags:
 *       - PriceTracker
 *     security:
 *       - Token: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: Tracker identifier
 *     responses:
 *       200:
 *         description: Tracker removed successfully
 */
namedRouter.delete('priceTracker.remove', '/price-tracker/:id', priceTrackerController.remove);

module.exports = router;
