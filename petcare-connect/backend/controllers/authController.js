const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  address: u.address,
  role: u.role,
  specialisation: u.specialisation,
  licenseNo: u.licenseNo,
  isActive: u.isActive,
});

// @desc    Register a pet owner account   @route POST /api/auth/register   @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "This email is already registered" });

    // public sign-up always creates an owner account; staff are created by Admin (FR-12)
    const user = await User.create({ name, email, password, phone, address, role: "owner" });

    res.status(201).json({ user: publicUser(user), token: generateToken(user) });
  } catch (err) {
    next(err);
  }
};

// @desc    Log in any role   @route POST /api/auth/login   @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated. Contact the clinic admin." });
    }

    res.json({ user: publicUser(user), token: generateToken(user) });
  } catch (err) {
    next(err);
  }
};

// @desc    Current logged in profile   @route GET /api/auth/me   @access Private
const getMe = async (req, res) => res.json({ user: publicUser(req.user) });

// @desc    Update own profile   @route PUT /api/auth/me   @access Private
const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, address, specialisation, password } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (specialisation !== undefined && user.role === "doctor") user.specialisation = specialisation;
    if (password) user.password = password; // re-hashed by the model hook

    await user.save();
    res.json({ user: publicUser(user), message: "Profile updated" });
  } catch (err) {
    next(err);
  }
};

// @desc    Request password reset (FR-14)   @route POST /api/auth/forgot-password   @access Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    // same response either way so emails cannot be harvested
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent" });

    const token = crypto.randomBytes(24).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // Simulated email delivery for the project demo
    console.log(`[reset link] ${process.env.CLIENT_URL}/reset-password/${token}`);

    res.json({
      message: "If that email exists, a reset link has been sent",
      resetToken: process.env.NODE_ENV === "production" ? undefined : token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set a new password   @route POST /api/auth/reset-password/:token   @access Public
const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() },
    }).select("+resetToken +resetTokenExpiry");

    if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired" });

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password changed. You can log in now." });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe, forgotPassword, resetPassword };
