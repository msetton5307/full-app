const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const transactionType = ['Payment', 'Refund', 'Transfer', 'Withdraw', 'Admin Commission', 'cancellation_fees', 'Product Purchase', 'Admin Merchandise Income', 'Escrow'];

const transactionSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    ref_user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    trans_date: { type: Date, default: Date.now(), default: Date.now() },
    trans_id: { type: String, default: '' },
    paymentintent_id: { type: String, default: '' },
    trans_status: { type: String, default: '' },
    user_amount: { type: Number, default: 0 },
    admin_amount: { type: Number, default: 0 },
    stripe_customer_id: { type: String, default: '' },
    // stripe_transfer_id: { type: String, default: '' },
    stripe_charge_id: { type: String, default: '' },
    trans_mode: { type: String, default: 'Debit', enum: ['Debit', 'Credit'] },
    last_card_four_digit: { type: String, default: '' },
    pay_from: { type: String, default: ''},
    exp_month: { type: String, default: '' },
    exp_year: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, enum: [true, false] },
    status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
}, {
    timestamps: true,
    versionKey: false
});

transactionSchema.plugin(mongooseAggregatePaginate);

module.exports = new mongoose.model('transaction', transactionSchema);
