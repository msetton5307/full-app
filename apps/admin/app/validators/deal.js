const Joi = require('joi')

module.exports = {
    adddeal: async function (object) {

        const schema = Joi.object({
            deal_title: Joi.string().required(),
            deal_price: Joi.string().required(),
            product_link: Joi.string().pattern(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i),
            description: Joi.string().required(),
            brand_logo:Joi.string().optional(),
            image: Joi.optional(),
            discount: Joi.string().optional(),
            category:Joi.string().optional()
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