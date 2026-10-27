import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  // If already logged in, redirect
  if (user) {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your campus email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container py-12">
      <div className="auth-card-wrapper max-w-md mx-auto">
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <div className="brand-icon mx-auto mb-3">
              <Sparkles size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted text-sm mt-1">
              Log in to manage feedback, submit reviews, and view sentiment analytics.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <Mail size={15} className="text-indigo-400" />
                <span>Campus Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-1.5">
                <Lock size={15} className="text-indigo-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block mt-4"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Log In to Universe</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider my-6 text-center text-xs text-slate-500">
            <span>SECURE SERVER AUTHENTICATION</span>
          </div>

          <div className="text-center text-sm text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>

        {/* Security badge notice */}
        <div className="text-center mt-4 text-xs text-slate-500">
          Protected by HttpOnly SameSite Session Cookies & Bcrypt
        </div>
      </div>
    </div>
  );
};

export default Login;
