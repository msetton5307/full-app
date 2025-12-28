const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const categoryRepository = require('../category/repositories/category.repository');

class CategoryControllerApi {
    constructor() { }

    /**
     * 
     * @Method : details
     * @Description : To Fetch All Category Listing
     */
    async listing(req, res) {
        try {

            let allList = await categoryRepository.getAllCategory(req);
            
            if (_.isEmpty(allList)) {
                return requestHandler.throwError(400, 'Category List does not exist')()
            }
            return requestHandler.sendSuccess(res, 'Category Listing Successfully')(allList);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async getKeywordsByCategory(req,res)
    {
        try {
            // console.log(req.body);
            
            let allList = await categoryRepository.getKeywordsByCategory(req.body.search);
            
            if (_.isEmpty(allList)) {
                return requestHandler.throwError(400, 'Category List does not exist')()
            }
            return requestHandler.sendSuccess(res, 'Category Listing Successfully')(allList);
        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    

    }

module.exports = new CategoryControllerApi();