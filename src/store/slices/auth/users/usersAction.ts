// src/store/slices/auth/users/usersAction.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Users } from '@/types/IUsers'

const API_BASE = 'http://localhost:8000/api'

// Ваш «первичный» токен из бэка
const DEMO_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ2NjU1NTY4LCJpYXQiOjE3NDY2NTUyNjgsImp0aSI6IjU5Zjc0NDRkNWZiNDQ1MGY4MjZjYmFmOGRlMGM1MjlkIiwidXNlcl9pZCI6OX0.D-o9LDagn45jKUStYtEx_uSpgUBEsg8goJxOAEBIHp8'

// Хелпер для заголовка авторизации: сначала из localStorage, иначе DEMO_ACCESS_TOKEN
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || DEMO_ACCESS_TOKEN
  return { Authorization: `Bearer ${token}` }
}

// GET /api/users/
export const fetchUsers = createAsyncThunk<Users[], void, { rejectValue: string }>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await fetch(`${API_BASE}/users/`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    })
    const data = (await res.json()) as { results: Users[]; detail?: string }
    if (!res.ok) {
      return rejectWithValue(data.detail ?? 'Не удалось загрузить пользователей')
    }
    return data.results
  }
)

// GET /api/users/:id/
export const fetchUserById = createAsyncThunk<Users, number, { rejectValue: string }>(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    const res = await fetch(`${API_BASE}/users/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    })
    const data = (await res.json()) as Users & { detail?: string }
    if (!res.ok) {
      return rejectWithValue(data.detail ?? 'Не удалось загрузить пользователя')
    }
    return data
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
    const res = await fetch(`${API_BASE}/users/${payload.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    })
    const data = (await res.json()) as Users & { detail?: string }
    if (!res.ok) {
      return rejectWithValue(data.detail ?? 'Не удалось обновить пользователя')
    }
    return data
  }
)

// DELETE /api/users/:id/
export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'users/delete',
  async (id, { rejectWithValue }) => {
    const res = await fetch(`${API_BASE}/users/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    })
    if (!res.ok) {
      const data = (await res.json()) as { detail?: string }
      return rejectWithValue(data.detail ?? 'Не удалось удалить пользователя')
    }
    return id
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
    const res = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      // ↘ НЕ указываем Content-Type — fetch сам добавит multipart boundary
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) {
      console.log('CreateUser errors:', data)
      // собираем сообщения из объекта ошибок
      const message = typeof data === 'object'
        ? Object.values(data).flat().join('; ')
        : data.detail || 'Не удалось создать пользователя'
      return rejectWithValue(message)
    }
    return data as Users
  }
)