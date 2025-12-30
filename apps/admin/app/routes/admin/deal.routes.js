const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const DealController = require('../../modules/deal/controllers/deal.controller');
const fs = require('fs');
const multer = require('multer');
const request_param = multer();

const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!fs.existsSync("./public/uploads/DealImages")) {
            fs.mkdirSync("./public/uploads/DealImages");
        }
        
        callback(null, "./public/uploads/DealImages");
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

 const uploadFile = multer({
    storage: Storage
});

namedRouter.all('/deal*', auth.authenticate);

namedRouter.get("admin.deal.listing", '/deal/list', DealController.list);

namedRouter.get("deal.post.form", '/deal/post', DealController.renderPostDealPage);
namedRouter.post("deal.post.submit", '/deal/post', request_param.any(), DealController.postDealFromAmazon);

namedRouter.post("deal.getall", '/deal/getall', async (req, res) => {
  try {
    const success = await DealController.getAll(req, res);
    res.send({
      "meta": success.meta, 
      "data": success.data
    });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});

namedRouter.get("admin.payment.listing", '/deal/payment/list', DealController.paymentList);

namedRouter.post("deal.getallapprovedeals", '/deal/getall/approvedeals', async (req, res) => {
  try {
    const success = await DealController.getAllApproevdDeals(req, res);
    res.send({
      "meta": success.meta, 
      "data": success.data
    });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});

namedRouter.get("deal.add","/deal/add",DealController.renderAddDealPage);
namedRouter.post("deal.insert", '/deal/insert', uploadFile.any(), DealController.insert);
namedRouter.get("deal.edit", '/deal/edit/:id', request_param.any(), DealController.renderEditpage);
namedRouter.get("deal.category", '/deal/category/:id', request_param.any(), DealController.findCategory);

namedRouter.post("deal.update", '/deal/update', request_param.any(), DealController.update);
namedRouter.get("deal.delete", '/deal/delete/:id', DealController.delete);
namedRouter.get("deal.statusChange", '/deal/status-change/:id/:status', request_param.any(), DealController.statusChange);
namedRouter.post("deal.markExpired", '/deal/mark-expired/:id', DealController.markExpired);
namedRouter.get('api.bank.payment', '/deal/payment/:id', DealController.addPaymentIntent);





//Export the express.Router() instance
module.exports = router;