const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;


const ContactUsSchema = new Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    user_id: { type: mongoose.Types.ObjectId, default: null },
    status: {type: String, default: 'Active', enum: ['Active', 'Inactive']},
    isDeleted: {type: Boolean, default: false},
}, { timestamps: true, versionKey: false });

// For pagination
ContactUsSchema.plugin(mongooseAggregatePaginate);

// create the model for Cms and expose it to our app
module.exports = mongoose.model('Contactus', ContactUsSchema);