/**
 * authController.js — Handles signup, login, logout, and profile
 */

const User = require('../models/User');

// ── POST /api/auth/signup ──────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Create and save the new user (password hashed in pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    res.json({
      message: 'Logged in successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me — Get current authenticated user ─────────────────────────
const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/auth/theme — Save theme preference ─────────────────────────────
const updateTheme = async (req, res, next) => {
  try {
    const { theme } = req.body;
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme value.' });
    }
    req.user.theme = theme;
    await req.user.save({ validateBeforeSave: false });
    res.json({ theme: req.user.theme });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, updateTheme };
