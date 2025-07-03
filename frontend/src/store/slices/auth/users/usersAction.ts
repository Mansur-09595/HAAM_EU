// src/store/slices/auth/users/usersAction.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Users } from '@/types/IUsers'
import { TokenManager } from '@/utils/tokenUtils'
import { AuthErrorHandler } from '@/utils/authErrorHandler'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://haam-db.onrender.com/api'

// // Ваш «первичный» токен из бэка
// const DEMO_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwNzI0MTE4LCJpYXQiOjE3NTA3MjM4MTgsImp0aSI6IjJhMDMzNTI1NjU5ZTRmMGRiMTE3M2I5YTNhMTgwODMwIiwidXNlcl9pZCI6M30.mDLtM8b2KWCaHREHlcbEcvCpPVCn4vKikrG92d2_H4U"


// // Хелпер для заголовка авторизации: сначала из localStorage, иначе DEMO_ACCESS_TOKEN
// const getAuthHeader = () => {
//   const token = TokenManager.getAccessToken() || DEMO_ACCESS_TOKEN
//   return { Authorization: `Bearer ${token}` }
// }

// GET /api/users/
export const fetchUsers = createAsyncThunk<Users[], void, { rejectValue: string }>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/users/`, {
        headers: {
          'Content-Type': 'application/json',
          // ...getAuthHeader(),
        },
      })
      const data = (await res.json()) as { results: Users[]; detail?: string }
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return data.results
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// GET /api/users/:id/
export const fetchUserById = createAsyncThunk<Users, number, { rejectValue: string }>(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/users/${id}/`, {
        headers: {
          'Content-Type': 'application/json',
          // ...getAuthHeader(),
        },
      })
      const data = (await res.json()) as Users & { detail?: string }
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return data
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// PUT /api/users/:id/
export const updateUser = createAsyncThunk<
  Users,
  Partial<Users> & { id: number },
  { rejectValue: string }
>(
  'users/update',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/users/${payload.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as Users & { detail?: string }
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return data
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)
// DELETE /api/users/:id/
export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/users/${id}/`, {
        method: 'DELETE',
        // headers: getAuthHeader(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { detail?: string }
        const msg = data.detail || (await AuthErrorHandler.handle(res))
        return rejectWithValue(msg)
      }
      return id
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)


// POST /api/users/
export const createUser = createAsyncThunk<
  Users,
  FormData,
  { rejectValue: string }
>(
  'users/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/users/`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        console.log('CreateUser errors:', data)
        const message = typeof data === 'object'
          ? Object.values(data).flat().join('; ')
          : data.detail || (await AuthErrorHandler.handle(res))
        return rejectWithValue(message)
      }
      return data as Users
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

export const confirmEmail = createAsyncThunk<
  void,
  { token: string },
  { rejectValue: string }
>(
  'auth/confirmEmail',
  async ({ token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/users/confirm-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      // если всё ок — просто возвращаем void
      return
    } catch {
      return rejectWithValue('Ошибка сети при подтверждении почты')
    }
  }
)