import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryUsers } from '../config/inMemoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check HttpOnly cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization Bearer header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. You must be logged in to view this resource.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'universe_campus_sentiment_dev_secret_jwt_2026_xyz987'
    );

    let user = null;
    if (isDbConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryUsers.find((u) => u._id === decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'universe_campus_sentiment_dev_secret_jwt_2026_xyz987'
    );

    let user = null;
    if (isDbConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryUsers.find((u) => u._id === decoded.id);
    }

    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Continue unauthenticated if token is invalid
  }
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'none'}' does not have permission to perform this action.`,
      });
    }
    next();
  };
};

export default { protect, optionalAuth, authorizeRoles };
