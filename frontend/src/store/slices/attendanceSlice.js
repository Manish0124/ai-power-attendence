import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchMyAttendance = createAsyncThunk('attendance/fetchMy', async (params = {}) => {
  const { data } = await api.get('/attendance/me', { params })
  return data
})

export const fetchAllAttendance = createAsyncThunk('attendance/fetchAll', async (params = {}) => {
  const { data } = await api.get('/attendance/', { params })
  return data
})

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: { records: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAttendance.pending, (s) => { s.loading = true })
      .addCase(fetchMyAttendance.fulfilled, (s, { payload }) => { s.loading = false; s.records = payload })
      .addCase(fetchMyAttendance.rejected, (s, { error }) => { s.loading = false; s.error = error.message })
      .addCase(fetchAllAttendance.pending, (s) => { s.loading = true })
      .addCase(fetchAllAttendance.fulfilled, (s, { payload }) => { s.loading = false; s.records = payload })
      .addCase(fetchAllAttendance.rejected, (s, { error }) => { s.loading = false; s.error = error.message })
  },
})

export default attendanceSlice.reducer
