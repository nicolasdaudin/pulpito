const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: [
      // this only works on CREATE and SAVE !!!
      // so for UPDSTES we need to SAVE instead of findOneAndUpdate
      function (el) {
        return this.password === el;
      },
      'Passwords are not the same!',
    ],
  },
  passwordChangedAt: Date,
  //role: String,
  //createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now;

  next();
});

userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  // we can not use this.password because we decided password is not available in the output (because of select:false)
  // so we send it in the arguments
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // because some users do not have this property
    return JWTTimestamp < changedTimestamp;
  }
  // false means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
