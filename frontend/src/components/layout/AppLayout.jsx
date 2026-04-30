import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../../store/slices/uiSlice'
import Sidebar from './Sidebar'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen)
  const dispatch = useDispatch()

  return (
    <div className={`${styles.layout} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
