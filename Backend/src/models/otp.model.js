const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, required: true }, // 'login', 'register', 'forgot-password'
  pendingUserData: { type: Object }, // if it's for 'register', we temporarily hold the name and password here
  createdAt: { type: Date, default: Date.now, expires: 300 } // automatically delete after 5 minutes
});

module.exports = mongoose.model("otp", otpSchema);
