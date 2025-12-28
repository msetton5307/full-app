const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const bools = [true, false];
const status = ['Active', 'Inactive'];

const DealFavoriteSchema = new Schema({
    isFavorite: { type: Boolean, required: true, default: true, enum: bools },
    userId: { type: Schema.Types.ObjectId, required: true, default: null },
    dealId: { type: Schema.Types.ObjectId, required: true, default: null },
    status: { type: String, default: 'Active', enum: status },
    isDeleted: { type: Boolean, default: false, enum: bools, index: true }
}, { timestamps: true, versionKey: false });


DealFavoriteSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('favoritedeal', DealFavoriteSchema);