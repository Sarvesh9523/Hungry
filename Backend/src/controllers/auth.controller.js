const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const otpModel = require("../models/otp.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/mailer.service');

// Tokens Helper
function generateTokens(id, role) {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  // ✅ CHANGED: removed fallback_refresh_secret — must be set in env
  return { token, refreshToken };
}

// Cookie helper — one place to define cookie options
function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// Generate 6 digit OTP — UNCHANGED
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -------------------- OTP & User Auth — UNCHANGED --------------------

async function sendUserRegisterOTP(req, res) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    await otpModel.deleteMany({ email, purpose: 'register' });
    await otpModel.create({
      email, otp, purpose: 'register',
      pendingUserData: { fullName: name, password: hashedPassword }
    });

    await sendEmail(email, "Welcome to Hungry Peeps - Verification Code", `<p>Your email verification code is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function verifyUserRegisterOTP(req, res) {
  const { email, otp } = req.body;
  try {
    const otpDoc = await otpModel.findOne({ email, otp, purpose: 'register' });
    if (!otpDoc) return res.status(400).json({ message: "Invalid or expired OTP" });

    const user = await userModel.create({
      fullName: otpDoc.pendingUserData.fullName,
      email,
      password: otpDoc.pendingUserData.password
    });

    await otpModel.deleteMany({ email, purpose: 'register' });

    const { token, refreshToken } = generateTokens(user._id, "user");
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5); // ✅ ADDED: cap tokens
    await user.save();

    setRefreshCookie(res, refreshToken); // ✅ CHANGED: set cookie instead of sending in body
    res.status(201).json({ message: "User registered successfully", token, user: { _id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ✅ CHANGED: was sendUserLoginOTP + verifyUserLoginOTP, now single password-based login
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with this email" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid password" });

    const { token, refreshToken } = generateTokens(user._id, "user");
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5); // ✅ cap tokens
    await user.save();

    // Login notification email — fires after response, non-blocking
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown device';
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    sendEmail(
      email,
      "New Login to Your Hungry Peeps Account",
      `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#0f0f0f;color:#fff;border-radius:12px;">
        <h2 style="color:#f472b6;">New Login Detected 🔐</h2>
        <p>Hi <strong>${user.fullName}</strong>, someone just logged into your account.</p>
        <table style="width:100%;margin-top:16px;">
          <tr><td style="color:#aaa;padding:8px 0;">🕐 Time</td><td>${time} (IST)</td></tr>
          <tr><td style="color:#aaa;padding:8px 0;">🌐 IP</td><td>${ip}</td></tr>
          <tr><td style="color:#aaa;padding:8px 0;">💻 Device</td><td>${userAgent}</td></tr>
        </table>
        <p style="color:#f87171;margin-top:24px;">If this wasn't you, reset your password immediately.</p>
      </div>`
    ).catch(() => {});

    setRefreshCookie(res, refreshToken); // ✅ cookie instead of body
    res.status(200).json({
      message: "Logged in successfully",
      token, // only access token in body
      user: { _id: user._id, email: user.email, fullName: user.fullName }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// UNCHANGED
async function resendOTP(req, res) {
  const { email, purpose } = req.body;
  try {
    const otp = generateOTP();
    let pendingUserData = null;
    if (purpose === 'register') {
      const oldOtp = await otpModel.findOne({ email, purpose });
      if (oldOtp) pendingUserData = oldOtp.pendingUserData;
    }
    await otpModel.deleteMany({ email, purpose });
    const createData = { email, otp, purpose };
    if (pendingUserData) createData.pendingUserData = pendingUserData;
    await otpModel.create(createData);
    await sendEmail(email, "Your Verification Code", `<p>Your verification code is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`);
    res.status(200).json({ message: "OTP resent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// UNCHANGED
async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with this email" });
    const otp = generateOTP();
    await otpModel.deleteMany({ email, purpose: 'forgot-password' });
    await otpModel.create({ email, otp, purpose: 'forgot-password' });
    await sendEmail(email, "Password Reset Code", `<p>Your password reset code is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`);
    res.status(200).json({ message: "Reset code sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// UNCHANGED
async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  try {
    const otpDoc = await otpModel.findOne({ email, otp, purpose: 'forgot-password' });
    if (!otpDoc) return res.status(400).json({ message: "Invalid or expired OTP" });
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshTokens = [];
    await user.save();
    await otpModel.deleteMany({ email, purpose: 'forgot-password' });
    res.status(200).json({ message: "Password reset successful. All active sessions have been securely revoked." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// -------------------- Food Partner — UNCHANGED --------------------

async function registerFoodPartner(req, res) {
  const { name, email, password, phone, address, contactName } = req.body;
  try {
    const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });
    if (isAccountAlreadyExists) return res.status(400).json({ message: "Food partner account already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const foodPartner = await foodPartnerModel.create({ name, email, password: hashedPassword, phone, address, contactName });
    const { token, refreshToken } = generateTokens(foodPartner._id, "foodPartner");
    foodPartner.refreshTokens.push(refreshToken);
    if (foodPartner.refreshTokens.length > 5) foodPartner.refreshTokens = foodPartner.refreshTokens.slice(-5);
    await foodPartner.save();
    setRefreshCookie(res, refreshToken); // ✅ cookie for food partner too
    res.status(201).json({
      message: "Food partner registered successfully",
      foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function loginFoodPartner(req, res) {
  const { email, password } = req.body;
  try {
    const foodPartner = await foodPartnerModel.findOne({ email });
    if (!foodPartner) return res.status(400).json({ message: "Invalid email or password" });
    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });
    const { token, refreshToken } = generateTokens(foodPartner._id, "foodPartner");
    foodPartner.refreshTokens.push(refreshToken);
    if (foodPartner.refreshTokens.length > 5) foodPartner.refreshTokens = foodPartner.refreshTokens.slice(-5);
    await foodPartner.save();
    setRefreshCookie(res, refreshToken); // ✅ cookie
    res.status(200).json({
      message: "Food partner logged in successfully",
      foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ✅ CHANGED: actually invalidates the token from DB + clears cookie
async function logoutUser(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const user = await userModel.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ message: "Logged out successfully" });
}

// ✅ CHANGED: same as logoutUser
async function logoutFoodPartner(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const fp = await foodPartnerModel.findOne({ refreshTokens: refreshToken });
    if (fp) {
      fp.refreshTokens = fp.refreshTokens.filter(t => t !== refreshToken);
      await fp.save();
    }
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ message: "Logged out successfully" });
}

// -------------------- JWT Rotation --------------------

function getTokenFromRequest(req) {
  return req.headers.authorization?.split(" ")[1];
}

// ✅ CHANGED: reads refreshToken from cookie instead of body
async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken; // from cookie now
  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    let account = decoded.role === "user"
      ? await userModel.findById(decoded.id)
      : await foodPartnerModel.findById(decoded.id);

    if (!account || !account.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const newTokens = generateTokens(decoded.id, decoded.role);
    account.refreshTokens = account.refreshTokens.filter(t => t !== refreshToken);
    account.refreshTokens.push(newTokens.refreshToken);
    if (account.refreshTokens.length > 5) account.refreshTokens = account.refreshTokens.slice(-5);
    await account.save();

    setRefreshCookie(res, newTokens.refreshToken); // ✅ rotate cookie
    res.status(200).json({ token: newTokens.token }); // only access token in body
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
}

// UNCHANGED
async function getMe(req, res) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let profile;
    if (decoded.role === "user") profile = await userModel.findById(decoded.id).select("-password -refreshTokens");
    else if (decoded.role === "foodPartner") profile = await foodPartnerModel.findById(decoded.id).select("-password -refreshTokens");
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ role: decoded.role, profile });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// UNCHANGED
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, avatar } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(userId, { nickname, avatar }, { new: true }).select("-password -refreshTokens");
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendUserRegisterOTP,
  verifyUserRegisterOTP,
  loginUser,           // ✅ replaces sendUserLoginOTP + verifyUserLoginOTP
  resendOTP,
  forgotPassword,
  resetPassword,
  registerFoodPartner,
  loginFoodPartner,
  logoutUser,
  logoutFoodPartner,
  refreshToken,
  getMe,
  updateProfile
};
