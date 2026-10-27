import express from 'express';
import { analyzeSentiment } from '../controllers/feedbackController.js';
import { feedbackLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/analyze', feedbackLimiter, analyzeSentiment);

export default router;
