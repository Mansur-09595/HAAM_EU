import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Users } from '@/types/IUsers'

const API_BASE = 'http://localhost:8000/api'

// Thunk: логин (получаем access+refresh+user)
export const loginUser = createAsyncThunk<
  { access: string; refresh: string; user: Users },
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data.detail ?? 'Ошибка авторизации')
      // Сохраняем оба токена
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      return data
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// Thunk: авто-рефреш доступа
export const refreshToken = createAsyncThunk<
  { access: string },
  void,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    const refresh = localStorage.getItem('refreshToken')
    if (!refresh) return rejectWithValue('No refresh token')
    try {
      const res = await fetch(`${API_BASE}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data.detail ?? 'Не удалось обновить токен')
      // Обновляем access
      localStorage.setItem('accessToken', data.access)
      return { access: data.access }
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// Thunk: проверка авторизации
export const checkAuth = createAsyncThunk<Users, void, { rejectValue: string }>(
  'auth/check',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return rejectWithValue('No token')
    try {
      const res = await fetch(`${API_BASE}/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const user = await res.json()
      if (!res.ok) return rejectWithValue('Не авторизован')
      return user as Users
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)