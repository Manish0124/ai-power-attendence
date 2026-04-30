import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ShieldCheck, Filter, XCircle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminPage() {
  const { user } = useSelector((s) => s.auth)
  const [records, setRecords] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [tab, setTab] = useState('attendance') // 'attendance' | 'users'

  const fetchAttendance = async () => {
    const params = filterDate ? { start_date: filterDate, end_date: filterDate } : {}
    const { data } = await api.get('/attendance/', { params })
    setRecords(data)
  }

  const fetchUsers = async () => {
    const { data } = await api.get('/users/')
    setUsers(data)
  }

  useEffect(() => {
    Promise.all([fetchAttendance(), fetchUsers()]).finally(() => setLoading(false))
  }, [])

  const invalidateRecord = async (id) => {
    try {
      await api.patch(`/attendance/${id}/invalidate`)
      toast.success('Record marked as invalid')
      fetchAttendance()
    } catch { toast.error('Failed to invalidate') }
  }

  const toggleUserActive = async (userId, isActive) => {
    try {
      await api.put(`/users/${userId}`, { is_active: !isActive })
      toast.success(isActive ? 'User disabled' : 'User enabled')
      fetchUsers()
    } catch { toast.error('Failed to update user') }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>
  }

  return (
    <div className="animate-fadeInUp">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,107,157,0.15)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Manage attendance records and users</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-lg)' }}>
        {['attendance', 'users'].map((t) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'attendance' && (
        <div className="card">
          {/* Filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-md)', alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input type="date" className="input" style={{ maxWidth: 200 }}
              value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            <button className="btn btn-secondary btn-sm" onClick={fetchAttendance}>Apply</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Date</th><th>Punch In</th><th>Punch Out</th>
                  <th>Hours</th><th>Status</th><th>Valid</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{r.user_id?.slice(-8)}</td>
                    <td>{r.date}</td>
                    <td>{r.punch_in ? format(new Date(r.punch_in), 'HH:mm') : '—'}</td>
                    <td>{r.punch_out ? format(new Date(r.punch_out), 'HH:mm') : '—'}</td>
                    <td>{r.total_hours?.toFixed(1) || '—'}h</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>
                      {r.is_valid
                        ? <span style={{ color: 'var(--color-success)' }}><CheckCircle size={16} /></span>
                        : <span style={{ color: 'var(--color-danger)' }}><XCircle size={16} /></span>}
                    </td>
                    <td>
                      {r.is_valid && (
                        <button className="btn btn-danger btn-sm" onClick={() => invalidateRecord(r.id)}>
                          Invalidate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={8} className="empty-state">No records found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                    <td><span className="badge badge-pending" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td>{u.department || '—'}</td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      {u.id !== user?.id && (
                        <button
                          className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleUserActive(u.id, u.is_active)}
                        >
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="empty-state">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
