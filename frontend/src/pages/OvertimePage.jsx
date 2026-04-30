import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyAttendance } from '../store/slices/attendanceSlice'
import { fetchMyOvertime, fetchAllOvertime } from '../store/slices/overtimeSlice'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Timer, Plus, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function OvertimePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { records } = useSelector((s) => s.attendance)
  const { requests, loading } = useSelector((s) => s.overtime)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ attendance_id: '', date: '', extra_hours: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = ['admin', 'manager'].includes(user?.role)

  useEffect(() => {
    if (isAdmin) dispatch(fetchAllOvertime())
    else dispatch(fetchMyOvertime())
    dispatch(fetchMyAttendance())
  }, [dispatch, isAdmin])

  const eligibleRecords = records.filter((r) => r.status === 'incomplete' || r.total_hours > 8)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/overtime/', { ...form, extra_hours: parseFloat(form.extra_hours) })
      toast.success('Overtime request submitted!')
      setShowForm(false)
      dispatch(fetchMyOvertime())
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/overtime/${id}/review`, { status })
      toast.success(`Request ${status}`)
      dispatch(fetchAllOvertime())
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Overtime</h1>
          <p className="page-subtitle">Request and manage overtime approvals</p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Request Overtime
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)', animation: 'fadeInUp 0.3s ease' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>New Overtime Request</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Attendance Record</label>
              <select className="input" value={form.attendance_id}
                onChange={(e) => {
                  const rec = eligibleRecords.find((r) => r.id === e.target.value)
                  setForm({ ...form, attendance_id: e.target.value, date: rec?.date || '' })
                }} required>
                <option value="">Select a record…</option>
                {eligibleRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.date} — {r.total_hours?.toFixed(1) || '?'}h ({r.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Extra Hours</label>
              <input className="input" type="number" step="0.5" min="0.5" max="8"
                value={form.extra_hours} onChange={(e) => setForm({ ...form, extra_hours: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Reason</label>
              <textarea className="input" rows={3} placeholder="Explain why overtime was needed…"
                value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required
                style={{ resize: 'vertical', minHeight: 80 }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Submit Request'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-md)' }}>
          {isAdmin ? 'All Overtime Requests' : 'My Overtime Requests'}
        </h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                {isAdmin && <th>Employee</th>}
                <th>Extra Hours</th>
                <th>Reason</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  {isAdmin && <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{r.user_id}</td>}
                  <td>{r.extra_hours}h</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  {isAdmin && (
                    <td>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleReview(r.id, 'approved')}>
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReview(r.id, 'rejected')}>
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} className="empty-state">
                    <Timer size={32} /><br />No overtime requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
