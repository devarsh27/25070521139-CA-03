import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="text-muted mt-2">Checking authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Access Restricted</h2>
          <p className="text-slate-300">
            Your current role (<code>{user.role}</code>) does not have access to this resource.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
