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
  MenuIcon,
  CloseIcon,
  UsersIcon,
  SendIcon,
  BuildingIcon
} from './Icons';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [isTicketsExpanded, setIsTicketsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isAdmin = user?.role === 'ADMIN';
  const adminPanelTabs = [
    { key: 'overview', label: 'Overview', icon: GridIcon },
    { key: 'bookings', label: 'Bookings', icon: CalendarIcon },
    { key: 'resources', label: 'Facilities', icon: BuildingIcon },
    { key: 'users', label: 'Users', icon: UsersIcon },
    { key: 'notifications', label: 'Notifications', icon: null },
    { key: 'send', label: 'Send', icon: SendIcon },
  ];

  const ticketsPanelTabs = [
    { key: 'overview', label: 'Overview', icon: GridIcon, path: '/manage-tickets?view=overview' },
    { key: 'inbox', label: 'Inbox', icon: BellIcon, path: '/manage-tickets?view=inbox' },
  ];

  const currentAdminTab = new URLSearchParams(location.search).get('tab') || 'overview';
  const currentTicketTab = new URLSearchParams(location.search).get('view') || 'overview';

  // Navigation Items Mapping
  const navItems = isAdmin ? [
    { path: '/admin', label: 'Admin Panel', icon: SettingsIcon, color: 'orange' },
    { path: '/manage-tickets', label: 'Manage Tickets', icon: TagIcon, color: 'green' },
    { path: '/dashboard', label: 'Overview', icon: GridIcon, color: 'blue' },
    { path: '/notifications', label: 'Inbox', icon: BellIcon, color: 'red', isInbox: true },
  ] : [
    { path: '/dashboard', label: 'Overview', icon: GridIcon, color: 'orange' },
    { path: '/bookings', label: 'Bookings', icon: CalendarIcon, color: 'purple' },
    { path: '/resources', label: 'Facilities', icon: PinIcon, color: 'green' },
    { path: '/tickets', label: 'Support', icon: TagIcon, color: 'blue' },
    { path: '/notifications', label: 'Inbox', icon: BellIcon, color: 'red', isInbox: true },
  ];

  // Find active index for sliding indicator
  const activeIndex = navItems.findIndex(item => item.path === location.pathname);

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
    if (isAdmin && location.pathname.startsWith('/admin')) {
      setIsAdminExpanded(true);
    }
    if (isAdmin && location.pathname.startsWith('/manage-tickets')) {
      setIsTicketsExpanded(true);
    }
  }, [location.pathname, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle for mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button 
        className="mobile-toggle" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <CloseIcon size={24} color="#ffffff" /> : <MenuIcon size={24} color="#ffffff" />}
      </button>

      <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-box">
            <GraduationCapIcon size={28} color="#77A365" />
          </div>
          <div className="brand-info">
            <span className="brand-name">CAMPUS</span>
            <span className="brand-sub">{isAdmin ? 'ADMIN PANEL' : 'FLOW HUB'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">

            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;
              const isAdminPanelItem = isAdmin && item.path === '/admin';
              const showAdminSubnav = isAdminPanelItem && isAdminExpanded;
              const showTicketsSubnav = isAdmin && item.path === '/manage-tickets' && isTicketsExpanded;
              const hasSubnav = showAdminSubnav || showTicketsSubnav;

              return (
                <li 
                  key={item.path} 
                  className={`${isActive ? 'active' : ''} ${hasSubnav ? 'has-subnav' : ''} ${item.color}`}
                >
                  <Link 
                    to={item.path} 
                    onClick={(e) => {
                      if (isAdminPanelItem) {
                        e.preventDefault();
                        setIsAdminExpanded(!isAdminExpanded);
                        setIsTicketsExpanded(false);
                      }
                      if (item.path === '/manage-tickets') {
                        e.preventDefault();
                        setIsTicketsExpanded(!isTicketsExpanded);
                        setIsAdminExpanded(false);
                      }
                    }}
                  >
                    <div className="nav-icon-wrap">
                      <Icon size={20} />
                      {item.isInbox && unreadCount > 0 && <span className="notif-dot" />}
                    </div>
                    <span className="nav-label">{item.label}</span>
                    {item.isInbox && unreadCount > 0 && (
                      <span className="count-badge">{unreadCount}</span>
                    )}
                  </Link>

                  {showAdminSubnav && (
                    <ul className="sidebar-subnav">
                      {adminPanelTabs.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                          <li key={tab.key}>
                            <Link
                              to={`/admin?tab=${tab.key}`}
                              className={`subnav-link ${currentAdminTab === tab.key ? 'active' : ''}`}
                            >
                              {TabIcon && <TabIcon size={18} />}
                              <span>{tab.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {showTicketsSubnav && (
                    <ul className="sidebar-subnav">
                      {ticketsPanelTabs.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                          <li key={tab.key}>
                            <Link
                              to={tab.path}
                              className={`subnav-link ${currentTicketTab === tab.key ? 'active' : ''}`}
                            >
                              {TabIcon && <TabIcon size={18} />}
                              <span>{tab.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-avatar-mini">
               {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="user-text-mini">
              <span className="mini-name">{user?.name}</span>
              <span className="mini-role">{user?.role}</span>
            </div>
          </div>
          
          <button className="logout-action" onClick={handleLogout}>
            <div className="logout-icon-box">
              <LogOutIcon size={18} />
            </div>
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
