const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
// const registerType = ['Normal','Google','Facebook'];
const bools = [true, false];
const deviceType = ["ios", "android"];
const registerType = ["Google", "Apple", "Normal"];
const verificationStatus = ["accept", "pending", "reject"]

const UserSchema = new Schema({
  fullName: { type: String, default: '', index: true },
  role: { type: Schema.Types.ObjectId, ref: 'Role', index: true },
  email: { type: String, default: '', index: true },
  password: { type: String, default: '' },
  profile_image: { type: String, default: '' },
  otp: { type: String, default: '' },
  otpExpireTime: { type: Date, default: null },
  isOtpVerified: { type: Boolean, default: false, enum: bools },
  // personalized_category: [{
  //   type: {
  //     category: { type: mongoose.Types.ObjectId, default: null },
  //     keywords: [{ type: mongoose.Types.ObjectId, default: null }]
  //   }, default: []
  // }],
  notifications: { type: Boolean, default: true },
  preferences: { type: Boolean, default: true },
  email_notifications: { type: Boolean, default: true },
  device_token: { type: String, default: '' },
  device_type: { type: String, default: 'android', enum: deviceType, index: true },
  socialId: { type: String, default: '', index: true },
  registerType: { type: String, default: 'Normal', enum: registerType, index: true },
  stripe_account_id: { type: String, default: '', index: true },
  isEmailVerified: { type: Boolean, default: false, enum: bools, index: true },
  isDeleted: { type: Boolean, default: false, enum: bools, index: true },
  isAcceptAllPolicies: { type: Boolean, default: false, enum: bools, index: true },
  isBankAccount: { type: Boolean, default: false, enum: bools, index: true },
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive'], index: true }
}, { timestamps: true, versionKey: false });


// generating a hash
UserSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(parseInt(config.auth.saltRounds)), null);
};


// checking if password is valid
UserSchema.methods.validPassword = function (password, checkPassword) {
  return bcrypt.compareSync(password, checkPassword);
};

UserSchema.virtual('userdevices', {
  ref: 'user_devices',
  localField: '_id',
  foreignField: 'userId'
});

// For pagination
UserSchema.plugin(mongooseAggregatePaginate);

// create the model for User and expose it to our app
module.exports = mongoose.model('User', UserSchema);