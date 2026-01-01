const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const CollectionController = require('../../modules/collection/controllers/collection.controller');
const fs = require('fs');
const multer = require('multer');
const request_param = multer();

const Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = './public/uploads/collections';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '_' + file.originalname.replace(/\s/g, '_'));
  },
});

const uploadFile = multer({
  storage: Storage,
});

namedRouter.all('/collection*', auth.authenticate);

namedRouter.get('admin.collection.listing', '/collection/list', CollectionController.list);

namedRouter.post('collection.getall', '/collection/getall', async (req, res) => {
  try {
    const success = await CollectionController.getAll(req, res);
    res.send(success.data);
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});

namedRouter.get('collection.add', '/collection/add', CollectionController.renderAddCollectionPage);
namedRouter.post('collection.insert', '/collection/insert', uploadFile.any(), CollectionController.insert);
namedRouter.get('collection.edit', '/collection/edit/:id', request_param.any(), CollectionController.renderEditpage);
namedRouter.post('collection.update', '/collection/update', uploadFile.any(), CollectionController.update);
namedRouter.get('collection.delete', '/collection/delete/:id', CollectionController.delete);
namedRouter.get('collection.statusChange', '/collection/status-change/:id', request_param.any(), CollectionController.statusChange);

module.exports = router;
