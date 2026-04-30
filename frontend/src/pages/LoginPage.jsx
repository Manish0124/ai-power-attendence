import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { Clock, Mail, Lock, LogIn } from 'lucide-react'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(form))
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.full_name}! 👋`)
      navigate('/dashboard')
    } else {
      toast.error(result.payload || 'Login failed')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}><Clock size={28} /></div>
          <h1 className={`gradient-text ${styles.logoTitle}`}>AI Attendance</h1>
        </div>

        <div className={styles.header}>
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="email"
                name="email"
                type="email"
                className={`input ${styles.inputPadded}`}
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="password"
                name="password"
                type="password"
                className={`input ${styles.inputPadded}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <><span className="spinner" /> Signing in…</> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  )
}
