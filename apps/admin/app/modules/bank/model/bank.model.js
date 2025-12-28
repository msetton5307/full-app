const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const BankSchema = new Schema({
    bank_name: { type: String, default: '' },
    account_number: { type: String, default: '' },
    bank_code: { type: String, default: '' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    stripe_account_id: { type: String, default: '' },
    status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
}, { timestamps: true, versionKey: false });

// For pagination
BankSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('bankAccount', BankSchema);