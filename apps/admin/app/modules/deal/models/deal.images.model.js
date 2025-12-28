const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bools = [true, false];
const status = ['Active', 'Inactive'];

const DealImagesSchema = new Schema({
  image: { type: String, required: true, default:'' },
  deal_id: { type: Schema.Types.ObjectId, required: true, default:null },
  status: { type: String, default: 'Active', enum: status },
  isDeleted: { type: Boolean, default: false, enum: bools, index: true }
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('dealimage', DealImagesSchema);