import {  createSlice } from '@reduxjs/toolkit'
import { loginUser, checkAuth } from './authAction' // Импортируем функции для работы с API  
import {  Users } from '@/types/IUsers' // Импортируем тип пользователя

type AuthState = {
  user: Users | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
}


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.access
        state.user = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, state => {
        state.user = null
        state.token = null
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
