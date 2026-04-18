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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          🏫 Smart Campus
        </Link>

        <div className="navbar-links">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                ⚙️ Admin Panel
              </Link>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}

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
        </div>

        <div className="navbar-user">
          {isAdmin && <span className="admin-tag">ADMIN</span>}
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
