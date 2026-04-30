import axios from 'axios'
import { store } from '../store'
import { logout } from '../store/slices/authSlice'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const { token } = store.getState().auth
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout())
    }
    return Promise.reject(err)
  },
)

export default api
