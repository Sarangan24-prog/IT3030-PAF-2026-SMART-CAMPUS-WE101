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
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const demoLogin = (data) => API.post('/auth/demo-login', data);
export const getMe = () => API.get('/auth/me');

// Notifications (user)
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// Users (admin)
export const getAllUsers = () => API.get('/users');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminNotifications = () => API.get('/admin/notifications');
export const sendNotification = (data) => API.post('/admin/notifications', data);
export const broadcastNotification = (data) => API.post('/admin/notifications/broadcast', data);

// Bookings (user)
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings');
export const cancelBooking = (id) => API.delete(`/bookings/${id}`);

// Bookings (admin)
export const getAllBookings = () => API.get('/bookings/all');
export const updateBookingStatus = (id, status, reason = '') => API.put(`/bookings/${id}/status`, { status, reason });
// Tickets (user)
export const createTicket = (data) => API.post('/tickets', data);
export const getMyTickets = () => API.get('/tickets');

// Tickets (admin)
export const getAllTickets = () => API.get('/tickets/all');
export const updateTicketStatus = (id, status) => API.put(`/tickets/${id}/status`, { status });
export const addTicketComment = (id, text) => API.post(`/tickets/${id}/comments`, { text });
export const submitTicketFeedback = (id, rating, feedback = '') =>
  API.put(`/tickets/${id}/feedback`, { rating: String(rating), feedback });

// Resources
export const getAllResources = () => API.get('/resources');
export const getResourceById = (id) => API.get(`/resources/${id}`);
export const createResource = (data) => API.post('/resources', data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const deleteResource = (id) => API.delete(`/resources/${id}`);
export const searchResources = (queryData) => API.post('/resources/search', queryData);

export default API;
