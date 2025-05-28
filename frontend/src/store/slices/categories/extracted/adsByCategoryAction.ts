import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads, PaginatedResponse } from '@/types/IAds'

/**
 * GET /api/listings/?category_slug=${slug}
 * возвращает { count, next, previous, results: IAdWithCategory[] }
 */

export const fetchAdsByCategory = createAsyncThunk<
  Ads[],  // payload возвращает массив объявлений
  string,             // принимает slug категории
  { rejectValue: string }
>(
  'adsByCategory/fetchByCategory',
  async (slug, { rejectWithValue }) => {
    const res = await fetch(`http://localhost:8000/api/listings/?category_slug=${encodeURIComponent(slug)}`)
    if (!res.ok) {
      return rejectWithValue(`Ошибка ${res.status}: не удалось загрузить объявления`)
    }
    const data = (await res.json()) as PaginatedResponse<Ads>
    return data.results
  }
)