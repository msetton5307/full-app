const Joi = require('joi')

module.exports = {
    savesettings: async function (object) {

        const schema = Joi.object({
            notification: Joi.boolean().required(),
            preferences: Joi.boolean().required(),
            email_notifications: Joi.boolean().required()
        });
        try {
            await schema.validateAsync(object);
        }
        catch (error) {
            console.log(error);
            return error;
        }
    },

    
}