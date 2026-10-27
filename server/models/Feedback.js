import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    feedbackText: {
      type: String,
      required: [true, 'Feedback text cannot be empty'],
      trim: true,
      minlength: [3, 'Feedback must be at least 3 characters long'],
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    sentiment: {
      type: String,
      required: [true, 'Sentiment result is required'],
      enum: {
        values: ['Positive', 'Negative', 'Neutral'],
        message: '{VALUE} is not a valid sentiment (must be Positive, Negative, or Neutral)',
      },
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    probabilities: {
      Positive: { type: Number, default: 0 },
      Neutral: { type: Number, default: 0 },
      Negative: { type: Number, default: 0 },
    },
    lexicon: {
      positive_words: { type: Number, default: 0 },
      negative_words: { type: Number, default: 0 },
      sentiment_score: { type: Number, default: 0 },
    },
    category: {
      type: String,
      enum: [
        'Academics',
        'Infrastructure',
        'Canteen & Food',
        'Events & Culture',
        'Administration',
        'Hostel',
        'General',
      ],
      default: 'General',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for public/guest feedback, populated if logged in
    },
    modelUsed: {
      type: String,
      default: 'TF-IDF + Logistic Regression',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying & aggregations in Dashboard
feedbackSchema.index({ sentiment: 1, createdAt: -1 });
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ category: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
