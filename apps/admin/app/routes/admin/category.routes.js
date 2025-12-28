const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const fs = require('fs');
const multer = require('multer');
const categoryController = require('../../modules/category/controllers/category.controller');
const request_param = multer();

const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!fs.existsSync("./public/uploads/category")) {
            fs.mkdirSync("./public/uploads/category");
        }
        
        callback(null, "./public/uploads/category");
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

 const uploadFile = multer({
    storage: Storage
});

namedRouter.all('/category*', auth.authenticate);

namedRouter.get("admin.category.listing", '/category/list', categoryController.list);

namedRouter.post("category.getall", '/category/getall', async (req, res) => {
  try {
    const success = await categoryController.getAll(req, res);
    res.send({
      "meta": success.meta, 
      "data": success.data
    });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});

namedRouter.get("category.add","/category/add",categoryController.renderAddDealPage);
namedRouter.post("category.insert", '/category/insert', uploadFile.any(), categoryController.insert);
namedRouter.get("category.edit", '/category/edit/:id', uploadFile.any(), categoryController.renderEditpage);
namedRouter.post("category.update", '/category/update', uploadFile.any(), categoryController.update);
namedRouter.get("category.delete", '/category/delete/:id', categoryController.delete);
// namedRouter.get("category.view", '/category/view/:id', categoryController.detail);
namedRouter.get("category.statusChange", '/category/status-change/:id', request_param.any(), categoryController.statusChange);




//Export the express.Router() instance
module.exports = router;