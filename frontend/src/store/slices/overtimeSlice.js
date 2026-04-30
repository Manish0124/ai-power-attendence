import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchMyOvertime = createAsyncThunk('overtime/fetchMy', async () => {
  const { data } = await api.get('/overtime/me')
  return data
})

export const fetchAllOvertime = createAsyncThunk('overtime/fetchAll', async (params = {}) => {
  const { data } = await api.get('/overtime/', { params })
  return data
})

const overtimeSlice = createSlice({
  name: 'overtime',
  initialState: { requests: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOvertime.pending, (s) => { s.loading = true })
      .addCase(fetchMyOvertime.fulfilled, (s, { payload }) => { s.loading = false; s.requests = payload })
      .addCase(fetchAllOvertime.fulfilled, (s, { payload }) => { s.loading = false; s.requests = payload })
  },
})

export default overtimeSlice.reducer
