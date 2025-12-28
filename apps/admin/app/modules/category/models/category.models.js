const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;


const CategorySchema = new Schema({
    title: { type: String, default: '' },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    image: { type: String, default: '' },
    isDeleted: {type: Boolean, default: false, enum: [true, false]},
    status: {type: String, default: 'Active', enum: ['Active', 'Inactive']}
}, { timestamps: true, versionKey: false });

// For pagination
CategorySchema.plugin(mongooseAggregatePaginate);

// create the model for Cms and expose it to our app
module.exports = mongoose.model('Category', CategorySchema);