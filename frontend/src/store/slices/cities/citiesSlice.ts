// src/store/slices/cities/citiesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchBelgianCities } from './citiesAction'

interface City { name: string; admin: string }

interface CitiesState {
  items: City[]
  loading: boolean
  error: string | null
}

const initialState: CitiesState = {
  items: [],
  loading: false,
  error: null,
}

export const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBelgianCities.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBelgianCities.fulfilled, (state, action: PayloadAction<City[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchBelgianCities.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? null
      })
  },
})

export default citiesSlice.reducer
