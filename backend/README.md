# QR Attendance System - Backend

This is the complete, production-ready backend for the QR Attendance System, built with the MERN stack (Node.js, Express, MongoDB).

## Features

- **MVC Architecture**: Code is organized into Models, Views (Frontend), and Controllers.
- **RESTful API**: Clear and structured API endpoints.
- **Role-based Access Control (RBAC)**: Secure access for Admin, Teacher, and Student roles.
- **JWT Authentication**: Secure login and token-based protected routes.
- **Dynamic QR Code Generation**: Teachers can generate expiring QR codes for a class session.
- **Secure Attendance Tracking**: Prevents duplicate entries and ensures the QR code is active and valid.
- **Comprehensive Analytics**: Dashboard stats for admins and teachers.

## Tech Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB & Mongoose**: NoSQL database and Object Data Modeling (ODM) library.
- **JWT (jsonwebtoken)**: For secure authentication.
- **bcryptjs**: For password hashing.
- **qrcode**: For generating QR code data URLs.
- **uuid**: For generating unique session tokens.
- **cors**, **helmet**, **dotenv**: For security, cross-origin resource sharing, and environment variables management.

## Backend Setup Guide

1. **Install Dependencies**
   Navigate to the backend directory and install the required npm packages:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `backend/` directory and configure the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5173
   ```

3. **Start the Server**
   To start the development server with nodemon:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`.

## MongoDB Schema Explanations

1. **User Model**: Stores user details (`name`, `email`, `password`, `role`). Includes fields like `teacherId` or `studentId` depending on the role. Uses `bcryptjs` to hash passwords before saving.
2. **Class Model**: Represents a class. Contains a reference to the `teacher` (User) and an array of enrolled `students` (Users).
3. **QrSession Model**: Represents an active attendance session. Generates a unique `token` and sets an `expiresAt` time.
4. **Attendance Model**: Records when a student successfully scans the QR code. Includes a compound unique index on `student` and `qrSession` to prevent duplicate attendance marking.

## API Documentation & Postman Testing

### Authentication

**Register User**
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "student@example.com",
    "password": "password123",
    "role": "student",
    "studentId": "STU12345"
  }
  ```

**Login User**
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "password123"
  }
  ```

### Classes (Teacher / Admin)
*Requires Bearer Token*

**Create Class**
- **Endpoint**: `POST /api/classes`
- **Body**:
  ```json
  {
    "name": "Computer Science 101",
    "subject": "CS"
  }
  ```

**Add Student to Class**
- **Endpoint**: `POST /api/classes/:classId/students`
- **Body**:
  ```json
  {
    "studentId": "STU12345"
  }
  ```

### QR & Attendance

**Generate QR Session (Teacher)**
- **Endpoint**: `POST /api/qr/generate/:classId`
- **Response**: Returns a uniquely generated QR code data URL and session payload.

**Scan QR Code (Student)**
- **Endpoint**: `POST /api/qr/scan`
- **Body**: (These values are parsed from the QR code)
  ```json
  {
    "classId": "mongodb_class_id",
    "sessionId": "mongodb_session_id",
    "token": "uuid_token"
  }
  ```

### Admin Operations
*Requires Admin Bearer Token*

**View Dashboard Stats**
- **Endpoint**: `GET /api/admin/dashboard`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalUsers": 150,
        "totalClasses": 12,
        "totalAttendance": 450
      }
    }
  }
  ```

## Package.json Scripts

The `package.json` file includes the following scripts for ease of use:
- `npm start`: Starts the application using Node.js directly.
- `npm run dev`: Starts the application using `nodemon` for hot-reloading during development.

## Postman Setup Instructions

1. Open Postman and create a new Collection named `QR Attendance API`.
2. Set a Collection Variable named `BASE_URL` to `http://localhost:5000/api`.
3. Create a request for Login: `POST {{BASE_URL}}/auth/login`.
4. After logging in, copy the `token` from the response.
5. In Postman, go to the **Authorization** tab of the requests that need authentication, select **Bearer Token**, and paste your token.
