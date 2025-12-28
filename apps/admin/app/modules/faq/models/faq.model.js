const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;

const bools = [true, false];
const status = ['Active', 'Inactive'];

const FAQSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  status: { type: String, default: 'Active', enum: status },
  isDeleted: { type: Boolean, default: false, enum: bools, index: true }
}, { timestamps: true, versionKey: false });

// For pagination
FAQSchema.plugin(mongooseAggregatePaginate);

// create the model for property enquiry and expose it to our app
module.exports = mongoose.model('faq', FAQSchema);