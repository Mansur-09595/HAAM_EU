import { createSlice } from '@reduxjs/toolkit'
import type { Ads } from '@/types/IAds'
import { fetchAdsByCategory } from './adsByCategoryAction'

interface AdsByCategoryState {
  items: Ads[]
  loading: boolean
  error: string | null
}

const initialState: AdsByCategoryState = {
  items: [],
  loading: false,
  error: null,
}

const adsByCategorySlice = createSlice({
  name: 'adsByCategory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdsByCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdsByCategory.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAdsByCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? 'Ошибка загрузки объявлений'
      })
  },
})

export default adsByCategorySlice.reducer
