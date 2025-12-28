const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;

const bools = [true, false];
const status = ['Approved', 'Pending', 'Rejected'];

const DealFormSchema = new Schema({
  deal_title: { type: String, required: true, default: '' },
  description: { type: String, required: true, default: '' },
  deal_price: { type: String, required: true, default: '' },
  product_link: { type: String, required: true, default: '' },
  discount: { type: String, required: true, default: '' },
  isFeature: { type: Boolean, required: false, default: false },
  brand_logo: { type: String, default: '' },
  userId: { type: Schema.Types.ObjectId, default: null, ref: 'users' },
  isPaymentDone: { type: Boolean, required: false, default: false },
  status: { type: String, default: 'Pending', enum: status },
  isDeleted: { type: Boolean, default: false, enum: bools, index: true }
}, { timestamps: true, versionKey: false });

// For pagination
DealFormSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('deal', DealFormSchema);