import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchAds, addAd, fetchAdBySlug } from './adsAction' // Импортируем функции для работы с API
import { Ads } from '@/types/IAds' // Импортируем тип объявления

// Состояние для объявлений
interface AdsState {
  items: Ads[]
  selectedAd: Ads | null  // Хранит единичное объявление при детальном просмотре
  loading: boolean
  error: string | null
  searchTerm: string
  minPrice: number
  maxPrice: number
  category: number
}

const initialState: AdsState = {
  items: [],
  selectedAd: null,
  loading: false,
  error: null,
  searchTerm: '',
  minPrice: 0,
  maxPrice: 1000000,
  category: 0,
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
      // Загрузка всех объявлений
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

      // Добавление нового объявления
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

      // Загрузка одного объявления по слагу
      .addCase(fetchAdBySlug.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdBySlug.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload === null) {
          state.error = "Объявление не найдено"
        } else {
          state.selectedAd = action.payload
        }
      })
      .addCase(fetchAdBySlug.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Ошибка загрузки объявления'
      })
  },
})

export const { setSearchTerm, setMinPrice, setMaxPrice } = adsSlice.actions
export default adsSlice.reducer
