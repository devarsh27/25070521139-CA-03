import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Building,
} from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }

      setSuccessMsg(data.message);
      setFormData({
        name: '',
        email: '',
        department: 'Computer Science & Engineering',
        subject: '',
        message: '',
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page container py-8">
      {/* Header */}
      <div className="page-header text-center mb-8">
        <div className="hero-badge mx-auto mb-3">
          <Mail size={14} className="text-indigo-400" />
          <span>Campus Communication</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Contact & Inquiries</h1>
        <p className="text-muted max-w-lg mx-auto">
          Have questions regarding feedback aggregation, custom institutional pilots, or
          sentiment analysis integration? Get in touch with our team.
        </p>
      </div>

      <div className="grid-2 gap-8 mb-12">
        {/* Contact Form */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-400" />
            <span>Send Us a Message</span>
          </h2>

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@campus.edu"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Faculty</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-select"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Campus Administration & Facilities">Campus Administration & Facilities</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Question about feedback anonymization"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Details</label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your question or feedback suggestion in detail..."
                rows={4}
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Info & FAQ */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Building size={18} className="text-indigo-400" />
              <span>Campus Sentiment Lab</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-slate-400" />
                <span>Center for NLP & Campus Analytics, Building 4</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-slate-400" />
                <span>Mon – Fri: 09:00 AM – 05:00 PM IST</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-slate-400" />
                <span>sentiment-support@campus.universe.edu</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-purple-400" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                <strong className="text-slate-200 block mb-1">
                  Are student submissions anonymous?
                </strong>
                <p className="text-slate-400 text-xs">
                  Yes, public feedback can be submitted without creating an account.
                  Logged-in submissions record user references for personalized history tracking.
                </p>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                <strong className="text-slate-200 block mb-1">
                  How does the model handle negative phrases?
                </strong>
                <p className="text-slate-400 text-xs">
                  The model utilizes negation-aware tokenization to recognize phrases like
                  "not bad" or "did not disappoint", preventing misclassification.
                </p>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                <strong className="text-slate-200 block mb-1">
                  Where are dashboard figures fetched from?
                </strong>
                <p className="text-slate-400 text-xs">
                  All statistics and charts on the dashboard are calculated directly from
                  actual MongoDB records via Node.js Express aggregations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
