import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { GraduationCapIcon, UserIcon, SettingsIcon, AlertIcon, CheckCircleIcon } from '../components/Icons';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setGlobalError('');
    try {
      await register(formData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <GraduationCapIcon size={28} color="#ffffff" />
          </div>
          <h1>Create Account</h1>
          <p>Smart Campus — Join the platform</p>
        </div>

        {success && (
          <div className="register-success-msg">
            <CheckCircleIcon size={15} color="#4ade80" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {/* Full Name */}
          <div className="reg-field-wrap">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="reg-field-wrap">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="reg-field-wrap">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="reg-field-wrap">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Role Selector */}
          <div className="reg-field-wrap">
            <label>Account Type</label>
            <div className="reg-role-toggle">
              <button
                type="button"
                className={`reg-toggle-btn ${formData.role === 'USER' ? 'active-client' : ''}`}
                onClick={() => handleRoleSelect('USER')}
              >
                <UserIcon size={14} />
                Client
              </button>
              <button
                type="button"
                className={`reg-toggle-btn ${formData.role === 'ADMIN' ? 'active-admin' : ''}`}
                onClick={() => handleRoleSelect('ADMIN')}
              >
                <SettingsIcon size={14} />
                Admin
              </button>
            </div>
          </div>

          {/* Global Error */}
          {globalError && (
            <p className="reg-error-msg">
              <AlertIcon size={14} color="#dc2626" />
              {globalError}
            </p>
          )}

          <button
            type="submit"
            className="register-btn"
            disabled={loading || !!success}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
