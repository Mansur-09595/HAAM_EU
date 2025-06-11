import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Ads } from '@/types/IAds'
import { fetchFavorites, toggleFeatured, toggleFavorite } from './favoritesAction'

interface FavoritesState {
  items: Ads[]
  loading: boolean
  error: string | null
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
}

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<Ads>) => {
      const exists = state.items.find(item => item.id === action.payload.id)
      if (!exists) {
        state.items.push(action.payload)
      }
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFavorites.fulfilled, (state, action: PayloadAction<Ads[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? null
      })
      .addCase(toggleFeatured.fulfilled, (state, action: PayloadAction<Ads>) => {
        state.items = state.items.map(ad =>
          ad.id === action.payload.id ? action.payload : ad
        )
      })
      .addCase(toggleFavorite.fulfilled, (state, { payload }) => {
        if (!payload.isNowFavorited) {
          state.items = state.items.filter(ad => ad.slug !== payload.slug)
        } 
      })
  },
})

export const { addFavorite, removeFavorite } = favoritesSlice.actions

export default favoritesSlice.reducer