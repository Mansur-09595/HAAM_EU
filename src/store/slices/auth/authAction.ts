import { createAsyncThunk } from '@reduxjs/toolkit'


// ✅ Thunk: логин
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (
      credentials: { email: string; password: string },
      { rejectWithValue }
    ) => {
      try {
        const res = await fetch('http://localhost:8000/api/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })
  
        if (!res.ok) {
          const error = await res.json()
          return rejectWithValue(error.detail || 'Ошибка авторизации')
        }
  
        const data = await res.json()
  
        // Сохраняем токены
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
  
        return data // access, refresh, user
      } catch {
        return rejectWithValue('Ошибка подключения к серверу')
      }
    }
  )
  
  // ✅ Thunk: автоавторизация при наличии токена
  export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
      const token = localStorage.getItem('accessToken')
      if (!token) return rejectWithValue('Нет токена')
  
      try {
        const res = await fetch('http://localhost:8000/api/users/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (!res.ok) return rejectWithValue('Ошибка при авторизации')
  
        const user = await res.json()
        return user
      } catch {
        return rejectWithValue('Ошибка подключения')
      }
    }
  )
  