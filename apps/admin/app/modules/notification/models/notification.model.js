const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const notification_type = ['offer', 'task', 'question', 'question-reply', 'offer-reply', 'request-payment', 'release-payment', 'accept-offer'];


const notificationSchema = new Schema({
    reference_user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reference_deal_id: { type: Schema.Types.ObjectId, ref: 'deal', default: null },
    target_user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    notification_title: { type: String, default: '' },
    notification_message: { type: String, default: '' },
    notification_description: { type: String, default: '' },
    notification_image: { type: String, default: '' },
    marked_as_read: { type: Boolean, default: false, enum: [true, false] },
    isWeb: { type: Boolean, default: false, enum: [true, false] },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
}, { timestamps: true, versionKey: false })

notificationSchema.plugin(mongooseAggregatePaginate);
module.exports = new mongoose.model('notification', notificationSchema);
