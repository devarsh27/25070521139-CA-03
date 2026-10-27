import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import SentimentAnalyzer from './pages/SentimentAnalyzer';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* 1. Home */}
              <Route path="/" element={<Home />} />

              {/* 2. About Us */}
              <Route path="/about" element={<About />} />

              {/* 3. Sentiment Analyzer */}
              <Route path="/analyzer" element={<SentimentAnalyzer />} />

              {/* 4. Dashboard */}
              <Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={['admin', 'faculty']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>

              {/* 5. Contact Us */}
              <Route path="/contact" element={<Contact />} />

              {/* 6. Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 7. Profile & Logout (Protected) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
