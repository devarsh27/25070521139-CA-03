import express from 'express';
import { submitContact } from '../controllers/contactController.js';
import { feedbackLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', feedbackLimiter, submitContact);

export default router;
