import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotificationPanel from './pages/NotificationPanel';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import TicketPage from './pages/TicketPage';
import TicketManagementPage from './pages/TicketManagementPage';
import ResourcePage from './pages/ResourcePage';
import OAuth2Redirect from './pages/OAuth2Redirect';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PublicHeader from './components/PublicHeader';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading"><span>Loading...</span></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" />;

  return (
    <div className="app-shell dashboard-shell">
      <Navbar />
      <div className="main-container">
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

const PublicShell = ({ children }) => {
  return (
    <div className="app-shell public-shell">
      <PublicHeader />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading"><span>Loading...</span></div>;

  const homeRoute = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicShell>
            <HomePage />
          </PublicShell>
        }
      />
      <Route
        path="/about"
        element={
          <PublicShell>
            <AboutPage />
          </PublicShell>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicShell>
            <ContactPage />
          </PublicShell>
        }
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={homeRoute} />
          ) : (
            <div className="app-shell login-shell">
              <LoginPage />
              <Footer />
            </div>
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={homeRoute} />
          ) : (
            <div className="app-shell login-shell">
              <RegisterPage />
              <Footer />
            </div>
          )
        }
      />
      <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />

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
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourcePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-tickets"
        element={
          <ProtectedRoute>
            <TicketManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? homeRoute : '/'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
