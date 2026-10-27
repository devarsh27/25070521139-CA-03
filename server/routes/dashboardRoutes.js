import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Only authenticated administrators can access dashboard statistics.
router.get(
  '/stats',
  authMiddleware.protect,
  authMiddleware.authorizeRoles('faculty'),
  getDashboardStats
);

export default router;