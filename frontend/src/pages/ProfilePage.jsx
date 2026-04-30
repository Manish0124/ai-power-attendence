import { useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import Webcam from 'react-webcam'
import api from '../services/api'
import toast from 'react-hot-toast'
import { User, Camera, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const webcamRef = useRef(null)
  const [showCam, setShowCam] = useState(false)
  const [registering, setRegistering] = useState(false)

  const handleRegisterFace = async () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) { toast.error('Camera not ready'); return }

    const res = await fetch(imageSrc)
    const blob = await res.blob()
    const file = new File([blob], 'face.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)

    setRegistering(true)
    try {
      const { data } = await api.post('/users/me/register-face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(data.message)
      setShowCam(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Face registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="animate-fadeInUp">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account and face registration</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Info card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: '#fff'
            }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>{user?.full_name}</h2>
              <p style={{ color: 'var(--color-primary-light)', textTransform: 'capitalize', fontSize: '0.85rem' }}>{user?.role}</p>
            </div>
          </div>

          {[
            ['Email', user?.email],
            ['Department', user?.department || '—'],
            ['Face Registered', user?.face_registered ? '✅ Yes' : '❌ No'],
            ['Account Status', user?.is_active ? 'Active' : 'Disabled'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{label}</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value}</span>
            </div>
          ))}

          <button className="btn btn-danger" style={{ marginTop: 24, width: '100%' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Face registration */}
        <div className="card">
          <h3 style={{ marginBottom: 8 }}>Face Registration</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: 20, color: 'var(--color-text-secondary)' }}>
            Register your face to enable biometric punch in/out. Make sure your face is clearly visible.
          </p>

          {showCam ? (
            <>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 16 }}>
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width="100%" mirrored />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={handleRegisterFace} disabled={registering} style={{ flex: 1 }}>
                  {registering ? <span className="spinner" /> : <Camera size={16} />}
                  Capture & Register
                </button>
                <button className="btn btn-secondary" onClick={() => setShowCam(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setShowCam(true)}>
              <Camera size={18} />
              {user?.face_registered ? 'Re-register Face' : 'Register Face'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
