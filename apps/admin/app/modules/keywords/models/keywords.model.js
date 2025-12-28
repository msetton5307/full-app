const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;

const status = ['Active', 'Inactive'];

const KeywordSchema = new Schema({
  keyword: { type: String, required: true, default:'' },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
  status: { type: String, default: 'Active', enum: status },
  isDeleted: { type: Boolean, default: false, index: true }
}, { timestamps: true, versionKey: false });

// For pagination
KeywordSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('Keyword', KeywordSchema);