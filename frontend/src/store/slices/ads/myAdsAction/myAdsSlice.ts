import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchMyAds, deleteMyAd, toggleMyAdStatus, promoteMyAdToVip, editAd } from './myAdsAction' // Импортируем функции для работы с API
import { Ads } from '@/types/IAds' // Импортируем тип объявления

// Состояние для объявлений
interface myAdsState {
  items: Ads[]           // публичные объявления (т. е. для страницы «Все объявления»)
  myItems: Ads[]         // «мои объявления»
  selectedAd: Ads | null // для детального просмотра
  loading: boolean
  error: string | null

}

const initialState: myAdsState = {
  items: [],
  myItems: [],
  selectedAd: null,
  loading: false,
  error: null,
}

const myAdsSlice = createSlice({
  name: 'myads',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
       // ─── fetchMyAds: «Мои объявления» (возвращаем уже отфильтрованный массив) ───
      .addCase(fetchMyAds.pending, (state) => {
        state.loading = true
        state.error = null
        state.myItems = []
      })
      .addCase(fetchMyAds.fulfilled, (state, action) => {
        state.loading = false
        state.myItems = action.payload
      })
      .addCase(fetchMyAds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? null
      })

      // ─── deleteMyAd ───
      .addCase(deleteMyAd.pending, (state) => {
        state.error = null
      })
      .addCase(deleteMyAd.fulfilled, (state, action) => {
        state.myItems = state.myItems.filter((ad) => ad.slug !== action.payload)
      })
      .addCase(deleteMyAd.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? null
      })

      // ─── toggleMyAdStatus ───
      .addCase(toggleMyAdStatus.pending, (state) => {
        state.error = null
      })
      .addCase(toggleMyAdStatus.fulfilled, (state, action) => {
        state.myItems = state.myItems.map((ad) =>
          ad.slug === action.payload.slug ? action.payload : ad
        )
      })
      .addCase(toggleMyAdStatus.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? null
      })

    // ─── promoteMyAdToVip ───
      .addCase(promoteMyAdToVip.pending, (state) => {
        state.error = null
      })
      .addCase(promoteMyAdToVip.fulfilled, (state, action) => {
        state.myItems = state.myItems.map((ad) =>
          ad.slug === action.payload.slug ? action.payload : ad
        )
      })
      .addCase(promoteMyAdToVip.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? null
      })
      // ───►►► Новый Thunk: Редактирование объявления editAd ──────────────────
      .addCase(editAd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(editAd.fulfilled, (state, action: PayloadAction<Ads>) => {
        state.loading = false

        // 1) Обновляем элемент в списке всех объявлений (items), если он там есть
        state.items = state.items.map(ad =>
          ad.slug === action.payload.slug ? action.payload : ad
        )

        // 2) Обновляем элемент в списке «мои объявления» (myItems), если он там есть
        state.myItems = state.myItems.map(ad =>
          ad.slug === action.payload.slug ? action.payload : ad
        )

        // 3) Если у нас открыт детальный просмотр (selectedAd), и это то же объявление → обновляем его
        if (state.selectedAd && state.selectedAd.slug === action.payload.slug) {
          state.selectedAd = action.payload
        }
      })
      .addCase(editAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? null
      })
  },
})

export default myAdsSlice.reducer
