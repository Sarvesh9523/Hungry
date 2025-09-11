const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// -------------------- User --------------------
async function registerUser(req, res) {
  const { fullName, email, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({ email });
  if (isUserAlreadyExists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({ fullName, email, password: hashedPassword });

  const token = generateToken(user._id, "user");

  // Set cookie (optional, mostly for desktop)
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,         
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    message: "User registered successfully",
    user: { _id: user._id, email: user.email, fullName: user.fullName },
    token // send token for mobile storage
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

  const token = generateToken(user._id, "user");

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    message: "User logged in successfully",
    user: { _id: user._id, email: user.email, fullName: user.fullName },
    token // send token for mobile
  });
}

function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
}

// -------------------- Food Partner --------------------
async function registerFoodPartner(req, res) {
  const { name, email, password, phone, address, contactName } = req.body;

  const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });
  if (isAccountAlreadyExists) return res.status(400).json({ message: "Food partner account already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const foodPartner = await foodPartnerModel.create({
    name, email, password: hashedPassword, phone, address, contactName
  });

  const token = generateToken(foodPartner._id, "foodPartner");

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    message: "Food partner registered successfully",
    foodPartner: { 
      _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name, 
      address: foodPartner.address, contactName: foodPartner.contactName, phone: foodPartner.phone 
    },
    token
  });
}

async function loginFoodPartner(req, res) {
  const { email, password } = req.body;

  const foodPartner = await foodPartnerModel.findOne({ email });
  if (!foodPartner) return res.status(400).json({ message: "Invalid email or password" });

  const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
  if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

  const token = generateToken(foodPartner._id, "foodPartner");

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    message: "Food partner logged in successfully",
    foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name },
    token
  });
}

function logoutFoodPartner(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Food partner logged out successfully" });
}

// -------------------- Profile --------------------
function getTokenFromRequest(req) {
  return req.cookies.token || req.headers.authorization?.split(" ")[1];
}

async function getMe(req, res) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let profile;
    if (decoded.role === "user") {
      profile = await userModel.findById(decoded.id).select("-password");
    } else if (decoded.role === "foodPartner") {
      profile = await foodPartnerModel.findById(decoded.id).select("-password");
    }

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json({ role: decoded.role, profile });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // must be set by auth middleware
    const { nickname, avatar } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(userId, { nickname, avatar }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
  getMe,
  updateProfile
};
