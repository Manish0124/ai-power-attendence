import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Clock, Timer, BarChart3, Bot,
  Settings, LogOut, ChevronLeft, ChevronRight, User, ShieldCheck
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import toast from 'react-hot-toast'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attendance',   icon: Clock,           label: 'Attendance' },
  { to: '/overtime',     icon: Timer,           label: 'Overtime' },
  { to: '/reports',      icon: BarChart3,       label: 'Reports' },
  { to: '/ai-assistant', icon: Bot,             label: 'AI Assistant' },
  { to: '/profile',      icon: User,            label: 'Profile' },
]

const adminItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Clock size={20} />
        </div>
        {sidebarOpen && (
          <div className={styles.logoText}>
            <span className="gradient-text">AI Attend</span>
          </div>
        )}
        <button
          className={styles.toggleBtn}
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* User info */}
      {sidebarOpen && (
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.full_name}</span>
            <span className={styles.userRole}>{user?.role}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            {sidebarOpen && <div className={styles.divider}><span>Admin</span></div>}
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${styles.navItem} ${styles.adminItem} ${isActive ? styles.active : ''}`
                }
              >
                <Icon size={20} />
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={20} />
        {sidebarOpen && <span>Logout</span>}
      </button>
    </aside>
  )
}
