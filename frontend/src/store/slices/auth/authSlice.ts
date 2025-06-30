import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { loginUser, checkAuth, refreshToken } from './authAction'
import { Users } from '@/types/IUsers'
import { TokenManager } from '@/utils/tokenUtils'

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
      TokenManager.clearTokens()
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
      state.error = typeof action.payload === 'string'
      ? action.payload
      : action.error?.message ?? 'Неизвестная ошибка'
    })

    // checkAuth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<Users>) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? null
        state.user = null
      })

    // refreshToken
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.access
      state.error = null
    })
    .addCase(refreshToken.rejected, (state, action) => {
      state.error = action.payload ?? action.error.message ?? 'Ошибка обновления токена'

    })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer