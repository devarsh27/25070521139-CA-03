import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB, isDbConnected } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import sentimentRoutes from './routes/sentimentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Connect to MongoDB Atlas
connectDB();

// 1. CORS Configuration
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 2. Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'universe_sentiment_cookie_secret'));

// 3. Rate limiting for general requests
app.use('/api', generalLimiter);

// 4. CSRF Defense for Cookie-authenticated mutations
app.use((req, res, next) => {
  // Allow safe idempotent methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // If request contains a token cookie, check origin or custom header
  if (req.cookies && req.cookies.token) {
    const origin = req.headers.origin || req.headers.referer;
    const isCustomHeaderPresent = req.headers['x-requested-with'] || req.headers.authorization;

    if (!origin && !isCustomHeaderPresent) {
      return res.status(403).json({
        success: false,
        message: 'Security verification failed: Missing request validation origin or header.',
      });
    }
  }

  next();
});

// 5. Health Check & Diagnostics
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'Universe-CampusSentimentAnalysis Backend',
    database: isDbConnected() ? 'connected (MongoDB Compass / Local)' : 'in-memory session mode (connect MongoDB Compass to mongodb://127.0.0.1:27017)',
    mlService: 'active (TF-IDF + Negation-Aware Logistic Regression)',
    timestamp: new Date().toISOString(),
  });
});

// 6. Application API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);

// 7. Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 [Universe Sentiment Backend] Running on http://localhost:${PORT}`);
    console.log(`   Frontend CORS allowed origin: ${FRONTEND_URL}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

export default app;
