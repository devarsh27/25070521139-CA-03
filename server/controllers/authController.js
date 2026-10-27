import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryUsers } from '../config/inMemoryStore.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'universe_campus_sentiment_dev_secret_jwt_2026_xyz987',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to set HttpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id || user.id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token, // Also provided for clients wanting Authorization header
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const allowedRoles = ['student', 'faculty', 'user'];
    const userRole = role && allowedRoles.includes(role) ? role : 'student';

    // 1. If MongoDB is connected, use Mongoose
    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: userRole,
      });

      return sendTokenResponse(user, 201, res);
    }

    // 2. If MongoDB is pending Atlas URI, use Memory Store
    const existingMemoryUser = memoryUsers.find((u) => u.email === normalizedEmail);
    if (existingMemoryUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const memoryUser = {
      _id: 'mem_user_' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      createdAt: new Date(),
    };
    memoryUsers.push(memoryUser);

    sendTokenResponse(memoryUser, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Authenticate user & log in
 * @route  POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected
    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please verify your email and password.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please verify your email and password.',
        });
      }

      return sendTokenResponse(user, 200, res);
    }

    // 2. Memory Store fallback
    const memoryUser = memoryUsers.find((u) => u.email === normalizedEmail);
    if (!memoryUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const isMatch = await bcrypt.compare(password, memoryUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    sendTokenResponse(memoryUser, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Log out user & clear cookie
 * @route  POST /api/auth/logout
 * @access Public
 */
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out.',
  });
};

/**
 * @desc   Get current logged-in user session
 * @route  GET /api/auth/me
 * @access Protected
 */
export const getMe = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id || req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.',
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory Store
    const memoryUser = memoryUsers.find((u) => u._id === (req.user.id || req.user._id));
    if (!memoryUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: memoryUser._id,
        name: memoryUser.name,
        email: memoryUser.email,
        role: memoryUser.role,
        createdAt: memoryUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update user profile (name)
 * @route  PUT /api/auth/profile
 * @access Protected
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be blank.',
      });
    }

    const userId = req.user.id || req.user._id;

    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(
        userId,
        { name: name.trim() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    // Memory store
    const memUser = memoryUsers.find((u) => u._id === userId);
    if (memUser) {
      memUser.name = name.trim();
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: memUser ? memUser._id : userId,
        name: memUser ? memUser.name : name.trim(),
        email: memUser ? memUser.email : req.user.email,
        role: memUser ? memUser.role : req.user.role,
        createdAt: memUser ? memUser.createdAt : new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { register, login, logout, getMe, updateProfile };
