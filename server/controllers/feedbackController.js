import Feedback from '../models/Feedback.js';
import { predictSentiment } from './mlService.js';
import { isDbConnected } from '../config/db.js';
import { memoryFeedbacks } from '../config/inMemoryStore.js';

/**
 * @desc   Analyze text without saving to database (Live Sandbox / Test)
 * @route  POST /api/sentiment/analyze
 * @access Public
 */
export const analyzeSentiment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback text is required for sentiment analysis.',
      });
    }

    const analysis = await predictSentiment(text.trim());

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Analyze and submit feedback, saving to MongoDB
 * @route  POST /api/feedback/submit
 * @access Public / OptionalAuth
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { feedbackText, category } = req.body;

    if (!feedbackText || !feedbackText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide feedback text before submitting.',
      });
    }

    if (feedbackText.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Feedback must be at least 3 characters long.',
      });
    }

    // Run ML prediction
    const analysis = await predictSentiment(feedbackText.trim());

    // Prepare feedback document
    const feedbackData = {
      feedbackText: feedbackText.trim(),
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      probabilities: analysis.probabilities || {},
      lexicon: analysis.lexicon || {},
      category: category || 'General',
      modelUsed: analysis.model_type || 'TF-IDF + Logistic Regression',
      user: req.user ? (req.user._id || req.user.id) : null,
    };

    let savedFeedback = null;
    if (isDbConnected()) {
      savedFeedback = await Feedback.create(feedbackData);
    } else {
      savedFeedback = {
        _id: 'mem_fb_' + Date.now(),
        ...feedbackData,
        user: req.user ? { _id: req.user._id || req.user.id, name: req.user.name, role: req.user.role } : null,
        createdAt: new Date(),
      };
      memoryFeedbacks.unshift(savedFeedback);
    }

    res.status(201).json({
      success: true,
      message: 'Feedback analyzed and submitted successfully.',
      data: savedFeedback,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get recent feedback history
 * @route  GET /api/feedback/history
 * @access Public / OptionalAuth
 */
export const getFeedbackHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sentiment = req.query.sentiment;
    const category = req.query.category;
    const userOnly = req.query.userOnly === 'true';
          // Require login to access feedback history.
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Please log in to view feedback history.',
        });
      }

      // Only admins can view campus-wide feedback history.
      if (!userOnly && req.user.role !== 'faculty') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can view campus-wide feedback history.',
        });
      }

    // 1. If MongoDB is connected
    if (isDbConnected()) {
      const filter = {};
      if (sentiment && ['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
        filter.sentiment = sentiment;
      }
      if (category && category !== 'All') {
        filter.category = category;
      }
      if (userOnly && req.user) {
        filter.user = req.user._id || req.user.id;
      }

      const skip = (page - 1) * limit;

      const [feedbackList, total] = await Promise.all([
        Feedback.find(filter)
          .populate('user', 'name email role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Feedback.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        count: feedbackList.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: feedbackList,
      });
    }

    // 2. Memory Store fallback
    let filtered = [...memoryFeedbacks];
    if (sentiment && ['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
      filtered = filtered.filter((f) => f.sentiment === sentiment);
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((f) => f.category === category);
    }
    if (userOnly && req.user) {
      const uId = req.user._id || req.user.id;
      filtered = filtered.filter((f) => {
        if (!f.user) return false;
        return (f.user._id || f.user) === uId;
      });
    }

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: paginated,
      notice: 'Served from in-memory session. Configure MONGODB_URI in backend/.env for Atlas persistence.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a feedback entry
 * @route  DELETE /api/feedback/:id
 * @access Protected (Owner or Admin)
 */
export const deleteFeedback = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      const feedback = await Feedback.findById(id);
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback entry not found.',
        });
      }

      const userId = req.user._id || req.user.id;
      const isOwner = feedback.user && feedback.user.toString() === userId.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this feedback.',
        });
      }

      await Feedback.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'Feedback entry deleted successfully.',
      });
    }

    // Memory Store
    const index = memoryFeedbacks.findIndex((f) => f._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Feedback entry not found.',
      });
    }

    memoryFeedbacks.splice(index, 1);
    res.status(200).json({
      success: true,
      message: 'Feedback entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  analyzeSentiment,
  submitFeedback,
  getFeedbackHistory,
  deleteFeedback,
};
