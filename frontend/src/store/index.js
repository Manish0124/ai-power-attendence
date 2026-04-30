import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import attendanceReducer from './slices/attendanceSlice'
import overtimeReducer from './slices/overtimeSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    overtime: overtimeReducer,
    ui: uiReducer,
  },
})
