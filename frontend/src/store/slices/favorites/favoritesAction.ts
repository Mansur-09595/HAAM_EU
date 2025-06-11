import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads } from '@/types/IAds'
import { TokenManager } from '@/utils/tokenUtils'
import { AuthErrorHandler } from '@/utils/authErrorHandler'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api'

// ⭐ Избранное объявления (получение списка избранных объявлений)
export const fetchFavorites = createAsyncThunk<
  Ads[],
  void,
  { rejectValue: string }
>('favorites/fetchFavorites', async (_, { rejectWithValue }) => {
  try {
    const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/favorites/`)
    const data = await res.json()

    if (!res.ok) {
      const msg = await AuthErrorHandler.handle(res)
      return rejectWithValue(msg)
    }

    const results = Array.isArray(data) ? data : data.results
    if (!Array.isArray(results)) {
      return rejectWithValue('Unexpected data format from server')
    }

    return results as Ads[]
  } catch {
    return rejectWithValue('Ошибка подключения')
  }
})

// ⭐ Избранное объявления (добавление/удаление из избранного)
export const toggleFavorite = createAsyncThunk<
  { slug: string; isNowFavorited: boolean },
  { slug: string; is_favorited: boolean },
  { rejectValue: string }
>(
  'favorites/toggleFavorite',
  async ({ slug, is_favorited }, { rejectWithValue }) => {
    try {
      if (is_favorited) {
        // Уже в избранном → unfavorite
        const res = await TokenManager.fetchWithAuth(
          `${API_BASE}/listings/${slug}/unfavorite/`,
          { method: 'DELETE' }
        )
        if (!res.ok) {
          throw new Error(await AuthErrorHandler.handle(res))
        }
        return { slug, isNowFavorited: false }
      } else {
        // Нет в избранном → favorite
        const res = await TokenManager.fetchWithAuth(
          `${API_BASE}/listings/${slug}/favorite/`,
          { method: 'POST' }
        )
        if (!res.ok) {
          throw new Error(await AuthErrorHandler.handle(res))
        }
        return { slug, isNowFavorited: true }
      }
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)



// ⭐ VIP-статус объявления (изменение is_featured)
export const toggleFeatured = createAsyncThunk<
  Ads,
  { slug: string; is_featured: boolean },
  { rejectValue: string }
>(
  'ads/toggleFeatured',
  async ({ slug, is_featured }, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/${slug}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return data as Ads
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)