import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { INotification, INotificationsState } from '@/types/notificationTypes'
import { fetchNotifications, markAllRead } from './notificationsAction'

const initialState: INotificationsState = {
  items: [],
  loading: false,
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<INotification>) {
    state.items.unshift(action.payload)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<INotification[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? null
      })
      .addCase(markAllRead.fulfilled, state => {
        state.items = state.items.map(notification => ({ ...notification, is_read: true }))
      })
  }
})

export default notificationsSlice.reducer