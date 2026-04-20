import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getAllResources,
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  InboxIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
  MessageCircleIcon,
  MailIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  TagIcon,
  ChevronRightIcon,
  PinIcon,
  SearchIcon,
  UserIcon,
} from '../components/Icons';
import CalendarWidget from '../components/CalendarWidget';
import ThemeToggle from '../components/ThemeToggle';
import StatCard from '../components/dashboard/StatCard';
import ProgressSection from '../components/dashboard/ProgressSection';
import FacilityCard from '../components/dashboard/FacilityCard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [notifRes, bookingRes, resourceRes] = await Promise.all([
        getNotifications(),
        user?.role === 'ADMIN' ? { data: [] } : import('../services/api').then(api => api.getMyBookings()),
        getAllResources()
      ]);
      setNotifications(notifRes.data);
      if (bookingRes?.data) setBookings(bookingRes.data);
      if (resourceRes?.data) setResources(resourceRes.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="dashboard-page modern-theme">
      
      {/* Top Header Row */}
      <header className="dashboard-header">
        <div className="header-search">
          <div className="search-box">
             <SearchIcon size={18} color="var(--text-muted)" />
             <input type="text" placeholder="Search facilities, events..." />
          </div>
        </div>
        <div className="header-actions">
           <ThemeToggle />
           <div className="header-notif">
              <BellIcon size={22} color="var(--text-muted)" />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
           </div>
           <div className="header-profile">
              <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=77A365&color=fff`} alt="avatar" />
              <div className="profile-info">
                 <span className="profile-name">{user?.name}</span>
                 <span className="profile-role">{user?.role}</span>
              </div>
           </div>
        </div>
      </header>

      <div className="dashboard-content-grid">
        
        {/* Left/Main Column */}
        <div className="dashboard-main">
          
          <div className="greeting-row">
             <h2>Welcome back, {user?.name?.split(' ')[0]}!</h2>
             <p>You have {unreadCount} new notifications and 2 upcoming bookings today.</p>
          </div>

          {/* Stat Row */}
          <div className="stat-grid">
            <StatCard icon={CheckCircleIcon} label="Total Bookings" value={bookings.length} color="#3b82f6" />
            <StatCard icon={TagIcon} label="Active Tickets" value={Math.floor(Math.random() * 5)} color="#f97316" />
            <StatCard icon={BellIcon} label="Unread Notifs" value={unreadCount} color="#77A365" />
          </div>

          {/* Middle Row */}
          <div className="middle-grid">
            <div className="progress-container">
               <ProgressSection 
                 userProgress={73} 
                 teamProgress={[
                   { name: 'Library Usage', percentage: 85, color: '#3b82f6' },
                   { name: 'Lab Bookings', percentage: 62, color: '#f97316' },
                   { name: 'Sports Hub', percentage: 45, color: '#77A365' }
                 ]} 
               />
            </div>
            
            <div className="promo-banner">
               <div className="promo-content">
                  <span className="deadline-tag">4 Days 9 Hours</span>
                  <p>to your facility booking deadline</p>
               </div>
               <div className="promo-image">
                  {/* Decorative elements */}
                  <ShieldIcon size={100} color="rgba(255,255,255,0.1)" />
               </div>
            </div>
          </div>

          {/* Bottom Section - Facilities Spotlight */}
          <div className="spotlight-section">
             <div className="section-title-row">
                <h3>Facilities Spotlight</h3>
                <button className="view-all-btn" onClick={() => navigate('/resources')}>View All</button>
             </div>
             <div className="facility-grid">
                {resources.map(res => (
                  <FacilityCard key={res.id} facility={res} />
                ))}
                {resources.length === 0 && <p className="empty-text">No resources found.</p>}
             </div>
          </div>
        </div>

        {/* Right Column */}
        <aside className="dashboard-aside">
           <div className="aside-card calendar-aside">
              <div className="card-top">
                 <h4>Schedule</h4>
                 <ThemeToggle />
              </div>
              <CalendarWidget 
                highlights={bookings.reduce((acc, b) => {
                  if (b.startTime) {
                    const dateStr = b.startTime.split('T')[0];
                    acc[dateStr] = b.status === 'APPROVED' ? 'green' : 'orange';
                  }
                  return acc;
                }, {})}
              />
           </div>

           <div className="aside-card activity-card">
              <div className="card-top">
                 <h4>Recent Activity</h4>
              </div>
              <div className="activity-list">
                 {notifications.slice(0, 5).map(n => (
                   <div key={n.id} className="activity-item">
                      <div className="activity-dot"></div>
                      <div className="activity-text">
                         <span className="activity-msg">{n.message}</span>
                         <span className="activity-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                 ))}
                 {notifications.length === 0 && <p className="empty-text">No recent activity.</p>}
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
};

export default DashboardPage;
