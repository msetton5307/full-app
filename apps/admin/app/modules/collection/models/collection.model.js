const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;

const statusEnum = ['Active', 'Inactive'];

const CollectionSchema = new Schema(
  {
    title: { type: String, required: true, default: '' },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    // Store references to deals. Some collections may reference external deals
    // that do not exist in the local database, so we allow mixed types here
    // instead of restricting to ObjectId only.
    deals: [{ type: Schema.Types.Mixed, ref: 'deal' }],
    status: { type: String, default: 'Active', enum: statusEnum },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
  },
  { timestamps: true, versionKey: false }
);

CollectionSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('Collection', CollectionSchema);
