const mongoose = require('mongoose');

const User = mongoose.model('User', {
  name: String,
  role: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = User;
