# 📌 AI-Powered Attendance System

An AI-based Attendance Management System using Face Recognition, Geolocation, and an AI Assistant.

---

## 🚀 Overview

This system automates attendance tracking using facial recognition and provides intelligent insights through an AI assistant. It supports role-based access for Admin, Manager, and Employee.

---

## 🛠️ Tech Stack

### Backend
- FastAPI / Flask
- OpenCV + face-recognition
- MongoDB Atlas

### Frontend
- React.js (Vite)
- Redux Toolkit

### AI Integration
- Google Gemini API (Preferred)
- OpenRouter / Hugging Face

---

## ✨ Features

### 🔐 Authentication & Roles
- Secure login and signup
- Role-based access:
  - Admin
  - Manager
  - Employee

---

### 🤳 Smart Attendance (Face Recognition)
- Live selfie registration (camera only)
- Punch in/out using face recognition
- Stores:
  - Timestamp
  - Location (Latitude/Longitude)
  - Selfie

#### Attendance Logic
- ≥ 8 hours → Present
- < 8 hours → Incomplete
- Extra hours → Overtime request required

---

### ⏳ Overtime Workflow
- Employees can request overtime
- Manager/Admin can approve or reject
- Status updates available

---

### 🛠️ Admin Panel
- View all attendance records
- Filter by date or user
- Mark records as invalid/fake
- Enable or disable users

---

### 📊 Reports
- Employee → Own data
- Manager → Team data
- Admin → All data
- Export reports in PDF/Excel

---

### 🤖 AI Assistant
Supports queries like:
- Who came late today
- Employees with less than 8 hours
- Overtime requests
- Attendance summary

System converts query → fetches data → returns AI-generated response.

---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/ai-attendance-system.git
cd ai-attendance-system