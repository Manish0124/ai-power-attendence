import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import AttendancePage from './pages/AttendancePage'
import OvertimePage from './pages/OvertimePage'
import ReportsPage from './pages/ReportsPage'
import AIAssistantPage from './pages/AIAssistantPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import AppLayout from './components/layout/AppLayout'

function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((s) => s.auth)
  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13142d',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="overtime" element={<OvertimePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['admin', 'manager']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
