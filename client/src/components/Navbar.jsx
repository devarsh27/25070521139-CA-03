import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Home,
  Info,
  BarChart2,
  Cpu,
  Mail,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `nav-item ${
      isActive
        ? 'nav-item-active text-indigo-400 font-semibold'
        : 'text-slate-300 hover:text-white'
    }`;

  return (
    <nav className="glass-navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Universe</span>
            <span className="brand-subtitle">Campus Sentiment</span>
          </div>
        </Link>

        {/* Desktop Navigation Links in Exact Order:
            1. Home
            2. About Us
            3. Sentiment Analyzer
            4. Dashboard
            5. Contact Us
            6. Login/Register (when logged out)
            7. Profile/Logout (when logged in)
        */}
        <div className="nav-links desktop-menu">
          <NavLink to="/" className={navLinkClass}>
            <Home size={17} />
            <span>Home</span>
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            <Info size={17} />
            <span>About Us</span>
          </NavLink>

          <NavLink to="/analyzer" className={navLinkClass}>
            <Cpu size={17} />
            <span>Sentiment Analyzer</span>
          </NavLink>

          <NavLink to="/dashboard" className={navLinkClass}>
            <BarChart2 size={17} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/contact" className={navLinkClass}>
            <Mail size={17} />
            <span>Contact Us</span>
          </NavLink>

          {/* Auth State Links */}
          {!user ? (
            <div className="auth-nav-group">
              <NavLink to="/login" className={navLinkClass}>
                <LogIn size={17} />
                <span>Login</span>
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Register</span>
              </NavLink>
            </div>
          ) : (
            <div className="auth-nav-group">
              <NavLink to="/profile" className={navLinkClass}>
                <UserIcon size={17} />
                <span>{user.name.split(' ')[0]}</span>
                <span className="user-role-badge">{user.role}</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm logout-btn"
                title="Log Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown">
          <NavLink
            to="/"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Home size={18} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/about"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Info size={18} />
            <span>About Us</span>
          </NavLink>

          <NavLink
            to="/analyzer"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Cpu size={18} />
            <span>Sentiment Analyzer</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BarChart2 size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/contact"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Mail size={18} />
            <span>Contact Us</span>
          </NavLink>

          <div className="mobile-auth-divider"></div>

          {!user ? (
            <div className="mobile-auth-buttons">
              <Link
                to="/login"
                className="btn btn-secondary btn-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus size={18} />
                <span>Register</span>
              </Link>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link
                to="/profile"
                className="btn btn-secondary btn-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon size={18} />
                <span>Profile ({user.name})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-block logout-btn"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
