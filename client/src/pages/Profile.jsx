import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  Edit2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  BarChart3,
  Trash2,
} from 'lucide-react';

export const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      fetchUserFeedbacks();
    }
  }, [user]);

  const fetchUserFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const res = await fetch('/api/feedback/history?userOnly=true&limit=15', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserFeedbacks(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Profile update failed');
      }

      setMsg({ type: 'success', text: 'Profile name updated successfully!' });
      setEditing(false);
      refreshUser();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      if (res.ok) {
        fetchUserFeedbacks();
      }
    } catch (err) {
      alert('Delete operation failed');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getSentimentBadge = (sentiment) => {
    if (sentiment === 'Positive') {
      return (
        <span className="badge badge-positive">
          <ThumbsUp size={12} /> Positive
        </span>
      );
    }
    if (sentiment === 'Negative') {
      return (
        <span className="badge badge-negative">
          <ThumbsDown size={12} /> Negative
        </span>
      );
    }
    return (
      <span className="badge badge-neutral">
        <MinusCircle size={12} /> Neutral
      </span>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{user.name}</span>
                  <span className="badge bg-indigo-500/20 text-indigo-300 text-xs py-0.5 px-2.5">
                    {user.role}
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm text-rose-300 hover:text-rose-200"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>

          {msg && (
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Details / Edit */}
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2 border-t border-slate-800">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                  {loading ? 'Saving...' : 'Save Name'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-4 border-t border-slate-800 grid-3 gap-4 text-sm">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Campus Role</span>
                <span className="font-semibold text-white capitalize">{user.role}</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Account Created</span>
                <span className="font-semibold text-white">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Display Name</span>
                  <span className="font-semibold text-white">{user.name}</span>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-indigo-400 transition"
                  title="Edit Name"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User's Submitted Feedbacks */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare size={20} className="text-indigo-400" />
                <span>My Feedback Submissions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                History of sentiment evaluations associated with your account
              </p>
            </div>
            <Link to="/analyzer" className="btn btn-primary btn-sm">
              + New Submission
            </Link>
          </div>

          {feedbacksLoading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Loading your submissions...</p>
            </div>
          ) : userFeedbacks.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="mb-2">You haven't submitted any campus feedback yet.</p>
              <Link to="/analyzer" className="text-indigo-400 hover:underline text-sm">
                Submit your first review now →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userFeedbacks.map((fb) => (
                <div
                  key={fb._id}
                  className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-start gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {getSentimentBadge(fb.sentiment)}
                      <span className="text-xs bg-slate-800 text-slate-300 py-0.5 px-2 rounded">
                        {fb.category || 'General'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {fb.confidence ? `${fb.confidence}% confidence` : ''}
                      </span>
                    </div>
                    <p className="text-slate-200 text-sm">{fb.feedbackText}</p>
                    <div className="text-xs text-slate-500">
                      {new Date(fb.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFeedback(fb._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="Delete submission"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
