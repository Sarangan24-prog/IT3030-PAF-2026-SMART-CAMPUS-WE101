import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotificationPanel from './pages/NotificationPanel';
import AdminDashboard from './pages/AdminDashboard';
import OAuth2Redirect from './pages/OAuth2Redirect';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" />;

  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  // Determine where to redirect after login based on role
  const homeRoute = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={homeRoute} /> : <LoginPage />}
      />
      <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />

      {/* User pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationPanel />
          </ProtectedRoute>
        }
      />

      {/* Admin pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={homeRoute} />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
