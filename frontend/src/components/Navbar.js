import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchCount = () => {
        getUnreadCount()
          .then((res) => setUnreadCount(res.data.count))
          .catch(() => {});
      };
      fetchCount();
      const interval = setInterval(fetchCount, 15000); // poll every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          🏫 Smart Campus
        </Link>

        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>

          <Link
            to="/notifications"
            className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}
            id="nav-notifications"
          >
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="badge" id="unread-badge">{unreadCount}</span>
            )}
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/users"
              className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
            >
              Users
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
