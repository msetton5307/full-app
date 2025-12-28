const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const refreshTokenSchema = new Schema({
    refresh_token: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiry_date: { type: Date, required: true },
}, {
    timestamps: true,
    versionKey: false
})

refreshTokenSchema.plugin(mongooseAggregatePaginate);

module.exports = new mongoose.model('refresh_token', refreshTokenSchema);