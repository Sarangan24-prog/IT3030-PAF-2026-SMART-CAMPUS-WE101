import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import {
  GraduationCapIcon,
  GridIcon,
  SettingsIcon,
  BellIcon,
  LogOutIcon,
  MenuIcon,
  CloseIcon,
} from './Icons';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user) {
      const fetchCount = () => {
        getUnreadCount()
          .then((res) => setUnreadCount(res.data.count))
          .catch(() => {});
      };
      fetchCount();
      const interval = setInterval(fetchCount, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <span className="brand-icon">
            <GraduationCapIcon size={20} color="#ffffff" />
          </span>
          <span className="brand-text">Smart Campus</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <SettingsIcon size={15} />
                <span>Admin Panel</span>
              </Link>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <GridIcon size={15} />
                <span>Dashboard</span>
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <GridIcon size={15} />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            to="/notifications"
            className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}
            id="nav-notifications"
          >
            <BellIcon size={15} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="badge" id="unread-badge">{unreadCount}</span>
            )}
          </Link>

          <div className="mobile-user-section">
            <span className="mobile-user-name">{user?.name}</span>
            {isAdmin && <span className="admin-tag">ADMIN</span>}
            <button className="logout-btn" onClick={handleLogout}>
              <LogOutIcon size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="navbar-user">
          {isAdmin && <span className="admin-tag">ADMIN</span>}
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={handleLogout} id="logout-btn">
            <LogOutIcon size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon size={22} color="#e2e8f0" /> : <MenuIcon size={22} color="#e2e8f0" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
