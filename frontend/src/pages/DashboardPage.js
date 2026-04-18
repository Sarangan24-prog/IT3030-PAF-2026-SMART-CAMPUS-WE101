import React from 'react';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <div className="welcome-card">
        <h3>Welcome, {user?.name || 'User'}! 👋</h3>
        <p>You are logged in as <strong>{user?.role}</strong></p>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role</span>
            <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Member Since</span>
            <span className="info-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
