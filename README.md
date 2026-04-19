# 🏫 Smart Campus Operations Hub

A full-stack web application for smart campus operations management built with **Spring Boot**, **MongoDB**, and **React**.

## Team Members & Modules

| Member | Module | Features |
|--------|--------|----------|
| **Member 4** | Notifications & User Management | Notification system, Role management, Google OAuth2 integration |

---

## Tech Stack

- **Backend**: Spring Boot 3.4, Spring Security, Spring Data MongoDB
- **Frontend**: React 19, React Router, Axios
- **Database**: MongoDB
- **Auth**: Google OAuth2 + JWT
- **CI/CD**: GitHub Actions

---

## Setup Instructions

### Prerequisites
- Java 21+
- Node.js 18+
- MongoDB (running on localhost:27017)

### Backend Setup

```bash
cd backend

# Configure application.properties (see below for Google OAuth)
# Then run:
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080**

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend starts on **http://localhost:3000**

---

## Google OAuth2 Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Create an **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
6. Copy the Client ID and Client Secret
7. Update `backend/src/main/resources/application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

> **Note:** A demo login endpoint (`POST /api/auth/demo-login`) is available for testing without Google OAuth.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/me` | Get current user info | JWT |
| POST | `/api/auth/demo-login` | Demo login (dev only) | Public |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get all notifications for logged-in user | JWT |
| GET | `/api/notifications/unread-count` | Get unread notification count | JWT |
| PUT | `/api/notifications/{id}/read` | Mark one notification as read | JWT |
| PUT | `/api/notifications/read-all` | Mark all notifications as read | JWT |
| DELETE | `/api/notifications/{id}` | Delete a notification | JWT |

### Users (Admin Only)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | ADMIN |
| PUT | `/api/users/{id}/role` | Update user role | ADMIN |

---

## Member 4 — Implemented Features

### 1. Notification Module
- Real-time notification list with unread indicators
- Mark individual or all notifications as read
- Delete notifications
- Notification types: `BOOKING_APPROVED`, `BOOKING_REJECTED`, `TICKET_STATUS_CHANGED`, `NEW_COMMENT`
- `NotificationService.createNotification()` — callable by other modules (booking, tickets)

### 2. Role-Based User Management
- Three roles: `USER`, `ADMIN`, `TECHNICIAN`
- Admin panel to view all users and change roles
- Role-based route protection (frontend and backend)

### 3. Google OAuth2 Integration
- Spring Security with Google OAuth2
- JWT token generation after successful OAuth login
- Stateless authentication with JWT filter
- CORS configuration for frontend communication

### 4. REST API
- 7+ endpoints using `GET`, `POST`, `PUT`, `DELETE` methods
- Role-based access control via Spring Security
- Proper error handling and response structure

---

## Project Structure

```
├── backend/
│   └── src/main/java/com/smartcampus/backend/
│       ├── model/          # User, Notification, Role, NotificationType
│       ├── repository/     # MongoDB repositories
│       ├── service/        # Business logic
│       ├── controller/     # REST endpoints
│       └── security/       # JWT, OAuth2, SecurityConfig
├── frontend/
│   └── src/
│       ├── components/     # Navbar
│       ├── context/        # AuthContext
│       ├── pages/          # Login, Dashboard, Notifications, Admin
│       └── services/       # API service (Axios)
└── .github/workflows/     # CI pipeline
```