const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const otpModel = require("../models/otp.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/mailer.service');

// Tokens Helper
function generateTokens(id, role) {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', { expiresIn: '7d' });
  return { token, refreshToken };
}

// Generate 6 digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -------------------- OTP & User Auth --------------------

async function sendUserRegisterOTP(req, res) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Ensure password length
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const otp = generateOTP();
    // Save pending info to DB
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
    await user.save();

    res.status(201).json({ message: "User registered successfully", token, refreshToken, user: { _id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function sendUserLoginOTP(req, res) {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with this email" });

    const otp = generateOTP();
    await otpModel.deleteMany({ email, purpose: 'login' });
    await otpModel.create({ email, otp, purpose: 'login' });

    await sendEmail(email, "Login Verification Code", `<p>Your login verification code is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function verifyUserLoginOTP(req, res) {
  const { email, otp } = req.body;
  try {
    const otpDoc = await otpModel.findOne({ email, otp, purpose: 'login' });
    if (!otpDoc) return res.status(400).json({ message: "Invalid or expired OTP" });

    const user = await userModel.findOne({ email });
    await otpModel.deleteMany({ email, purpose: 'login' });

    const { token, refreshToken } = generateTokens(user._id, "user");
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({ message: "User logged in successfully", token, refreshToken, user: { _id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function resendOTP(req, res) {
  const { email, purpose } = req.body;
  try {
    const otp = generateOTP();
    let pendingUserData = null;
    if (purpose === 'register') {
      // Find the old one if it exists to preserve data
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

async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  try {
    const otpDoc = await otpModel.findOne({ email, otp, purpose: 'forgot-password' });
    if (!otpDoc) return res.status(400).json({ message: "Invalid or expired OTP" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshTokens = []; // Revoke all sessions
    await user.save();
    
    await otpModel.deleteMany({ email, purpose: 'forgot-password' });

    res.status(200).json({ message: "Password reset successful. All active sessions have been securely revoked." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


// -------------------- Food Partner OTP Registration --------------------

async function sendFoodPartnerRegisterOTP(req, res) {
  const { name, email, password, contactName, phone, address } = req.body;
  try {
    const existingPartner = await foodPartnerModel.findOne({ email });
    if (existingPartner) return res.status(400).json({ message: "Food partner account already exists" });

    // Validate all fields
    if (!name || !email || !password || !contactName || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const otp = generateOTP();
    // Save pending info to DB
    const hashedPassword = await bcrypt.hash(password, 10);
    await otpModel.deleteMany({ email, purpose: 'food-partner-register' });
    await otpModel.create({
      email, otp, purpose: 'food-partner-register',
      pendingUserData: { 
        name, 
        contactName, 
        phone, 
        address, 
        password: hashedPassword 
      }
    });

    await sendEmail(email, "Welcome to Hungry - Business Verification Code", `<p>Your business email verification code is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`);
    res.status(200).json({ message: "OTP sent to business email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function verifyFoodPartnerRegisterOTP(req, res) {
  const { email, otp } = req.body;
  try {
    const otpDoc = await otpModel.findOne({ email, otp, purpose: 'food-partner-register' });
    if (!otpDoc) return res.status(400).json({ message: "Invalid or expired OTP" });

    const foodPartner = await foodPartnerModel.create({
      name: otpDoc.pendingUserData.name,
      email,
      password: otpDoc.pendingUserData.password,
      contactName: otpDoc.pendingUserData.contactName,
      phone: otpDoc.pendingUserData.phone,
      address: otpDoc.pendingUserData.address
    });

    await otpModel.deleteMany({ email, purpose: 'food-partner-register' });

    const { token, refreshToken } = generateTokens(foodPartner._id, "foodPartner");
    foodPartner.refreshTokens.push(refreshToken);
    await foodPartner.save();

    res.status(201).json({
      message: "Food partner registered successfully",
      foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name },
      token, refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// -------------------- Food Partner Direct Login --------------------
async function registerFoodPartner(req, res) {
  const { name, email, password, phone, address, contactName } = req.body;
  try {
    const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });
    if (isAccountAlreadyExists) return res.status(400).json({ message: "Food partner account already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const foodPartner = await foodPartnerModel.create({
      name, email, password: hashedPassword, phone, address, contactName
    });

    const { token, refreshToken } = generateTokens(foodPartner._id, "foodPartner");
    foodPartner.refreshTokens.push(refreshToken);
    await foodPartner.save();

    res.status(201).json({
      message: "Food partner registered successfully",
      foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name },
      token, refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    const { token, refreshToken } = generateTokens(user._id, "user");
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Send login notification email
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">🔐 Login Notification</h2>
          <p style="color: #666; font-size: 14px;">Hello <strong>${user.fullName}</strong>,</p>
          <p style="color: #666; font-size: 14px;">Your account was successfully logged in with the following details:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #16b34a; margin: 15px 0;">
            <p style="margin: 8px 0; color: #555;"><strong>⏰ Time (IST):</strong> ${istTime}</p>
            <p style="margin: 8px 0; color: #555;"><strong>📱 Device:</strong> ${userAgent}</p>
          </div>
          <p style="color: #666; font-size: 14px;">If this wasn't you, please change your password immediately and contact our support team.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">This is an automated security notification from Hungry Peeps. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    try {
      await sendEmail(email, "🔐 Login Notification - Hungry Peeps", emailHtml);
    } catch (emailErr) {
      console.error("Failed to send login notification email:", emailErr);
      // Don't fail the login if email fails, just log it
    }

    res.status(200).json({
      message: "User logged in successfully",
      token, refreshToken,
      user: { _id: user._id, email: user.email, fullName: user.fullName }
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
    await foodPartner.save();

    res.status(200).json({
      message: "Food partner logged in successfully",
      foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name },
      token, refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

function logoutUser(req, res) {
  res.status(200).json({ message: "User logged out. Please remove token from local storage." });
}

function logoutFoodPartner(req, res) {
  res.status(200).json({ message: "Food partner logged out. Please remove token from local storage." });
}


// -------------------- Profile & JWT Rotation --------------------

function getTokenFromRequest(req) {
  return req.headers.authorization?.split(" ")[1];
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    let account = decoded.role === "user" ? await userModel.findById(decoded.id) : await foodPartnerModel.findById(decoded.id);
    
    if (!account || !account.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    // Rotate: Issue new pair, remove old
    const newTokens = generateTokens(decoded.id, decoded.role);
    account.refreshTokens = account.refreshTokens.filter(t => t !== refreshToken);
    account.refreshTokens.push(newTokens.refreshToken);
    await account.save();

    res.status(200).json(newTokens);
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
}

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
  sendUserLoginOTP,
  verifyUserLoginOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  
  sendFoodPartnerRegisterOTP,
  verifyFoodPartnerRegisterOTP,
  registerFoodPartner,
  loginUser,
  loginFoodPartner,
  logoutUser,
  logoutFoodPartner,
  
  refreshToken,
  getMe,
  updateProfile
};
