import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Cpu,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
} from 'lucide-react';

export const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-badge">
            <Sparkles size={14} className="text-indigo-400" />
            <span>AI-Powered Campus Feedback Intelligence</span>
          </div>

          <h1 className="hero-title">
            Transform Student Feedback Into <br />
            <span className="gradient-text">Actionable Campus Insights</span>
          </h1>

          <p className="hero-subtitle">
            Universe analyzes campus sentiment in real time using a verified Negation-Aware
            TF-IDF and Logistic Regression model, persisted directly to MongoDB.
          </p>

          <div className="hero-cta-group">
            <Link to="/analyzer" className="btn btn-primary btn-lg">
              <Cpu size={19} />
              <span>Analyze Sentiment Now</span>
              <ArrowRight size={17} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              <BarChart3 size={19} />
              <span>Explore Live Dashboard</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="metrics-ribbon glass-card">
            <div className="metric-item">
              <span className="metric-val">300+</span>
              <span className="metric-lbl">Trained Campus Samples</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">3 Classes</span>
              <span className="metric-lbl">Positive · Neutral · Negative</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">Negation NLP</span>
              <span className="metric-lbl">"Not Bad" Aware Lexicon</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-val">Node.js + Mongo</span>
              <span className="metric-lbl">Compass Local / Atlas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Built for Modern Campus Administration</h2>
            <p className="section-subtitle">
              End-to-end feedback intelligence engineered with industry-standard web and ML practices.
            </p>
          </div>

          <div className="grid-3 features-grid">
            <div className="glass-card feature-card">
              <div className="feature-icon icon-indigo">
                <Cpu size={24} />
              </div>
              <h3 className="feature-title">Verified TF-IDF & Logistic Regression</h3>
              <p className="feature-text">
                Integrated with scikit-learn models utilizing auxiliary negation parsing to
                accurately differentiate nuanced student remarks.
              </p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-icon icon-emerald">
                <BarChart3 size={24} />
              </div>
              <h3 className="feature-title">Real-Time MongoDB Dashboard</h3>
              <p className="feature-text">
                Live aggregations dynamically calculate sentiment ratios, category distributions,
                and recent history without hardcoded mock figures.
              </p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-icon icon-purple">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Enterprise-Grade Security</h3>
              <p className="feature-text">
                Salted bcrypt password hashing, HttpOnly SameSite cookies, CSRF defenses,
                and rate limiting safeguard student and administrator privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How Universe Operates</h2>
            <p className="section-subtitle">From raw student text to structured institutional intelligence</p>
          </div>

          <div className="steps-grid">
            <div className="glass-card step-card">
              <div className="step-number">01</div>
              <h4 className="step-title">Feedback Submission</h4>
              <p className="step-text">
                Students or faculty submit impressions regarding events, labs, canteen, or curriculum.
              </p>
            </div>

            <div className="glass-card step-card">
              <div className="step-number">02</div>
              <h4 className="step-title">NLP Feature Pipeline</h4>
              <p className="step-text">
                Text is normalized, negation phrases are mapped, and TF-IDF vectors combine with lexicon scores.
              </p>
            </div>

            <div className="glass-card step-card">
              <div className="step-number">03</div>
              <h4 className="step-title">Analytics & Storage</h4>
              <p className="step-text">
                Predictions are stored in MongoDB and immediately reflected on the live dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="glass-card cta-card text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Analyze Campus Sentiment?</h2>
            <p className="text-muted mb-4 max-w-lg mx-auto">
              Test any student review or view institutional trends across all campus departments.
            </p>
            <div className="flex-center gap-3">
              <Link to="/analyzer" className="btn btn-primary">
                Try Sentiment Analyzer
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
