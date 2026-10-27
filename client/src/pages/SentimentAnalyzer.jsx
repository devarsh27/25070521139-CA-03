import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cpu,
  Send,
  Sparkles,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tag,
  Clock,
  Layers,
} from 'lucide-react';

const CATEGORIES = [
  'General',
  'Academics',
  'Infrastructure',
  'Canteen & Food',
  'Events & Culture',
  'Administration',
  'Hostel',
];

const PRESETS = [
  {
    label: 'Positive Event',
    text: 'The campus technical symposium was amazing and well organized by the faculty.',
    category: 'Events & Culture',
  },
  {
    label: 'Negative Canteen',
    text: 'The canteen food was terrible and the service was extremely slow.',
    category: 'Canteen & Food',
  },
  {
    label: 'Neutral Announcement',
    text: 'The workshop schedule was posted on the notice board this morning.',
    category: 'Academics',
  },
  {
    label: 'Negation Nuance',
    text: 'The examination hall arrangements were not bad at all.',
    category: 'Infrastructure',
  },
];

export const SentimentAnalyzer = () => {
  const { user } = useAuth();
  const [feedbackText, setFeedbackText] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyzeOnly = async () => {
    if (!feedbackText.trim()) {
      setError('Please enter feedback text to analyze.');
      return;
    }
    setError(null);
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/sentiment/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ text: feedbackText.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Analysis failed');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAndSave = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError('Please enter feedback text before submitting.');
      return;
    }
    setError(null);
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          feedbackText: feedbackText.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }

      setResult(data.analysis || data.data);
      setSavedSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setFeedbackText(preset.text);
    setCategory(preset.category);
    setError(null);
  };

  const getSentimentBadge = (sentiment) => {
    if (sentiment === 'Positive') {
      return (
        <div className="badge badge-positive text-base py-1 px-4">
          <ThumbsUp size={16} />
          <span>Positive Sentiment</span>
        </div>
      );
    }
    if (sentiment === 'Negative') {
      return (
        <div className="badge badge-negative text-base py-1 px-4">
          <ThumbsDown size={16} />
          <span>Negative Sentiment</span>
        </div>
      );
    }
    return (
      <div className="badge badge-neutral text-base py-1 px-4">
        <MinusCircle size={16} />
        <span>Neutral Sentiment</span>
      </div>
    );
  };

  return (
    <div className="analyzer-page container py-8">
      {/* Page Header */}
      <div className="page-header text-center mb-8">
        <div className="hero-badge mx-auto mb-3">
          <Cpu size={14} className="text-indigo-400" />
          <span>Trained Model Classifier</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Campus Sentiment Analyzer</h1>
        <p className="text-muted max-w-xl mx-auto">
          Evaluate student feedback using our verified TF-IDF and Logistic Regression model
          with negation-aware lexicon parsing.
        </p>
      </div>

      <div className="analyzer-layout grid-2 gap-6">
        {/* Input Panel */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
            <span>Enter Feedback</span>
            {user ? (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 py-1 px-2.5 rounded-full">
                Submitting as {user.name} ({user.role})
              </span>
            ) : (
              <span className="text-xs bg-slate-800 text-slate-400 py-1 px-2.5 rounded-full">
                Guest Mode (Optional Login)
              </span>
            )}
          </h2>

          {/* Quick Presets */}
          <div className="mb-4">
            <span className="text-xs text-slate-400 block mb-2 font-medium">Quick Test Examples:</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="preset-btn"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmitAndSave}>
            {/* Category Selector */}
            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <Tag size={15} className="text-indigo-400" />
                <span>Campus Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Textarea */}
            <div className="form-group">
              <label className="form-label">
                Feedback Comment / Review
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your experience regarding classes, labs, events, facilities, canteen..."
                className="form-textarea"
                rows={5}
                maxLength={2000}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Supports natural campus language & negations</span>
                <span>{feedbackText.length} / 2000 chars</span>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} />
                <span>
                  Feedback saved to MongoDB! View it live on the{' '}
                  <Link to="/dashboard" className="underline font-bold text-white">
                    Dashboard
                  </Link>.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !feedbackText.trim()}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <Send size={17} />
                    <span>Analyze & Save to Database</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAnalyzeOnly}
                disabled={loading || !feedbackText.trim()}
                className="btn btn-secondary"
                title="Run inference without saving record"
              >
                <span>Live Test Only</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              <span>Model Prediction</span>
              {result && (
                <span className="text-xs text-slate-400">
                  {result.model_type || 'TF-IDF + Logistic Regression'}
                </span>
              )}
            </h2>

            {!result ? (
              <div className="empty-result-state text-center py-12">
                <div className="p-4 bg-slate-800/40 rounded-full inline-flex mb-3 text-slate-400">
                  <Sparkles size={36} />
                </div>
                <h3 className="font-semibold text-slate-300 mb-1">Awaiting Feedback Input</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Type a campus comment or pick an example above and click Analyze to view
                  probability distributions.
                </p>
              </div>
            ) : (
              <div className="analysis-results animate-fade-in">
                {/* Result Hero Header */}
                <div className="result-header p-5 bg-slate-900/60 rounded-xl border border-slate-800 mb-6 text-center">
                  <div className="mb-2">{getSentimentBadge(result.sentiment)}</div>
                  <div className="confidence-label text-sm text-slate-300">
                    Confidence Score:{' '}
                    <span className="font-bold text-white text-lg ml-1">
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                {/* Probability Distribution Bars */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-between">
                    <span>Class Probabilities</span>
                    <span className="text-xs text-slate-400">Multi-class calibration</span>
                  </h4>

                  <div className="space-y-3">
                    {/* Positive */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ThumbsUp size={13} /> Positive
                        </span>
                        <span className="text-slate-300">
                          {((result.probabilities?.Positive || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(result.probabilities?.Positive || 0) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Neutral */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-amber-400 flex items-center gap-1">
                          <MinusCircle size={13} /> Neutral
                        </span>
                        <span className="text-slate-300">
                          {((result.probabilities?.Neutral || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(result.probabilities?.Neutral || 0) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Negative */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-rose-400 flex items-center gap-1">
                          <ThumbsDown size={13} /> Negative
                        </span>
                        <span className="text-slate-300">
                          {((result.probabilities?.Negative || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(result.probabilities?.Negative || 0) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lexicon Features Breakdown */}
                {result.lexicon && (
                  <div className="lexicon-breakdown p-4 bg-slate-900/40 rounded-xl border border-slate-800 mb-4">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      NLP Lexicon Metrics
                    </h5>
                    <div className="grid-3 text-center gap-2">
                      <div className="p-2 bg-slate-800/60 rounded">
                        <div className="text-emerald-400 font-bold text-sm">
                          {result.lexicon.positive_words}
                        </div>
                        <div className="text-xs text-slate-400">Pos Words</div>
                      </div>
                      <div className="p-2 bg-slate-800/60 rounded">
                        <div className="text-rose-400 font-bold text-sm">
                          {result.lexicon.negative_words}
                        </div>
                        <div className="text-xs text-slate-400">Neg Words</div>
                      </div>
                      <div className="p-2 bg-slate-800/60 rounded">
                        <div className="text-indigo-400 font-bold text-sm">
                          {result.lexicon.sentiment_score}
                        </div>
                        <div className="text-xs text-slate-400">Net Score</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {result && (
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Category: <strong className="text-white">{category}</strong></span>
              <Link to="/dashboard" className="text-indigo-400 hover:underline flex items-center gap-1">
                <BarChart3 size={14} />
                <span>View Dashboard</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalyzer;
