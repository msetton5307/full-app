const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const FAQController = require('faq/controllers/faq.controller');
const multer = require('multer');
const fs = require("fs");
const request_param = multer();

namedRouter.all('/faq*', auth.authenticate);

namedRouter.get("admin.faq.listing", '/faq/list', FAQController.list);

namedRouter.post("faq.getall", '/faq/getall', async (req, res) => {
  try {
    const success = await FAQController.getAll(req, res);
    res.send({
      "meta": success.meta, 
      "data": success.data
    });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});

namedRouter.get("faq.add","/faq/add",FAQController.renderAddFaqPage)
namedRouter.post("faq.insert", '/faq/insert', request_param.any(), FAQController.insert);
namedRouter.get("faq.edit", '/faq/edit/:id', request_param.any(), FAQController.renderEditpage);
namedRouter.post("faq.update", '/faq/update', request_param.any(), FAQController.update);
namedRouter.get("faq.delete", '/faq/delete/:id', FAQController.delete);
namedRouter.get("faq.view", '/faq/view/:id', FAQController.detail);
namedRouter.get("faq.statusChange", '/faq/status-change/:id', request_param.any(), FAQController.statusChange);

// Export the express.Router() instance

module.exports = router;