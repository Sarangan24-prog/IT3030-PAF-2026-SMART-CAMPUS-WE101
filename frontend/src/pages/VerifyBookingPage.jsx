import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './VerifyBookingPage.css';

const VerifyBookingPage = () => {
  const { referenceId } = useParams();
  const [booking, setBooking]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get (`http://localhost:8080/api/bookings/verify/${referenceId}`)
      .then(res => setBooking(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [referenceId]);

  if (loading) return (
    <div className="verify-page">
      <div className="verify-card">
        <p>Verifying booking...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-icon invalid">❌</div>
        <h2>Invalid Booking</h2>
        <p>No booking found for <strong>{referenceId}</strong></p>
      </div>
    </div>
  );

  return (
    <div className="verify-page">
      <div className="verify-card">

        {/* Status Icon */}
        <div className={`verify-icon ${booking.status === 'APPROVED' ? 'valid' : 'invalid'}`}>
          {booking.status === 'APPROVED' ? '✅' : '❌'}
        </div>

        {/* Title */}
        <h2>{booking.status === 'APPROVED' ? 'Booking Verified!' : 'Booking Not Valid'}</h2>

        {/* Reference */}
        <div className="verify-ref">{booking.referenceId}</div>

        {/* Details */}
        <div className="verify-details">
          <div className="verify-row">
            <span>Name</span>
            <strong>{booking.userName}</strong>
          </div>
          <div className="verify-row">
            <span>Resource</span>
            <strong>{booking.resourceType}</strong>
          </div>
          <div className="verify-row">
            <span>Date</span>
            <strong>{booking.bookingDate}</strong>
          </div>
          <div className="verify-row">
            <span>Time</span>
            <strong>{booking.timeSlot}</strong>
          </div>
          <div className="verify-row">
            <span>Purpose</span>
            <strong>{booking.purpose}</strong>
          </div>
          <div className="verify-row">
            <span>Attendees</span>
            <strong>{booking.expectedAttendees}</strong>
          </div>
          <div className="verify-row">
            <span>Status</span>
            <strong className={booking.status === 'APPROVED' ? 'status-approved' : 'status-rejected'}>
              {booking.status}
            </strong>
          </div>
        </div>

        <p className="verify-footer">
          Smart Campus Operations Hub
        </p>
      </div>
    </div>
  );
};

export default VerifyBookingPage;