import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Users } from '@/types/IUsers'
import { TokenManager } from '@/utils/tokenUtils'
import { AuthErrorHandler } from '@/utils/authErrorHandler'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://haam-db.onrender.com/api'

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
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      const data = await res.json()
      // сохраняем оба токена
      TokenManager.setTokens({ access: data.access, refresh: data.refresh })
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
    try {
      const access = await TokenManager.refreshAccessToken()
      return { access }
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// Thunk: проверка авторизации (получение профиля)
export const checkAuth = createAsyncThunk<Users, void, { rejectValue: string }>(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/users/me/`)
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      const user = await res.json()
      return user as Users
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// Thunk: подтверждение почты
export const confirmEmail = createAsyncThunk<void, {token:string}, {rejectValue:string}>(
  'auth/confirmEmail',
  async ({ token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/users/confirm-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res);
        return rejectWithValue(msg);
      }
      return;
    } catch {
      return rejectWithValue('Ошибка сети при подтверждении почты');
    }
  }
);