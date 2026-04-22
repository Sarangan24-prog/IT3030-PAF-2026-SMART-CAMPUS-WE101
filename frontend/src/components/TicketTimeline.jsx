import React from 'react';
import { UserIcon, CheckCircleIcon, RefreshIcon, XCircleIcon, TagIcon } from './Icons';
import './TicketTimeline.css';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'OPEN': return <TagIcon size={14} color="#1d4ed8" />;
    case 'IN_PROGRESS': return <RefreshIcon size={14} color="#d97706" />;
    case 'RESOLVED': return <CheckCircleIcon size={14} color="#16a34a" />;
    case 'CLOSED': return <XCircleIcon size={14} color="#64748b" />;
    case 'REJECTED': return <XCircleIcon size={14} color="#dc2626" />;
    default: return null;
  }
};

const TicketTimeline = ({ history = [], createdAt, resolvedAt }) => {
  const formatTime = (date) => new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const calculateDuration = (start, end) => {
    if (!start || !end) return null;
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const responseTime = history.length > 1 
    ? calculateDuration(createdAt, history[1].timestamp) 
    : 'Pending';
    
  const resolutionTime = resolvedAt 
    ? calculateDuration(createdAt, resolvedAt) 
    : 'Active';

  return (
    <div className="ticket-timeline-container">
      <div className="sla-metrics">
        <div className="sla-card">
          <span className="sla-label">Response Time</span>
          <span className="sla-value">{responseTime}</span>
        </div>
        <div className="sla-card">
          <span className="sla-label">Total Resolution</span>
          <span className="sla-value">{resolutionTime}</span>
        </div>
      </div>

      <div className="timeline-trail">
        {history.map((event, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-marker">
              <div className="timeline-icon">
                <StatusIcon status={event.toStatus} />
              </div>
              {idx < history.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-status">
                  {event.toStatus || 'TICKET CREATED'}
                </span>
                <span className="timeline-date">{formatTime(event.timestamp)}</span>
              </div>
              <div className="timeline-actor">
                <UserIcon size={12} color="#64748b" />
                <span>{event.changeByName}</span>
              </div>
              {event.notes && <p className="timeline-notes">{event.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTimeline;
