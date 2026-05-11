# QR-Based Attendance System

Full MERN stack attendance system built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, JWT, `qrcode.react`, and `html5-qrcode`.

## Folder Structure

- `src/` - React frontend
- `backend/` - Express API, MongoDB models, routes, controllers, middleware
- `backend/.env.example` - environment variable template

## Run The Project

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGO_URI` and `JWT_SECRET`.
3. Start MongoDB locally or use MongoDB Atlas. For local development, the backend also falls back to an in-memory MongoDB server if `mongodb://127.0.0.1:27017/qrattendance` is not available.
4. Run the backend:

```bash
npm run dev:backend
```

5. Run the frontend in another terminal:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5000/api`

On Windows PowerShell, use `npm.cmd run dev` if script execution policy blocks `npm`.

## Complete Project Flow

Teacher registers with name, email, password, and Teacher ID. Student registers with name, email, password, Student ID, and class. Passwords are hashed with bcrypt before saving in MongoDB. Login returns a JWT, and the React context stores the logged-in user and token in `localStorage`.

Teacher users can create classes, delete classes, open a class dashboard, add or remove students, generate a one-minute QR session, and view attendance records.

Student users can view enrolled classes, scan the teacher QR code with the camera, mark attendance, and view attendance history.

## Authentication Flow

1. Frontend sends register or login data to `/api/auth`.
2. Backend validates fields and saves/fetches the user.
3. Password comparison uses bcrypt.
4. Backend signs a JWT with the user id and role.
5. Frontend sends `Authorization: Bearer <token>` on protected API calls.
6. Backend `protect` middleware verifies the token.
7. `authorize("teacher")` and `authorize("student")` enforce role-based access.

## QR Attendance Flow

1. Teacher opens a class and clicks Generate QR.
2. Backend creates a `QrSession` with a unique token and 60-second expiry.
3. Frontend renders the QR using `qrcode.react`.
4. Student scans the QR using `html5-qrcode`.
5. Frontend parses the QR JSON and calls `/api/attendance/mark`.
6. Backend verifies session id, token, class enrollment, expiry, and duplicate attendance.
7. Attendance is saved as present for that student and session.

QR payload:

```json
{
  "classId": "MongoDB class id",
  "teacherId": "MongoDB teacher id",
  "sessionId": "MongoDB QR session id",
  "createdAt": "ISO date",
  "expiresAt": "ISO date",
  "token": "unique session token"
}
```

## MongoDB Relationships

- `User`
  - Teachers have `teacherId`.
  - Students have `studentId` and `studentClass`.
- `Class`
  - Belongs to one teacher.
  - Contains many student user references.
- `QrSession`
  - Belongs to one class and one teacher.
  - Stores session token and expiry.
- `Attendance`
  - References student, class, and QR session.
  - Unique index prevents duplicate attendance for the same session.

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/classes/teacher`
- `GET /api/classes/student`
- `POST /api/classes`
- `DELETE /api/classes/:classId`
- `POST /api/classes/:classId/students`
- `DELETE /api/classes/:classId/students/:studentId`
- `POST /api/sessions/:classId`
- `GET /api/attendance`
- `POST /api/attendance/mark`

## Notes For Demo

When a teacher adds a student ID that does not exist yet, the backend creates a simple student account with that Student ID as the temporary password and a generated local email. In a real school deployment, you would usually disable that shortcut and require student self-registration or admin-created accounts.
