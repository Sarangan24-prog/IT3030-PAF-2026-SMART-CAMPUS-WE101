import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoLogin } from '../services/api';
import { GraduationCapIcon, UserIcon, SettingsIcon, AlertIcon } from '../components/Icons';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('user');

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      setError('Please enter both name and email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await demoLogin({ email, name });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setLoginMode('admin');
    setName('Campus Admin');
    setEmail('admin@smartcampus.com');
  };

  const fillUserDemo = () => {
    setLoginMode('user');
    setName('');
    setEmail('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <GraduationCapIcon size={28} color="#ffffff" />
          </div>
          <h1>Smart Campus</h1>
          <p>Operations Hub — Sign in to continue</p>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} id="google-login-btn">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 15.6 18.8 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.7 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.6 13.4-4.3l-6.2-5.2C29.2 36 26.7 36.8 24 36.8c-5.3 0-9.8-3.5-11.3-8.3l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.5l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <span>or use demo credentials</span>
        </div>

        <div className="role-toggle">
          <button
            className={`toggle-btn ${loginMode === 'user' ? 'active-user' : ''}`}
            onClick={fillUserDemo}
            type="button"
          >
            <UserIcon size={14} />
            User Login
          </button>
          <button
            className={`toggle-btn ${loginMode === 'admin' ? 'active-admin' : ''}`}
            onClick={fillAdminDemo}
            type="button"
          >
            <SettingsIcon size={14} />
            Admin Login
          </button>
        </div>

        <form onSubmit={handleDemoLogin} className="demo-form">
          <div className="field-wrap">
            <label htmlFor="demo-name-input">Full Name</label>
            <input
              id="demo-name-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field-wrap">
            <label htmlFor="demo-email-input">Email Address</label>
            <input
              id="demo-email-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && (
            <p className="error-msg">
              <AlertIcon size={14} color="#dc2626" />
              {error}
            </p>
          )}
          <button type="submit" className="demo-btn" disabled={loading} id="demo-login-btn">
            {loading
              ? 'Signing in...'
              : loginMode === 'admin'
              ? 'Sign in as Admin'
              : 'Sign in as User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
