import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const demoLogin = (data) => API.post('/auth/demo-login', data);
export const getMe = () => API.get('/auth/me');

// Notifications (user)
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// Bookings (user)
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings');

// Tickets (user)
export const createTicket = (data) => API.post('/tickets', data);
export const getMyTickets = () => API.get('/tickets');

// Users (admin)
export const getAllUsers = () => API.get('/users');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminNotifications = () => API.get('/admin/notifications');
export const sendNotification = (data) => API.post('/admin/notifications', data);
export const broadcastNotification = (data) => API.post('/admin/notifications/broadcast', data);

// Admin — Bookings
export const getAllBookings = () => API.get('/bookings/all');
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);

// Admin — Tickets
export const getAllTickets = () => API.get('/tickets/all');
export const updateTicketStatus = (id, status) => API.put(`/tickets/${id}/status`, { status });
export const addTicketComment = (id, text) => API.post(`/tickets/${id}/comments`, { text });
export const deleteTicket = (id) => API.delete(`/tickets/${id}`);

export default API;
