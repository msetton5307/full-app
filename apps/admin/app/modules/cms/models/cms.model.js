const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const CmsSchema = new Schema({
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    content: { type: String, default: '' },
    isDeleted: {type: Boolean, default: false, enum: [true, false]}
}, { timestamps: true, versionKey: false });

// For pagination
CmsSchema.plugin(mongooseAggregatePaginate);

// create the model for Cms and expose it to our app
module.exports = mongoose.model('Cms', CmsSchema);