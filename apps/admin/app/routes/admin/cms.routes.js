const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const cmsController = require('cms/controllers/cms.controller');
const fs = require('fs');
const multer = require('multer');
const request_param = multer();

const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!fs.existsSync("./public/uploads/cms")) {
            fs.mkdirSync("./public/uploads/cms");
        }
        
        callback(null, "./public/uploads/cms");
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

 const uploadFile = multer({
    storage: Storage
});

//authentication section of cms
namedRouter.all('/cms*', auth.authenticate);

// admin cms list route

namedRouter.post("cms.getall", '/cms/getall', async (req, res) => {
    try {
        const success = await cmsController.getAll(req, res);
        res.send({"meta": success.meta, "data": success.data});
    } catch (error) {
        res.status(error.status).send(error);
    }
});
namedRouter.get("admin.cms.list", '/cms/list',cmsController.list);
namedRouter.get("cms.edit", '/cms/edit/:id',cmsController.edit);
namedRouter.post("cms.update", '/cms/update',request_param.any(),cmsController.update);




//Export the express.Router() instance
module.exports = router;