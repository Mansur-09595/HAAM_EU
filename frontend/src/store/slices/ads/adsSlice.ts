import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchAds, addAd, fetchAdBySlug, toggleFeatured } from './adsAction' // Импортируем функции для работы с API
import { Ads } from '@/types/IAds' // Импортируем тип объявления

// Состояние для объявлений
interface AdsState {
  items: Ads[]           // публичные объявления (т. е. для страницы «Все объявления»)
  selectedAd: Ads | null // для детального просмотра
  count: number
  next: string | null
  previous: string | null
  page: number
  loading: boolean
  error: string | null

  // фильтры
  category: string
  city: string
  searchTerm: string
  minPrice: number
  maxPrice: number
}

const initialState: AdsState = {
  items: [],
  selectedAd: null,
  count: 0,
  next: null,
  previous: null,
  page: 1,
  loading: false,
  error: null,

  category: '',
  city: '',
  searchTerm: '',
  minPrice: 0,
  maxPrice: 1000000,
}

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) =>{
      state.category = action.payload; state.page = 1;
    },
    setCity: (state, action: PayloadAction<string>) =>{
      state.city = action.payload; state.page = 1;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload; state.page = 1;
    },
    setMinPrice: (state, action: PayloadAction<number>) => {
      state.minPrice = action.payload; state.page = 1;
    },
    setMaxPrice: (state, action: PayloadAction<number>) => {
      state.maxPrice = action.payload; state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },

    clearFilters(state) {
      state.category = ''
      state.searchTerm = ''
      state.minPrice = 0
      state.maxPrice = 1_000_000
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

       // 1) Отфильтруем из пришедших results все объявления, где status === 'archived'
        const incomingNotArchived = results.filter(ad => ad.status !== 'archived');

        if (append && page > 1) {
          // 2) Если мы “дописываем” (append === true и page>1), то добавляем к уже имеющимся в state.items
          //    только непроархивированные объявления из следующей страницы
          state.items = [...state.items, ...incomingNotArchived];
        } else {
          // 3) Иначе (первый запрос или без append) — полностью заменяем state.items на непроархивированные:
          state.items = incomingNotArchived;
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

export const { setCategory, setCity, setSearchTerm, setMinPrice, setMaxPrice, setPage, clearFilters } = adsSlice.actions
export default adsSlice.reducer
