import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'

const COLORS = {
  present: 'var(--color-success)',
  incomplete: 'var(--color-warning)',
  absent: 'var(--color-danger)',
}

export default function ReportsPage() {
  const { user } = useSelector((s) => s.auth)
  const [summary, setSummary] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, recRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/attendance/me'),
        ])
        setSummary(sumRes.data)
        setRecords(recRes.data.slice(0, 30).reverse())
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const pieData = summary
    ? [
        { name: 'Present', value: summary.present },
        { name: 'Incomplete', value: summary.incomplete },
        { name: 'Absent', value: summary.absent },
      ].filter((d) => d.value > 0)
    : []

  const areaData = records.map((r) => ({
    date: r.date?.slice(5),
    hours: r.total_hours || 0,
  }))

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    )
  }

  return (
    <div className="animate-fadeInUp">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Your attendance analytics and insights</p>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: 'var(--space-lg)' }}>
          {[
            { icon: CheckCircle, label: 'Present', value: summary.present, color: 'var(--color-success)' },
            { icon: AlertCircle, label: 'Incomplete', value: summary.incomplete, color: 'var(--color-warning)' },
            { icon: Clock, label: 'Avg Hours', value: `${summary.average_hours}h`, color: 'var(--color-primary-light)' },
            { icon: TrendingUp, label: 'Total Hours', value: `${summary.total_hours}h`, color: 'var(--color-secondary)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${color}20`, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid-2">
        {/* Pie chart */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Attendance Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase()]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="empty-state">No data available</p>}
        </div>

        {/* Area chart */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Hours Trend (30 Days)</h3>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} domain={[0, 12]} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' }}
                  formatter={(v) => [`${v}h`, 'Hours']}
                />
                <Area type="monotone" dataKey="hours" stroke="var(--color-primary)" fill="url(#hoursGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="empty-state">No data available</p>}
        </div>
      </div>
    </div>
  )
}
