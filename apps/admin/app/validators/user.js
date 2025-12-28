const Joi = require('joi')

module.exports = {
    signup: async function (object) {

        const schema = Joi.object({
            fullName: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(4).required(),
            confirmPassword: Joi.string().min(4).optional(),
            isAcceptAllPolicies: Joi.optional(),
            device_token: Joi.string().optional(),
            device_type: Joi.string().valid('ios', 'android', 'apple', 'iphone', 'ipad').optional(),
            deviceToken: Joi.string().optional(),
            deviceType: Joi.string().valid('ios', 'android', 'apple', 'iphone', 'ipad').optional()
        });
        try {
            await schema.validateAsync(object);
        }
        catch (error) {
            console.log(error);
            return error;
        }
    },

    login: async function (object) {

        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(4).required(),
            device_token:Joi.string().optional(),
            device_type:Joi.string().optional(),
            deviceToken: Joi.string().optional(),
            deviceType: Joi.string().valid('ios', 'android', 'apple', 'iphone', 'ipad').optional()
        });
        try {
            await schema.validateAsync(object);
        }
        catch (error) {
            console.log(error);
            return error;
        }
    },

    editProfile: async function (object) {

        const schema = Joi.object({
            fullName: Joi.string().optional(),
            // email: Joi.string().email().required(),
            profile_image: Joi.string().optional(),
        });
        try {
            await schema.validateAsync(object);
        }
        catch (error) {
            console.log(error);
            return error;
        }
    },
    forgetPassword: async function (object) {

        const schema = Joi.object({
            email: Joi.string().email().required()
        });
        try {
            await schema.validateAsync(object);
        }
        catch (error) {
            console.log(error);
            return error;
        }
    },
    otp: async function (object) {

        const schema = Joi.object({
            otp: Joi.number().min(4).required()
        });
        try {
            await schema.validateAsync(object);
        }
        catch (error) {
            console.log(error);
            return error;
        }
    },
    resetPassword: async function (object) {

        const schema = Joi.object({
            password: Joi.string().min(4).required(),
            confirmPassword: Joi.string().min(4).optional(),
        });
        try {
            await schema.validateAsync(object);
        }
        catch (error) {
            console.log(error);
            return error;
        }
    },

    savesettings: async function (object) {

        const schema = Joi.object({
            notifications: Joi.boolean().required(),
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

    socialsignin: async function (object) {

        const schema = Joi.object({
            fullName: Joi.string().required(),
            email: Joi.string().required(),
            device_token: Joi.string().required(),
            device_type: Joi.string().required(),
            socialId: Joi.string().required(),
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
