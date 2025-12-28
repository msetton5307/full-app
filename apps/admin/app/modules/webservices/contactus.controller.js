const RequestHandler = require(appRoot + '/helper/RequestHandler');
const Logger = require(appRoot + '/helper/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const contactUsRepo = require('../contactUs/repositories/contactus.repository');
let mailHelper = require("../../helper/gmailMailer");

class ContactUsControllerApi {
    constructor() { }

    async saveContact(req, res) {
        try {

            let sendMail
            console.log(req.body);
            req.body["user_id"] = req.user._id
            let saved = await contactUsRepo.save(req.body);
            let data={
                fullName: req.user.fullName,
                title:req.body.title,
                description:req.body.description
            }
            if (!_.isEmpty(saved) && saved._id)
            {
                    sendMail = await mailHelper.sendMail(
                    `${process.env.APP_NAME} Admin<${process.env.SITE_EMAIL}>`,
                    req.body.email,
                    `Support`,
                    "api-signup",
                    data
                );
            }
            if (!_.isEmpty(sendMail)) {
                console.log("mail send");
                return requestHandler.sendSuccess(res, 'Mail Sent Successfully')(sendMail);
            } else {
                return requestHandler.throwError(400, "Error in sending Mail");
            }
            

        }
        catch (err) {
            return requestHandler.sendError(req, res, err);
        }
    }



}

module.exports = new ContactUsControllerApi();