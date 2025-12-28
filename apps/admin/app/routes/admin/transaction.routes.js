const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const transactionController = require('../../modules/transaction/controller/transaction.controller');
const fs = require("fs");

namedRouter.all('/transaction*', auth.authenticate);

namedRouter.get("admin.transaction.listing", '/transaction/list', transactionController.list);

namedRouter.post("transaction.getall", '/transaction/getall', async (req, res) => {
  try {
    const success = await transactionController.getAll(req, res);
    res.send({
      "meta": success.meta, 
      "data": success.data
    });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});


// Export the express.Router() instance

module.exports = router;