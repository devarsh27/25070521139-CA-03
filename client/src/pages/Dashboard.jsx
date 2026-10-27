import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Database,
  RefreshCw,
  Filter,
  Trash2,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Layers,
  PieChart as PieIcon,
  ArrowUpRight,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('connected');

  // Filters
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [userOnly, setUserOnly] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [sentimentFilter, categoryFilter, userOnly]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch live aggregate statistics
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      const statsData = await statsRes.json();

      if (statsRes.ok && statsData.success) {
        setStats(statsData);
        setDbStatus(statsData.dbStatus);
      }

      // 2. Fetch filtered feedback history
      let historyUrl = `/api/feedback/history?limit=25`;
      if (sentimentFilter !== 'All') historyUrl += `&sentiment=${sentimentFilter}`;
      if (categoryFilter !== 'All') historyUrl += `&category=${encodeURIComponent(categoryFilter)}`;
      if (userOnly) historyUrl += `&userOnly=true`;

      const historyRes = await fetch(historyUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      const historyData = await historyRes.json();

      if (historyRes.ok && historyData.success) {
        setFeedbacks(historyData.data || []);
      }
    } catch (err) {
      setError('Unable to load dashboard data from backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback entry?')) return;

    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to delete feedback');
      }
    } catch (err) {
      alert('Delete operation failed.');
    }
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

  const total = stats?.stats?.total || 0;
  const positive = stats?.stats?.positive || 0;
  const neutral = stats?.stats?.neutral || 0;
  const negative = stats?.stats?.negative || 0;

  const posPct = total > 0 ? ((positive / total) * 100).toFixed(1) : 0;
  const neuPct = total > 0 ? ((neutral / total) * 100).toFixed(1) : 0;
  const negPct = total > 0 ? ((negative / total) * 100).toFixed(1) : 0;

  return (
    <div className="dashboard-page container py-8">
      {/* Top Header & DB Status */}
      <div className="dashboard-header flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">Campus Sentiment Dashboard</h1>
            <span
              className={`status-indicator ${
                dbStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              } text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1`}
            >
              <Database size={12} />
              {dbStatus === 'connected' ? 'MongoDB Compass Live' : 'MongoDB (Session Mode)'}
            </span>
          </div>
          <p className="text-muted text-sm">
            Live aggregated metrics computed from verified student submissions in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Refresh MongoDB Stats"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link to="/analyzer" className="btn btn-primary btn-sm">
            <span>+ Add Feedback</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Required Metric KPI Cards */}
      <div className="grid-4 mb-8">
        {/* Total Submissions */}
        <div className="glass-card stat-card p-5">
          <div className="stat-icon-wrapper bg-indigo-500/10 text-indigo-400 mb-3">
            <BarChart3 size={22} />
          </div>
          <div className="stat-label text-slate-400 text-xs font-semibold uppercase">
            Total Submissions
          </div>
          <div className="stat-number text-3xl font-extrabold text-white mt-1">
            {total}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Campus-wide verified submissions
          </div>
        </div>

        {/* Positive Count */}
        <div className="glass-card stat-card p-5 border-l-4 border-emerald-500">
          <div className="stat-icon-wrapper bg-emerald-500/10 text-emerald-400 mb-3">
            <ThumbsUp size={22} />
          </div>
          <div className="stat-label text-slate-400 text-xs font-semibold uppercase">
            Positive Feedback
          </div>
          <div className="stat-number text-3xl font-extrabold text-emerald-400 mt-1">
            {positive}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            <strong className="text-emerald-400">{posPct}%</strong> of total campus feedback
          </div>
        </div>

        {/* Neutral Count */}
        <div className="glass-card stat-card p-5 border-l-4 border-amber-500">
          <div className="stat-icon-wrapper bg-amber-500/10 text-amber-400 mb-3">
            <MinusCircle size={22} />
          </div>
          <div className="stat-label text-slate-400 text-xs font-semibold uppercase">
            Neutral Feedback
          </div>
          <div className="stat-number text-3xl font-extrabold text-amber-400 mt-1">
            {neutral}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            <strong className="text-amber-400">{neuPct}%</strong> of total campus feedback
          </div>
        </div>

        {/* Negative Count */}
        <div className="glass-card stat-card p-5 border-l-4 border-rose-500">
          <div className="stat-icon-wrapper bg-rose-500/10 text-rose-400 mb-3">
            <ThumbsDown size={22} />
          </div>
          <div className="stat-label text-slate-400 text-xs font-semibold uppercase">
            Negative Feedback
          </div>
          <div className="stat-number text-3xl font-extrabold text-rose-400 mt-1">
            {negative}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            <strong className="text-rose-400">{negPct}%</strong> requires campus attention
          </div>
        </div>
      </div>

      {/* Sentiment Distribution Chart & Category Breakdown */}
      <div className="grid-2 mb-8">
        {/* Sentiment Distribution Chart */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PieIcon size={18} className="text-indigo-400" />
              <span>Sentiment Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Total: {total} records</span>
          </div>

          {total === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>No feedback recorded yet in MongoDB.</p>
              <Link to="/analyzer" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
                Submit the first feedback →
              </Link>
            </div>
          ) : (
            <div>
              {/* Segmented Visual Stacked Bar Chart */}
              <div className="distribution-bar-wrapper mb-6">
                <div className="flex h-5 w-full rounded-full overflow-hidden bg-slate-800">
                  <div
                    style={{ width: `${posPct}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Positive: ${positive} (${posPct}%)`}
                  ></div>
                  <div
                    style={{ width: `${neuPct}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title={`Neutral: ${neutral} (${neuPct}%)`}
                  ></div>
                  <div
                    style={{ width: `${negPct}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Negative: ${negative} (${negPct}%)`}
                  ></div>
                </div>
              </div>

              {/* Legend & Breakdown stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-medium">Positive</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{positive}</span>
                    <span className="text-xs text-slate-400 w-12 text-right">{posPct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-medium">Neutral</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{neutral}</span>
                    <span className="text-xs text-slate-400 w-12 text-right">{neuPct}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="text-sm font-medium">Negative</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{negative}</span>
                    <span className="text-xs text-slate-400 w-12 text-right">{negPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Layers size={18} className="text-purple-400" />
              <span>Campus Category Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">Institutional Departments</span>
          </div>

          {(!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0) ? (
            <div className="text-center py-10 text-slate-400">
              <p>Category metrics will populate upon submission.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <span className="text-xs text-slate-400">
                      {cat.count} submissions ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Feedback History */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              <span>Recent Feedback History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Direct entries stored in MongoDB (Compass / Local) with model predictions
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sentiment filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter size={14} className="text-slate-400" />
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="form-select py-1 px-2 text-xs"
              >
                <option value="All">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select py-1 px-2 text-xs"
            >
              <option value="All">All Categories</option>
              <option value="Academics">Academics</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Canteen & Food">Canteen & Food</option>
              <option value="Events & Culture">Events & Culture</option>
              <option value="Administration">Administration</option>
              <option value="Hostel">Hostel</option>
              <option value="General">General</option>
            </select>

            {user && (
              <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userOnly}
                  onChange={(e) => setUserOnly(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>My submissions only</span>
              </label>
            )}
          </div>
        </div>

        {/* History Table */}
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No feedback entries match the selected filters.</p>
          </div>
        ) : (
          <div className="table-responsive overflow-x-auto">
            <table className="feedback-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                  <th className="pb-3 px-3">Sentiment</th>
                  <th className="pb-3 px-3">Feedback Text</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Confidence</th>
                  <th className="pb-3 px-3">Submitted By</th>
                  <th className="pb-3 px-3">Date</th>
                  {(user?.role === 'admin' || user) && (
                    <th className="pb-3 px-3 text-right">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {feedbacks.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSentimentBadge(item.sentiment)}
                    </td>
                    <td className="py-3 px-3 max-w-md">
                      <p className="line-clamp-2 text-slate-200">{item.feedbackText}</p>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-xs bg-slate-800 text-slate-300 py-1 px-2 rounded">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-300">
                      {item.confidence ? `${item.confidence}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-400">
                      {item.user ? item.user.name : 'Guest User'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    {(user?.role === 'admin' || (user && item.user?._id === user.id)) && (
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteFeedback(item._id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
