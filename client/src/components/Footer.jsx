import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, Github, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container footer-content">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col">
            <div className="brand-logo footer-brand">
              <div className="brand-icon">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="brand-title">Universe</span>
            </div>
            <p className="footer-desc">
              Next-generation campus sentiment intelligence powered by TF-IDF,
              negation-aware NLP modeling, and real-time MongoDB analytics.
            </p>
            <div className="security-note">
              <Shield size={15} className="text-emerald-400" />
              <span>Full-Stack MERN Architecture with Secure HttpOnly Auth</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/analyzer">Sentiment Analyzer</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Research & Tech */}
          <div className="footer-col">
            <h4 className="footer-heading">Technology</h4>
            <ul className="footer-links">
              <li><span>React.js & Vite</span></li>
              <li><span>Node.js & Express</span></li>
              <li><span>MongoDB (Compass) & Mongoose</span></li>
              <li><span>Scikit-Learn Logistic Regression</span></li>
              <li><span>Bcrypt & HttpOnly Cookies</span></li>
            </ul>
          </div>

          {/* Compliance & Notice */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform Notice</h4>
            <p className="footer-notice-text">
              Universe Campus Sentiment provides natural language feedback classification
              trained on academic & campus experiences. Analysis operates securely without
              unverified third-party claims.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Universe Campus Sentiment Analysis. Built with React & Node.js.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
