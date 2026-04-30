import { useEffect, useRef, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyAttendance } from '../store/slices/attendanceSlice'
import Webcam from 'react-webcam'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Camera, LogIn, LogOut, MapPin, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import styles from './AttendancePage.module.css'

export default function AttendancePage() {
  const dispatch = useDispatch()
  const { records } = useSelector((s) => s.attendance)
  const webcamRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locError, setLocError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayRecord = records.find((r) => r.date === today)

  useEffect(() => {
    dispatch(fetchMyAttendance())
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => setLocError('Could not get location. Please enable GPS.'),
    )
  }, [dispatch])

  const capture = useCallback(async (type) => {
    if (!location) { toast.error('Location not available'); return }
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) { toast.error('Camera not ready'); return }

    // Convert base64 to blob
    const res = await fetch(imageSrc)
    const blob = await res.blob()
    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })

    const formData = new FormData()
    formData.append('latitude', location.lat)
    formData.append('longitude', location.lng)
    formData.append('selfie', file)

    setLoading(true)
    try {
      const endpoint = type === 'in' ? '/attendance/punch-in' : '/attendance/punch-out'
      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(data.message)
      dispatch(fetchMyAttendance())
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to punch ' + type)
    } finally {
      setLoading(false)
    }
  }, [location, dispatch])

  const hasPunchedIn = Boolean(todayRecord?.punch_in)
  const hasPunchedOut = Boolean(todayRecord?.punch_out)

  return (
    <div className="animate-fadeInUp">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Mark your daily attendance using face recognition</p>
      </div>

      <div className={styles.grid}>
        {/* Camera panel */}
        <div className="card">
          <div className={styles.cameraHeader}>
            <Camera size={18} />
            <span>Face Recognition Camera</span>
            {locError && <span className={styles.locError}><MapPin size={14} /> {locError}</span>}
            {location && (
              <span className={styles.locOk}>
                <MapPin size={14} /> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            )}
          </div>

          <div className={styles.webcamWrap}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height="auto"
              onUserMedia={() => setCameraReady(true)}
              className={styles.webcam}
              mirrored
            />
            {!cameraReady && (
              <div className={styles.camPlaceholder}>
                <Camera size={48} />
                <p>Initializing camera…</p>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className="btn btn-success btn-lg"
              onClick={() => capture('in')}
              disabled={loading || hasPunchedIn || !location || !cameraReady}
            >
              {loading ? <span className="spinner" /> : <LogIn size={18} />}
              Punch In
            </button>
            <button
              className="btn btn-danger btn-lg"
              onClick={() => capture('out')}
              disabled={loading || !hasPunchedIn || hasPunchedOut || !location || !cameraReady}
            >
              {loading ? <span className="spinner" /> : <LogOut size={18} />}
              Punch Out
            </button>
          </div>
        </div>

        {/* Records panel */}
        <div>
          {/* Today summary */}
          <div className={`card ${styles.todaySummary}`}>
            <h3>Today — {format(new Date(), 'MMM d, yyyy')}</h3>
            {todayRecord ? (
              <div className={styles.todayStats}>
                <div className={styles.statRow}>
                  <Clock size={14} />
                  <span>In: {todayRecord.punch_in ? format(new Date(todayRecord.punch_in), 'hh:mm a') : '—'}</span>
                </div>
                <div className={styles.statRow}>
                  <Clock size={14} />
                  <span>Out: {todayRecord.punch_out ? format(new Date(todayRecord.punch_out), 'hh:mm a') : '—'}</span>
                </div>
                <div className={styles.statRow}>
                  <CheckCircle size={14} />
                  <span>Hours: {todayRecord.total_hours?.toFixed(1) || '—'}h</span>
                </div>
                <span className={`badge badge-${todayRecord.status}`}>{todayRecord.status}</span>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>No record yet</p>
            )}
          </div>

          {/* Recent records */}
          <div className="card" style={{ marginTop: 'var(--space-md)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Recent Records</h3>
            <div className={styles.recordsList}>
              {records.slice(0, 10).map((r, i) => (
                <div key={i} className={styles.recordRow}>
                  <div>
                    <div className={styles.recordDate}>{r.date}</div>
                    <div className={styles.recordTime}>
                      {r.punch_in ? format(new Date(r.punch_in), 'hh:mm a') : '—'} →{' '}
                      {r.punch_out ? format(new Date(r.punch_out), 'hh:mm a') : '—'}
                    </div>
                  </div>
                  <div className={styles.recordRight}>
                    <span className={styles.hours}>{r.total_hours?.toFixed(1) || '—'}h</span>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                </div>
              ))}
              {records.length === 0 && <p className="empty-state">No attendance records yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
