const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const keywordController = require('../../modules/keywords/controller/keywords.controller');
const fs = require('fs');
const multer = require('multer');
const request_param = multer();

// const Storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         if (!fs.existsSync("./public/uploads/DealImages")) {
//             fs.mkdirSync("./public/uploads/DealImages");
//         }
        
//         callback(null, "./public/uploads/DealImages");
//     },
//     filename: (req, file, callback) => {
//         callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
//     }
// });

//  const uploadFile = multer({
//     storage: Storage
// });

namedRouter.all('/keyword*', auth.authenticate);

namedRouter.get("admin.keyword.listing", '/keyword/list', keywordController.list);

namedRouter.post("keyword.getall", '/keyword/getall', async (req, res) => {
  try {
    const success = await keywordController.getAll(req, res);
    res.send({
      "meta": success.meta, 
      "data": success.data
    });
  } catch (error) {
    res.status(error.status || 500).send(error);
  }
});

namedRouter.get("keyword.add","/keyword/add",keywordController.renderAddKeywordPage);
namedRouter.post("keyword.insert", '/keyword/insert', keywordController.insert);
namedRouter.get("keyword.edit", '/keyword/edit/:id', request_param.any(), keywordController.renderEditpage);
namedRouter.post("keyword.update", '/keyword/update', request_param.any(), keywordController.update);
namedRouter.get("keyword.delete", '/keyword/delete/:id', keywordController.delete);
namedRouter.get("keyword.statusChange", '/keyword/status-change/:id', request_param.any(), keywordController.statusChange);


//Export the express.Router() instance
module.exports = router;