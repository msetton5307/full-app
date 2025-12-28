
const validator = require('../../validators/settings')
const _ = require("lodash")
const settingsRepo = require("../../modules/settings/repositories/settings.repository")

// response helper
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const RequestHandler = require(appRoot + '/helper/RequestHandler');
const requestHandler = new RequestHandler(logger);
// response helper

class settingsControllerApi {
    async saveorUpdateSettings(req, res) {
        try {
            
            const validationError = await validator.savesettings(req.body);


            if (validationError && !_.isUndefined(validationError)) {
                return requestHandler.validation_error(res, 'Validation Error')(validationError);
            }

            req.body["user_id"]=req.user._id;

            const saved = await settingsRepo.saveOrUpdate({ user_id: req.body.user_id }, req.body);
            console.log(saved,"saveddddddd");
            

            return requestHandler.sendSuccess(res, 'Settings saved successfully')(saved);
            
        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }

    async getSettings(req, res) {
        try {
            let getsettings = await settingsRepo.getByField({ _id: req.params.id, isDeleted: false })
            if (!_.isNull(getsettings)) {
                return requestHandler.sendSuccess(res, 'Settings saved successfully')(getsettings);
            }
        } catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }
}

module.exports=new settingsControllerApi()