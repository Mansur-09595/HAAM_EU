import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads } from '@/types/IAds'
import { TokenManager } from '@/utils/tokenUtils'
import { AuthErrorHandler } from '@/utils/authErrorHandler'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://haam-db.onrender.com/api'

interface ErrorResponse {
    detail?: string
}
  
// Новые Thunks для «Мои объявления» и операций с одним объявлением
// Аргументом в Thunk-е передаём userId
export const fetchMyAds = createAsyncThunk<
  Ads[],      // вернёт массив Ads
  number,     // аргумент — userId
  { rejectValue: string }
>(
  'ads/fetchMyAds',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/`)
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      const data = await res.json()

      if (!data || !Array.isArray(data.results)) {
        console.error('Неожиданная структура данных в fetchMyAds:', data)
        return rejectWithValue('Неожиданная структура данных от сервера')
      }

      // Сразу фильтруем по owner.id, равному переданному userId
      const myAds = data.results.filter((ad: Ads) => ad.owner.id === userId)
      return myAds
    } catch (err) {
      console.error('Не удалось выполнить fetchMyAds:', err)
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// ►►► Thunk для удаления «Моего» объявления
export const deleteMyAd = createAsyncThunk<string, string, { rejectValue: string }>(
  'ads/deleteMyAd',
  async (slug, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/${slug}/`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return slug
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)


// ►►► Thunk для переключения статуса «Моего» объявления
export const toggleMyAdStatus = createAsyncThunk<
  Ads,
  { slug: string; newStatus: 'active' | 'archived' },
  { rejectValue: string }
>(
  'ads/toggleMyAdStatus',
  async ({ slug, newStatus }, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/${slug}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
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


// ►►► Thunk для повышения «Моего» объявления до VIP
// export const promoteMyAdToVip = createAsyncThunk<Ads, string, { rejectValue: string }>(
//   'ads/promoteMyAdToVip',
//   async (slug, { rejectWithValue }) => {
//     try {
//       const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/${slug}/`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ is_featured: true }),
//       })
//       const data = await res.json()
//       if (!res.ok) {
//         const msg = await AuthErrorHandler.handle(res)
//         return rejectWithValue(msg)
//       }
//       return data as Ads
//     } catch {
//       return rejectWithValue('Ошибка подключения')
//     }
//   }
// )

// ►►► Новый Thunk: Редактирование существующего объявления
export const editAd = createAsyncThunk<
  Ads,                                         // возвращаем тип — обновлённый Ads
  { slug: string; updatedData: FormData | Partial<Ads> },  // slug + новые поля
  { rejectValue: string }
>(
  'ads/editAd',
  async ({ slug, updatedData }, { rejectWithValue }) => {
    // Если updatedData — FormData, не указываем Content-Type, иначе ставим application/json
    const headers: Record<string, string> = {}

    let body: BodyInit
    if (updatedData instanceof FormData) {
      body = updatedData
    } else {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(updatedData)
    }

    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/${slug}/`, {
        method: 'PATCH',
        headers,
        body,
      })

      let dataParsed: unknown
      try {
        dataParsed = await res.json()
      } catch (err) {
        console.error('Не удалось распарсить JSON при editAd:', err)
        return rejectWithValue('Неверный формат ответа от сервера при редактировании объявления')
      }

      if (!res.ok) {
        const errObj = dataParsed as ErrorResponse
        const msg = errObj.detail || (await AuthErrorHandler.handle(res))
        return rejectWithValue(msg)
      }

      return dataParsed as Ads
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)
