const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const cmsRepo = require('cms/repositories/cms.repository');

class CMSControllerApi {
    constructor() { }

    /**
     * 
     * @Method : details
     * @Description : To Fetch All CMS Details
     */
    async details(req, res) {
        try {
            req.params.slug = req.params.slug.trim();
            if (_.isEmpty(req.params.slug)) {
                requestHandler.throwError(400, 'Bad Request', 'Please Enter A Valid Slug!!!')();
            } else {
                let result = await cmsRepo.getCmsBySlug({ isDeleted: false, slug: req.params.slug });
                if (!_.isEmpty(result) && result.length) {
                    requestHandler.sendSuccess(res, 'CMS Fetched Successfully!!!')(result[0]);
                } else {
                    requestHandler.throwError(400, 'Bad Request', 'Slug is not properly defined')();
                }
            }
        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

}

module.exports = new CMSControllerApi();