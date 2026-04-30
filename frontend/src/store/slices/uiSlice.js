import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: true, theme: 'dark' },
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    setSidebar(state, { payload }) { state.sidebarOpen = payload },
  },
})

export const { toggleSidebar, setSidebar } = uiSlice.actions
export default uiSlice.reducer
