import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyAttendance } from '../store/slices/attendanceSlice'
import { BarChart3, Clock, CheckCircle, AlertCircle, Timer, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import styles from './DashboardPage.module.css'

function StatCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <div className={`card ${styles.statCard}`} style={{ '--accent': color }}>
      <div className={styles.statIcon} style={{ background: `${color}20`, color }}>
        <Icon size={22} />
      </div>
      <div className={styles.statInfo}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
        {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { records, loading } = useSelector((s) => s.attendance)

  useEffect(() => {
    dispatch(fetchMyAttendance())
  }, [dispatch])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayRecord = records.find((r) => r.date === today)

  const present = records.filter((r) => r.status === 'present').length
  const incomplete = records.filter((r) => r.status === 'incomplete').length
  const totalHours = records.reduce((acc, r) => acc + (r.total_hours || 0), 0)
  const avgHours = records.length ? (totalHours / records.length).toFixed(1) : '0'

  // Chart data - last 7 records
  const chartData = [...records].slice(0, 7).reverse().map((r) => ({
    date: r.date?.slice(5),
    hours: r.total_hours || 0,
    status: r.status,
  }))

  const getStatusColor = (status) => {
    if (status === 'present') return 'var(--color-success)'
    if (status === 'incomplete') return 'var(--color-warning)'
    return 'var(--color-danger)'
  }

  return (
    <div className="animate-fadeInUp">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
            <span className="gradient-text">{user?.full_name?.split(' ')[0]} 👋</span>
          </h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className={styles.quickActions}>
          <Link to="/attendance" className="btn btn-primary">
            <Clock size={16} /> Mark Attendance
          </Link>
          <Link to="/ai-assistant" className="btn btn-secondary">
            <Bot size={16} /> Ask AI
          </Link>
        </div>
      </div>

      {/* Today's status */}
      {todayRecord && (
        <div className={`card ${styles.todayCard}`}>
          <div className={styles.todayHeader}>
            <Clock size={18} />
            <span>Today's Attendance</span>
            <span className={`badge badge-${todayRecord.status}`}>{todayRecord.status}</span>
          </div>
          <div className={styles.todayGrid}>
            <div className={styles.todayItem}>
              <span className={styles.todayLabel}>Punch In</span>
              <span className={styles.todayValue}>
                {todayRecord.punch_in
                  ? format(new Date(todayRecord.punch_in), 'hh:mm a')
                  : '—'}
              </span>
            </div>
            <div className={styles.todayItem}>
              <span className={styles.todayLabel}>Punch Out</span>
              <span className={styles.todayValue}>
                {todayRecord.punch_out
                  ? format(new Date(todayRecord.punch_out), 'hh:mm a')
                  : '—'}
              </span>
            </div>
            <div className={styles.todayItem}>
              <span className={styles.todayLabel}>Hours</span>
              <span className={styles.todayValue}>{todayRecord.total_hours?.toFixed(1) || '—'}h</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-lg)' }}>
        <StatCard icon={CheckCircle} label="Present Days" value={present} color="var(--color-success)" />
        <StatCard icon={AlertCircle} label="Incomplete Days" value={incomplete} color="var(--color-warning)" />
        <StatCard icon={Clock} label="Avg Hours/Day" value={`${avgHours}h`} color="var(--color-primary-light)" />
        <StatCard icon={BarChart3} label="Total Records" value={records.length} color="var(--color-secondary)" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Hours (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={24}>
              <XAxis dataKey="date" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text-primary)',
                }}
                formatter={(v) => [`${v}h`, 'Hours']}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={getStatusColor(entry.status)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className={styles.chartLegend}>
            <span><span className={styles.dot} style={{ background: 'var(--color-success)' }} /> Present (≥8h)</span>
            <span><span className={styles.dot} style={{ background: 'var(--color-warning)' }} /> Incomplete (&lt;8h)</span>
          </div>
        </div>
      )}
    </div>
  )
}
