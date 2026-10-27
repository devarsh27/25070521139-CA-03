import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
UserPlus,
User,
Mail,
Lock,
Briefcase,
AlertCircle,
Sparkles,
} from 'lucide-react';

export const Register = () => {
const { register, user } = useAuth();
const navigate = useNavigate();

const [formData, setFormData] = useState({
name: '',
email: '',
password: '',
confirmPassword: '',
role: 'student',
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Navigate after the user is authenticated.
useEffect(() => {
if (user) {
navigate('/anlyzer', { replace: true });
}
}, [user, navigate]);

const handleChange = (e) => {
const { name, value } = e.target;


setFormData((previous) => ({
  ...previous,
  [name]: value,
}));


};

const handleSubmit = async (e) => {
e.preventDefault();


if (loading) return;

const name = formData.name.trim();
const email = formData.email.trim().toLowerCase();
const { password, confirmPassword, role } = formData;

if (!name || !email || !password || !confirmPassword) {
  setError('Please fill in all required fields.');
  return;
}

if (password.length < 6) {
  setError('Password must be at least 6 characters long.');
  return;
}

if (password !== confirmPassword) {
  setError('Passwords do not match. Please re-enter.');
  return;
}

// Validate the email address.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  setError('Please provide a valid email address.');
  return;
}

setError(null);
setLoading(true);

try {
  await register(name, email, password, role);
  // AuthContext updates the user after successful registration.
  // The useEffect above handles navigation.
} catch (err) {
  setError(
    err.message ||
      'Registration failed. Please try again or use another email address.'
  );
} finally {
  setLoading(false);
}


};

return ( <div className="auth-page container py-12"> <div className="auth-card-wrapper max-w-md mx-auto"> <div className="glass-card p-8"> <div className="text-center mb-6"> <div className="brand-icon mx-auto mb-3"> <Sparkles size={22} className="text-white" /> </div>


        <h1 className="text-2xl font-bold">
          Create Campus Account
        </h1>

        <p className="text-muted text-sm mt-1">
          Join Universe to contribute feedback and monitor campus
          sentiment analytics.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label
            htmlFor="register-name"
            className="form-label flex items-center gap-1.5"
          >
            <User size={15} className="text-indigo-400" />
            <span>Full Name</span>
          </label>

          <input
            id="register-name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Priya Sharma"
            className="form-input"
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="register-email"
            className="form-label flex items-center gap-1.5"
          >
            <Mail size={15} className="text-indigo-400" />
            <span>Campus Email Address</span>
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="student@campus.edu"
            className="form-input"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="register-role"
            className="form-label flex items-center gap-1.5"
          >
            <Briefcase size={15} className="text-indigo-400" />
            <span>Campus Role</span>
          </label>

          <select
            id="register-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty / Instructor</option>
            <option value="user">General Staff / User</option>
          </select>
        </div>

        <div className="form-group">
          <label
            htmlFor="register-password"
            className="form-label flex items-center gap-1.5"
          >
            <Lock size={15} className="text-indigo-400" />
            <span>Password (Min 6 Characters)</span>
          </label>

          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="form-input"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="register-confirm-password"
            className="form-label flex items-center gap-1.5"
          >
            <Lock size={15} className="text-indigo-400" />
            <span>Confirm Password</span>
          </label>

          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            className="form-input"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block mt-4"
        >
          {loading ? (
            <span>Creating account...</span>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Register Account</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-slate-400 mt-6">
        Already registered?{' '}
        <Link
          to="/login"
          className="text-indigo-400 hover:underline font-semibold"
        >
          Log in here
        </Link>
      </div>
    </div>
  </div>
</div>


);
};

export default Register;
