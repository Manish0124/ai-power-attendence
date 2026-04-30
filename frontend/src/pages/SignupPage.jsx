import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signup } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { Clock, Mail, Lock, User, Briefcase, UserPlus } from 'lucide-react'
import styles from './AuthPage.module.css'

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((s) => s.auth)
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', department: '', role: 'employee'
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(signup(form))
    if (signup.fulfilled.match(result)) {
      toast.success('Account created! Please log in.')
      navigate('/login')
    } else {
      toast.error(result.payload || 'Signup failed')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}><Clock size={28} /></div>
          <h1 className={`gradient-text ${styles.logoTitle}`}>AI Attendance</h1>
        </div>

        <div className={styles.header}>
          <h2>Create account</h2>
          <p>Join your team's attendance system</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-group">
            <label className="input-label" htmlFor="full_name">Full Name</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input id="full_name" name="full_name" type="text" className={`input ${styles.inputPadded}`}
                placeholder="John Doe" value={form.full_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-email">Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input id="signup-email" name="email" type="email" className={`input ${styles.inputPadded}`}
                placeholder="you@company.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-password">Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input id="signup-password" name="password" type="password" className={`input ${styles.inputPadded}`}
                placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="department">Department</label>
            <div className={styles.inputWrap}>
              <Briefcase size={16} className={styles.inputIcon} />
              <input id="department" name="department" type="text" className={`input ${styles.inputPadded}`}
                placeholder="Engineering" value={form.department} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="role">Role</label>
            <select id="role" name="role" className="input" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <><span className="spinner" /> Creating…</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
