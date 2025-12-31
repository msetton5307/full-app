const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;

const PriceTrackerSchema = new Schema(
  {
    userId: {type: Schema.Types.ObjectId, ref: 'users', index: true, required: true},
    keyword: {type: String, required: true, default: ''},
    category: {type: String, default: ''},
    isDeleted: {type: Boolean, default: false, index: true},
  },
  {timestamps: true, versionKey: false},
);

PriceTrackerSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('price_tracker', PriceTrackerSchema);
