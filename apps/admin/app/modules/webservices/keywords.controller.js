const fs = require('fs');
const keywordsRepo = require('../keywords/repositories/keywords.repository');
const mongoose = require('mongoose');

// response helper
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const requestHandler = new RequestHandler(logger);
// response helper

class KeywordControllerApi
{
    async saveKeyword(req,res)
    {
        let existKeyword=await keywordsRepo.getByField({keyword:req.body.keyword});
        if(!_.isNull(existKeyword))
        {
            return requestHandler.throwError(400, 'Keyword Already Exists')() 
        }
        let saved=await keywordsRepo.save(req.body);
        if(!_.isEmpty(saved))
        {
            return requestHandler.sendSuccess(res, 'Keyword Saved Successfully')(saved);
        }
    }

    async listing(req, res) {
        try {

            let allList = await keywordsRepo.getAll(req);
            
            if (_.isEmpty(allList)) {
                return requestHandler.throwError(400, 'Keyword List does not exist')()
            }
            return requestHandler.sendSuccess(res, 'Keyword Listing Successfully')(allList);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

}

module.exports=new KeywordControllerApi()