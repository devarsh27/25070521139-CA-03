import React from 'react';
import {
  Info,
  BookOpen,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle,
  Lightbulb,
  Layers,
  Code2,
} from 'lucide-react';

export const About = () => {
  return (
    <div className="about-page container py-8">
      {/* Page Header */}
      <div className="page-header text-center mb-10">
        <div className="hero-badge mx-auto mb-3">
          <Info size={14} className="text-indigo-400" />
          <span>About the Platform</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">
          Empowering Higher Education Through <br />
          <span className="gradient-text">Transparent Sentiment Intelligence</span>
        </h1>
        <p className="text-muted max-w-2xl mx-auto">
          Universe is an end-to-end full-stack campus sentiment analysis system designed
          to bridge the communication gap between students, educators, and campus administrators.
        </p>
      </div>

      {/* Mission & Problem Statement */}
      <div className="grid-2 mb-10">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Lightbulb size={24} />
            </div>
            <h3 className="text-xl font-bold">The Challenge</h3>
          </div>
          <p className="text-slate-300 leading-relaxed mb-3">
            Campuses receive thousands of informal feedback notes regarding technical workshops,
            canteen quality, lecture pacing, and campus events. Traditional paper surveys or
            rigid rating stars fail to capture the qualitative sentiment and nuance of student expressions.
          </p>
          <p className="text-slate-400 text-sm">
            Without automated NLP processing, critical negative sentiment often stays unaddressed,
            while positive student initiatives lack institutional visibility.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold">Our Solution</h3>
          </div>
          <p className="text-slate-300 leading-relaxed mb-3">
            Universe combines a trained scikit-learn NLP pipeline with an Express.js and MongoDB
            architecture. Student comments are automatically parsed, sentiment is categorized
            into Positive, Neutral, or Negative classes, and results are aggregated into real-time metrics.
          </p>
          <p className="text-slate-400 text-sm">
            Administrators can identify departmental pain points and track improvement trends over time.
          </p>
        </div>
      </div>

      {/* NLP Architecture Section */}
      <div className="glass-card p-8 mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <Cpu className="text-indigo-400" />
          <span>The Machine Learning Methodology</span>
        </h2>
        <p className="text-slate-300 mb-6">
          Standard bag-of-words classifiers fail when encountering negative polarity like
          <em> "the event was not bad at all"</em>. Our verified ML pipeline employs a dual-stage
          feature representation:
        </p>

        <div className="grid-3 gap-4">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div className="text-indigo-400 font-bold mb-2">1. Negation Tokenization</div>
            <p className="text-sm text-slate-300">
              Detects auxiliary negation patterns (e.g. <code>was_not_bad</code>, <code>did_not_like</code>)
              to preserve the contextual inversion of sentiment polarities.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div className="text-purple-400 font-bold mb-2">2. TF-IDF & Lexicon Stacking</div>
            <p className="text-sm text-slate-300">
              Combines scikit-learn TF-IDF n-grams with a negation-aware sentiment lexicon
              matrix using <code>scipy.sparse.hstack</code>.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold mb-2">3. Logistic Regression</div>
            <p className="text-sm text-slate-300">
              Calibrated multi-class classification providing discrete predictions
              alongside class probability distributions and confidence percentages.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Diagram */}
      <div className="glass-card p-8 mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Code2 className="text-indigo-400" />
          <span>Full-Stack Architecture</span>
        </h2>

        <div className="grid-4 gap-4 text-center">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-cyan-400 font-bold text-lg mb-1">Frontend</div>
            <div className="text-slate-200 font-semibold mb-1">React + Vite</div>
            <div className="text-xs text-slate-400">React Router, Lucide Icons, Responsive CSS</div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold text-lg mb-1">Backend</div>
            <div className="text-slate-200 font-semibold mb-1">Node.js + Express</div>
            <div className="text-xs text-slate-400">Primary server, REST APIs, Rate Limiting</div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-indigo-400 font-bold text-lg mb-1">Database</div>
            <div className="text-slate-200 font-semibold mb-1">MongoDB (Compass)</div>
            <div className="text-xs text-slate-400">Mongoose ODM, Aggregations, User/Feedback Schemas</div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-pink-400 font-bold text-lg mb-1">ML Engine</div>
            <div className="text-slate-200 font-semibold mb-1">Python Bridge</div>
            <div className="text-xs text-slate-400">TF-IDF Vectorizer & Logistic Regression Model</div>
          </div>
        </div>
      </div>

      {/* Ethics & Institutional Notice */}
      <div className="glass-card p-6 border-l-4 border-indigo-500">
        <div className="flex items-start gap-3">
          <ShieldCheck size={24} className="text-indigo-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-lg mb-1">Ethical Sentiment Analysis & Data Privacy</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Universe processes campus reviews to surface aggregated institutional trends.
              Passphrases are salted and hashed via bcrypt, user sessions are maintained strictly
              via HttpOnly cookies, and the system does not present unverified official institutional
              identity checks without explicit registrar validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
