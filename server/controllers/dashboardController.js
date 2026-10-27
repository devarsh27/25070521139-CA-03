import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryFeedbacks, memoryUsers } from '../config/inMemoryStore.js';

/**
 * @desc   Get comprehensive dashboard metrics from real MongoDB data
 * @route  GET /api/dashboard/stats
 * @access Public / OptionalAuth
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. If MongoDB is connected, execute real aggregations
    if (isDbConnected()) {
      const [countsBySentiment, totalFeedback, avgConfidenceData, recentFeedbacks, categoryCounts, totalUsers] =
        await Promise.all([
          // 1. Group by sentiment
          Feedback.aggregate([
            {
              $group: {
                _id: '$sentiment',
                count: { $sum: 1 },
              },
            },
          ]),

          // 2. Total count
          Feedback.countDocuments(),

          // 3. Average confidence
          Feedback.aggregate([
            {
              $group: {
                _id: null,
                avgConfidence: { $avg: '$confidence' },
              },
            },
          ]),

          // 4. Recent feedback items (10 latest)
          Feedback.find()
            .populate('user', 'name role')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

          // 5. Category breakdown
          Feedback.aggregate([
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ]),

          // 6. Registered users count
          User.countDocuments(),
        ]);

      let positive = 0;
      let negative = 0;
      let neutral = 0;

      countsBySentiment.forEach((item) => {
        if (item._id === 'Positive') positive = item.count;
        else if (item._id === 'Negative') negative = item.count;
        else if (item._id === 'Neutral') neutral = item.count;
      });

      const total = totalFeedback || (positive + negative + neutral);
      const positivePercentage = total > 0 ? parseFloat(((positive / total) * 100).toFixed(1)) : 0;
      const neutralPercentage = total > 0 ? parseFloat(((neutral / total) * 100).toFixed(1)) : 0;
      const negativePercentage = total > 0 ? parseFloat(((negative / total) * 100).toFixed(1)) : 0;
      const avgConfidence =
        avgConfidenceData.length > 0 && avgConfidenceData[0].avgConfidence
          ? parseFloat(avgConfidenceData[0].avgConfidence.toFixed(1))
          : 0;

      const distribution = [
        { name: 'Positive', count: positive, percentage: positivePercentage, color: '#10B981' },
        { name: 'Neutral', count: neutral, percentage: neutralPercentage, color: '#F59E0B' },
        { name: 'Negative', count: negative, percentage: negativePercentage, color: '#EF4444' },
      ];

      const categoryBreakdown = categoryCounts.map((cat) => ({
        name: cat._id || 'General',
        count: cat.count,
        percentage: total > 0 ? parseFloat(((cat.count / total) * 100).toFixed(1)) : 0,
      }));

      return res.status(200).json({
        success: true,
        dbStatus: 'connected',
        stats: {
          total,
          positive,
          negative,
          neutral,
          positivePercentage,
          negativePercentage,
          neutralPercentage,
          averageConfidence: avgConfidence,
          registeredUsers: totalUsers,
        },
        distribution,
        categoryBreakdown,
        recentFeedbacks,
      });
    }

    // 2. Memory Store fallback
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let totalConfidence = 0;
    const catMap = {};

    memoryFeedbacks.forEach((fb) => {
      if (fb.sentiment === 'Positive') positive++;
      else if (fb.sentiment === 'Negative') negative++;
      else if (fb.sentiment === 'Neutral') neutral++;

      if (fb.confidence) totalConfidence += fb.confidence;

      const c = fb.category || 'General';
      catMap[c] = (catMap[c] || 0) + 1;
    });

    const total = memoryFeedbacks.length;
    const positivePercentage = total > 0 ? parseFloat(((positive / total) * 100).toFixed(1)) : 0;
    const neutralPercentage = total > 0 ? parseFloat(((neutral / total) * 100).toFixed(1)) : 0;
    const negativePercentage = total > 0 ? parseFloat(((negative / total) * 100).toFixed(1)) : 0;
    const avgConfidence = total > 0 ? parseFloat((totalConfidence / total).toFixed(1)) : 0;

    const distribution = [
      { name: 'Positive', count: positive, percentage: positivePercentage, color: '#10B981' },
      { name: 'Neutral', count: neutral, percentage: neutralPercentage, color: '#F59E0B' },
      { name: 'Negative', count: negative, percentage: negativePercentage, color: '#EF4444' },
    ];

    const categoryBreakdown = Object.entries(catMap).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    }));

    const recentFeedbacks = memoryFeedbacks.slice(0, 10);

    res.status(200).json({
      success: true,
      dbStatus: 'in-memory-session',
      stats: {
        total,
        positive,
        negative,
        neutral,
        positivePercentage,
        negativePercentage,
        neutralPercentage,
        averageConfidence: avgConfidence,
        registeredUsers: memoryUsers.length,
      },
      distribution,
      categoryBreakdown,
      recentFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};

export default { getDashboardStats };
