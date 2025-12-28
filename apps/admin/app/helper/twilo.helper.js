const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid.toString(), authToken.toString());


class twiloHelper  {
    constructor (){}


    async sendSMS(params) {
        try {
            
            let sendSMS = await client.messages.create({
                from: process.env.TWILIO_FROM_NUMBER.toString(),
                to: params.phone_number,
                body: params.msg_body,
            });

            if (sendSMS) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log("OTP send error: ", e.message);
            return false
            // throw e;
        }
    }

}

module.exports = new twiloHelper();