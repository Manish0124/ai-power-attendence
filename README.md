# 📌 AI-Powered Attendance System

An AI-based Attendance Management System using **Face Recognition**, **Geolocation**, and a **Gemini AI Assistant**.

---

## 🚀 Overview

This system automates attendance tracking using facial recognition and provides intelligent insights through an AI assistant. It supports role-based access for **Admin**, **Manager**, and **Employee**.

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — async REST API
- **OpenCV + face-recognition** — biometric face matching
- **MongoDB Atlas** (via Motor) — async database
- **JWT** — secure authentication

### Frontend
- **React.js + Vite** — blazing-fast SPA
- **Redux Toolkit** — global state management
- **React Webcam** — live camera for face capture
- **Recharts** — analytics charts

### AI Integration
- **Google Gemini API** — natural language attendance queries

---

## ✨ Features

### 🔐 Authentication & Roles
- Secure signup / login with JWT tokens
- Role-based access: **Admin**, **Manager**, **Employee**
- Account enable/disable by Admin

### 🤳 Smart Attendance (Face Recognition)
- Live selfie capture via webcam
- Punch In / Punch Out with face verification
- Stores: Timestamp, Location (Lat/Lng), Selfie image

#### Attendance Logic
| Hours Worked | Status |
|---|---|
| ≥ 8 hours | ✅ Present |
| < 8 hours | ⚠️ Incomplete |
| Extra hours | Overtime request required |

### ⏳ Overtime Workflow
- Employees submit overtime requests with reason
- Manager/Admin can **approve** or **reject**
- Status visible to employees

### 🛠️ Admin Panel
- View all attendance records
- Filter by date
- Mark records as invalid/fake
- Enable or disable user accounts

### 📊 Reports & Analytics
- Employee → Own data (pie chart + trend)
- Manager/Admin → Team data
- Summary stats (present, incomplete, avg hours)

### 🤖 AI Assistant
Natural language queries like:
- *"Who came late today?"*
- *"Employees with less than 8 hours"*
- *"How many overtime requests are pending?"*
- *"Give me an attendance summary"*

---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/ai-attendance-system.git
cd ai-attendance-system
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and Gemini API key

# Run the server
uvicorn main:app --reload
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```
Frontend runs at: http://localhost:5173

---

## 📁 Project Structure

```
ai-powered-attendance-system/
├── backend/
│   ├── main.py                     # FastAPI app entry
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── core/
│       │   ├── config.py           # Settings (pydantic-settings)
│       │   └── security.py         # JWT & password utils
│       ├── db/
│       │   └── mongodb.py          # Async MongoDB connection
│       ├── models/
│       │   ├── user.py             # User + Role models
│       │   ├── attendance.py       # Attendance record models
│       │   └── overtime.py         # Overtime request models
│       └── api/
│           ├── deps.py             # Auth dependencies
│           └── v1/
│               ├── router.py       # API v1 router
│               └── endpoints/
│                   ├── auth.py         # /auth/signup, /auth/login
│                   ├── users.py        # /users/me, /users/{id}
│                   ├── attendance.py   # /attendance/punch-in, punch-out
│                   ├── overtime.py     # /overtime/
│                   ├── reports.py      # /reports/summary, /reports/daily
│                   └── ai_assistant.py # /ai/query
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx                # React entry
        ├── App.jsx                 # Router + protected routes
        ├── index.css               # Global design system
        ├── store/
        │   ├── index.js            # Redux store
        │   └── slices/
        │       ├── authSlice.js
        │       ├── attendanceSlice.js
        │       ├── overtimeSlice.js
        │       └── uiSlice.js
        ├── services/
        │   └── api.js              # Axios + JWT interceptor
        ├── components/
        │   └── layout/
        │       ├── AppLayout.jsx
        │       └── Sidebar.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            ├── DashboardPage.jsx
            ├── AttendancePage.jsx
            ├── OvertimePage.jsx
            ├── ReportsPage.jsx
            ├── AIAssistantPage.jsx
            ├── AdminPage.jsx
            └── ProfilePage.jsx
```

---

## 🔑 Environment Variables

### Backend `.env`
```
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/attendance_db
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your-gemini-api-key
UPLOAD_DIR=uploads
```

---

## 📜 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register user |
| POST | `/api/v1/auth/login` | Login → JWT token |
| GET | `/api/v1/users/me` | My profile |
| POST | `/api/v1/users/me/register-face` | Register face |
| POST | `/api/v1/attendance/punch-in` | Punch in |
| POST | `/api/v1/attendance/punch-out` | Punch out |
| GET | `/api/v1/attendance/me` | My records |
| GET | `/api/v1/attendance/` | All records (Admin) |
| POST | `/api/v1/overtime/` | Submit overtime |
| PATCH | `/api/v1/overtime/{id}/review` | Approve/reject |
| GET | `/api/v1/reports/summary` | Attendance stats |
| POST | `/api/v1/ai/query` | AI assistant |