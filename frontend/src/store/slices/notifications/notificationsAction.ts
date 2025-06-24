import { createAsyncThunk } from '@reduxjs/toolkit'
import { TokenManager } from '@/utils/tokenUtils'
import { INotification } from '@/types/notificationTypes'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://haam-db.onrender.com/api'

export const fetchNotifications = createAsyncThunk<
  INotification[],
  void,
  { rejectValue: string }
>('notifications/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const res = await TokenManager.fetchWithAuth(`${API_BASE}/notifications/`)
    if (!res.ok) {
      return rejectWithValue('Ошибка загрузки уведомлений')
    }
    const data = await res.json()
    return Array.isArray(data) ? data : data.results
  } catch {
    return rejectWithValue('Ошибка подключения')
  }
})

export const markAllRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    const res = await TokenManager.fetchWithAuth(
      `${API_BASE}/notifications/mark_all_read/`,
      { method: 'POST' }
    )
    if (!res.ok) {
      return rejectWithValue('Не удалось отметить как прочитанные')
    }
    return
  } catch {
    return rejectWithValue('Ошибка подключения')
  }
})