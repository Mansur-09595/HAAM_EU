import {  createSlice } from '@reduxjs/toolkit'
import { loginUser, checkAuth, refreshToken } from './authAction' // Импортируем функции для работы с API  
import {  Users } from '@/types/IUsers' // Импортируем тип пользователя

interface AuthState {
  user: Users | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  },
  extraReducers: builder => {
    // loginUser
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.access
      state.refreshToken = action.payload.refresh
      state.error = null
      state.loading = false
    })
    .addCase(loginUser.pending, state => { state.loading = true; state.error = null })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? action.error.message ?? null ?? null
    })

    // checkAuth
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.user = action.payload
      state.loading = false
    })
    .addCase(checkAuth.pending, state => { state.loading = true; state.error = null })
    .addCase(checkAuth.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? action.error.message ?? null ?? null
    })

    // refreshToken
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.access
      state.error = null
    })
    .addCase(refreshToken.rejected, (state, action) => {
      state.error = action.payload ?? action.error.message ?? null ?? null
    })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer