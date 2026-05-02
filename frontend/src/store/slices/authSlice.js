import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const stored = localStorage.getItem('auth')
const initialState = stored
  ? JSON.parse(stored)
  : { user: null, token: null, loading: false, error: null }

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Login failed')
  }
})

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/signup', userData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Signup failed')
  }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/me')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('auth')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false
        state.token = payload.access_token
        state.user = payload.user
        localStorage.setItem('auth', JSON.stringify({ token: payload.access_token, user: payload.user }))
      })
      .addCase(login.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(signup.pending, (state) => { state.loading = true; state.error = null })
      .addCase(signup.fulfilled, (state) => { state.loading = false })
      .addCase(signup.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload
        const auth = JSON.parse(localStorage.getItem('auth') || '{}')
        localStorage.setItem('auth', JSON.stringify({ ...auth, user: payload }))
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
