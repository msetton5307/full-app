
const express = require('express');
const routeLabel = require('route-label');
const dealcontrollerapi = require('../../modules/webservices/deal.controller');
const router = express.Router()
const namedRouter = routeLabel(router);
const bankControllerApi=require("../../modules/webservices/bank.controller")



namedRouter.post('api.bank.webhook', '/bank/webhook', bankControllerApi.webhook);
namedRouter.post('api.bank.webhookaccount', '/bank/webhook/account', bankControllerApi.webhookAccount);


namedRouter.all('/bank*', auth.authenticateAPI);

/**
  * @swagger
  * /bank/account/add:
  *   get:
  *     summary: Bank Account Add
  *     tags:
  *       - Bank Account
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *     parameters:
  *         - name: body
  *           in: body
  *           description: Bank Account Add
  *           required: true
  *                 
  *     responses:
  *        200:
  *          description: Bank account added successfully!
  *        400:
  *          description: Bank account Not added!
  *        500:
  *          description: Server Error
  */


namedRouter.get('api.bank-account.add', '/bank/account/add', bankControllerApi.addExpressAccount);

/**
  * @swagger
  * /bank/account/details:
  *   get:
  *     summary: Retrieve Bank Account 
  *     tags:
  *       - Bank Account
  *     security:
  *       - Token: []
  *     produces:
  *       - application/json
  *                 
  *     responses:
  *        200:
  *          description: Bank account fetched successfully!
  *        400:
  *          description: Bank account Not added!
  *        500:
  *          description: Server Error
  */


namedRouter.get('api.bank-account.details', '/bank/account/details', bankControllerApi.retrieveBankDetails);


// namedRouter.get('api.bank.payment', '/bank/payment', bankControllerApi.transfer);

// namedRouter.get('api.bank.payment', '/bank/payment/:id', bankControllerApi.paymentIntent);


module.exports=router