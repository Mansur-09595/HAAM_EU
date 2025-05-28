import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchAds, addAd, fetchAdBySlug, toggleFeatured } from './adsAction' // Импортируем функции для работы с API
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
  count: number
  next: string | null
  previous: string | null
  page: number
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
  count: 0,
  next: null,
  previous: null,
  page: 1,
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
      .addCase(fetchAds.pending, (state, action) => {
        state.loading = true
        state.error = null
        // если первая страница и не append — очищаем
        const { page = 1, append } = action.meta.arg || {}
        if (page === 1 && !append) {
          state.items = []
        }
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false
        const { results, count, next, previous } = action.payload
        const { page = 1, append } = action.meta.arg || {}

        state.count = count
        state.next = next
        state.previous = previous
        state.page = page

        // если append=true и page>1 — дописываем, иначе заменяем
        if (append && page > 1) {
          state.items = [...state.items, ...results]
        } else {
          state.items = results
        }
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message!
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
        state.error = action.payload ?? action.error.message ?? 'Ошибка добавления'
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
      .addCase(toggleFeatured.fulfilled, (state, action: PayloadAction<Ads>) => {
        state.items = state.items.map(ad =>
          ad.id === action.payload.id ? action.payload : ad
        )
      })
  },
})

export const { setSearchTerm, setMinPrice, setMaxPrice } = adsSlice.actions
export default adsSlice.reducer
