import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchUsers, fetchUserById, createUser, updateUser, deleteUser, confirmEmail } from './usersAction'
import { Users } from '@/types/IUsers' // Импортируем типы пользователей
// import { RootState } from '@/store/store' // Импортируем тип корневого состояния

interface UsersState {
    list: Users[]
    selected: Users | null
    confirmLoading: boolean
    confirmError: string | null
    confirmSuccess: boolean

    loading: boolean
    error: string | null
  }
  
  const initialState: UsersState = {
    list: [],
    selected: null,
    confirmLoading: false,
    confirmError: null,
    confirmSuccess: false,

    loading: false,
    error: null,
  }

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
      resetConfirmState(state) {
        state.confirmLoading = false
        state.confirmError = null
        state.confirmSuccess = false
      },
    },
    extraReducers: builder => {
      builder
        // fetchUsers
        .addCase(fetchUsers.pending, state => {
          state.loading = true
          state.error = null
        })
        .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<Users[]>) => {
          state.loading = false
          state.list = action.payload
        })
        .addCase(fetchUsers.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload ?? action.error.message ?? null
        })
        // fetchUserById
        .addCase(fetchUserById.pending, state => {
          state.loading = true
          state.error = null
        })
        .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<Users>) => {
          state.loading = false
          state.selected = action.payload
        })
        .addCase(fetchUserById.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload ?? action.error.message ?? null
        })
        // createUser
        .addCase(createUser.pending, state => {
          state.loading = true
          state.error = null
        })
        .addCase(createUser.fulfilled, (state, action: PayloadAction<Users>) => {
          state.loading = false
          state.list.push(action.payload)
        })
        .addCase(createUser.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload ?? action.error.message ?? null
        })
        // updateUser
        .addCase(updateUser.pending, state => {
          state.loading = true
          state.error = null
        })
        .addCase(updateUser.fulfilled, (state, action: PayloadAction<Users>) => {
          state.loading = false
          state.list = state.list.map(u => u.id === action.payload.id ? action.payload : u)
        })
        .addCase(updateUser.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload ?? action.error.message ?? null
        })
        // deleteUser
        .addCase(deleteUser.pending, state => {
          state.loading = true
          state.error = null
        })
        .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
          state.loading = false
          state.list = state.list.filter(u => u.id !== action.payload)
        })
        .addCase(deleteUser.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload ?? action.error.message ?? null
        })
        // confirmEmail
        .addCase(confirmEmail.pending, state => {
          state.confirmLoading = true
          state.confirmError = null
          state.confirmSuccess = false
        })
        .addCase(confirmEmail.fulfilled, state => {
          state.confirmLoading = false
          state.confirmSuccess = true
        })
        .addCase(confirmEmail.rejected, (state, action) => {
          state.confirmLoading = false
          state.confirmError = action.payload ?? action.error.message ?? 'Ошибка подтверждения'
        })
    }
  })
  
// export const selectUsers = (state: RootState) => state.users.list
export const { resetConfirmState } = usersSlice.actions
export default usersSlice.reducer