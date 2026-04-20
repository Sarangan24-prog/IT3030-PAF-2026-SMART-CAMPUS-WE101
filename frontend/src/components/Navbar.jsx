import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import {
  GraduationCapIcon,
  GridIcon,
  SettingsIcon,
  BellIcon,
  LogOutIcon,
  CalendarIcon,
  TagIcon,
  PinIcon,
  UserIcon,
  MenuIcon,
  CloseIcon
} from './Icons';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setIsMobileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', isMobileOpen);

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Toggle for mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'visible' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <CloseIcon size={24} color="#ffffff" /> : <MenuIcon size={24} color="#ffffff" />}
      </button>

      <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <GraduationCapIcon size={32} color="#0f172a" />
          </div>
          <span className="logo-text">CAMPUS.FLOW</span>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {isAdmin ? (
              <>
                 <li className={isActive('/admin') ? 'active orange' : ''}>
                  <Link to="/admin">
                    <span className="icon-box"><SettingsIcon size={20} /></span>
                    <span className="link-text">Admin Panel</span>
                  </Link>
                </li>
                <li className={isActive('/dashboard') ? 'active blue' : ''}>
                  <Link to="/dashboard">
                    <span className="icon-box"><GridIcon size={20} /></span>
                    <span className="link-text">Dashboard</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className={isActive('/dashboard') ? 'active orange' : ''}>
                  <Link to="/dashboard">
                    <span className="icon-box"><GridIcon size={20} /></span>
                    <span className="link-text">Overview</span>
                  </Link>
                </li>
                <li className={isActive('/bookings') ? 'active purple' : ''}>
                  <Link to="/bookings">
                    <span className="icon-box"><CalendarIcon size={20} /></span>
                    <span className="link-text">Bookings</span>
                  </Link>
                </li>
                <li className={isActive('/resources') ? 'active green' : ''}>
                  <Link to="/resources">
                    <span className="icon-box"><PinIcon size={20} /></span>
                    <span className="link-text">Facilities</span>
                  </Link>
                </li>
                <li className={isActive('/tickets') ? 'active blue' : ''}>
                  <Link to="/tickets">
                    <span className="icon-box"><TagIcon size={20} /></span>
                    <span className="link-text">Support</span>
                  </Link>
                </li>
              </>
            )}
            
            <li className={isActive('/notifications') ? 'active red' : ''}>
              <Link to="/notifications" id="nav-notifications">
                <span className="icon-box">
                  <BellIcon size={20} />
                  {unreadCount > 0 && <span className="notification-dot"></span>}
                </span>
                <span className="link-text">Inbox</span>
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
               <UserIcon size={24} color="#475569" />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Member'}</span>
            </div>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon-box"><LogOutIcon size={18} /></span>
            <span className="link-text">LOGOUT</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
