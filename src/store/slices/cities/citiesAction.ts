// src/store/slices/cities/citiesAction.ts
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchBelgianCities = createAsyncThunk<
  { name: string; admin: string }[],
  void,
  { rejectValue: string }
>(
  'cities/fetchBelgian',
  async (_, { rejectWithValue }) => {
    const username = process.env.NEXT_PUBLIC_GEONAMES_USER
    const res = await fetch(
      `http://api.geonames.org/searchJSON?country=BE&featureClass=P&maxRows=1000&username=${username}`
    )
    const data = await res.json()
    if (!res.ok || !data.geonames) {
      return rejectWithValue('Не удалось загрузить города')
    }
    return data.geonames
      .map((g: { name: string; adminName1: string }) => ({ name: g.name, admin: g.adminName1 }))
      .sort((a: { name: string; admin: string }, b: { name: string; admin: string }) => a.name.localeCompare(b.name))
  }
)
