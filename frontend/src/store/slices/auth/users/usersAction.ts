// src/store/slices/auth/users/usersAction.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Users } from '@/types/IUsers'
import { TokenManager } from '@/utils/tokenUtils'
import { AuthErrorHandler } from '@/utils/authErrorHandler'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api'

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