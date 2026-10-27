import express from 'express';
import {
  submitFeedback,
  getFeedbackHistory,
  deleteFeedback,
} from '../controllers/feedbackController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { feedbackLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/submit', feedbackLimiter, optionalAuth, submitFeedback);
router.get('/history', optionalAuth, getFeedbackHistory);
router.delete('/:id', protect, deleteFeedback);

export default router;
