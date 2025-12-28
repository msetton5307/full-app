const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bools = [true, false];
const status = ['Active', 'Inactive'];

const DealLikeSchema = new Schema({
    isLike: { type: Boolean, required: true, default: false, enum: bools },
    isDislike: { type: Boolean, required: true, default: false, enum: bools },
    userId: { type: Schema.Types.ObjectId, required: true, default: null },
    dealId: { type: Schema.Types.ObjectId, required: true, default: null },
    status: { type: String, default: 'Active', enum: status },
    isDeleted: { type: Boolean, default: false, enum: bools, index: true }
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('likedislikedeal', DealLikeSchema);