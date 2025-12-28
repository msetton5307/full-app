const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
    contactNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    playstoreURL: { type: String, default: '' },
    applestoreURL: { type: String, default: '' },
    time_zone: { type: String, default: '' },
    commision: { type: Number, default: '' },
    vat: { type: Number, default: 0 },
    radius:{type: Number, default: 0},
    socialLinks: {
        fb: { type: String, default: '' },
        twtr: { type: String, default: '' },
        insta: { type: String, default: '' },
        lnkdn: { type: String, default: '' }
    },
    notification: { type: Boolean, default: false },
    preferences: { type: Boolean, default: false },
    email_notifications: { type: Boolean, default: false },
    amountToPayCustomer: { type: Number, default: 0 },
    user_id: { type: Schema.Types.ObjectId, default: null },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
}, { timestamps: true, versionKey: false });


// create the model for settings and expose it to our app
module.exports = mongoose.model('settings', SettingsSchema);