import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {  fetchAds, addAd } from './adsAction' // Импортируем функции для работы с API
import { Ads } from '@/types/IAds' // Импортируем тип объявления

type AdsState = {
  items: Ads[]
  loading: boolean
  error: string | null
  searchTerm: string
  minPrice: number
  maxPrice: number
}

const initialState: AdsState = {
  items: [],
  loading: false,
  error: null,
  searchTerm: '',
  minPrice: 0,
  maxPrice: 1000000,
}

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setMinPrice: (state, action: PayloadAction<number>) => {
      state.minPrice = action.payload
    },
    setMaxPrice: (state, action: PayloadAction<number>) => {
      state.maxPrice = action.payload
    },
  },
  extraReducers: builder => {
    builder
      // 🔁 Загрузка
      .addCase(fetchAds.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Ошибка загрузки'
      })

      // ➕ Добавление
      .addCase(addAd.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addAd.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(addAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Ошибка добавления'
      })
  },
})

export const { setSearchTerm, setMinPrice, setMaxPrice } = adsSlice.actions
export default adsSlice.reducer
