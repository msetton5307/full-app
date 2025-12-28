const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserActivityTimelineSchema = new Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    file_full_path: { type: String, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
}, { timestamps: true, versionKey: false });


// create the model for User Activity Timelines and expose it to our app
module.exports = mongoose.model('user_activity_timelines', UserActivityTimelineSchema);