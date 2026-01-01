const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;

const statusEnum = ['Active', 'Inactive'];

const CollectionSchema = new Schema(
  {
    title: { type: String, required: true, default: '' },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    deals: [{ type: Schema.Types.ObjectId, ref: 'deal' }],
    status: { type: String, default: 'Active', enum: statusEnum },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
  },
  { timestamps: true, versionKey: false }
);

CollectionSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('Collection', CollectionSchema);
