import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads } from '@/types/IAds' // Импортируем тип объявления

const API_BASE = 'http://localhost:8000/api'

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
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Пожалуйста, войдите, чтобы просмотреть ваши объявления')
    }

    // Также URL пишем inline:
    const res = await fetch(`${API_BASE}/listings/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Ошибка при fetchMyAds:', text)
      return rejectWithValue(`Ошибка ${res.status}: ${res.statusText}`)
    }

    let data
    try {
      data = await res.json()
    } catch (err) {
      console.error('Не удалось распарсить JSON в fetchMyAds:', err)
      return rejectWithValue('Неверный формат ответа от сервера')
    }

    if (!data || !Array.isArray(data.results)) {
      console.error('Неожиданная структура данных в fetchMyAds:', data)
      return rejectWithValue('Неожиданная структура данных от сервера')
    }

    // Сразу фильтруем по owner.id, равному переданному userId
    const myAds = data.results.filter((ad: Ads) => ad.owner.id === userId)
    return myAds
  }
)


// ►►► Thunk для удаления «Моего» объявления
export const deleteMyAd = createAsyncThunk<string, string, { rejectValue: string }>(
  'ads/deleteMyAd',
  async (slug, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Пожалуйста, войдите, чтобы удалить объявление')
    }

    const res = await fetch(`${API_BASE}/listings/${slug}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Ошибка при deleteMyAd:', text)
      return rejectWithValue(`Ошибка ${res.status}: ${res.statusText}`)
    }

    return slug
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
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Пожалуйста, войдите, чтобы изменить статус объявления')
    }

    const res = await fetch(`${API_BASE}/listings/${slug}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })

    const data = await res.json()
    if (!res.ok) {
      return rejectWithValue(data.detail ?? 'Не удалось изменить статус объявления')
    }
    return data as Ads
  }
)


// ►►► Thunk для повышения «Моего» объявления до VIP
export const promoteMyAdToVip = createAsyncThunk<Ads, string, { rejectValue: string }>(
  'ads/promoteMyAdToVip',
  async (slug, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Пожалуйста, войдите, чтобы повысить объявление в VIP')
    }

    const res = await fetch(`${API_BASE}/listings/${slug}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_featured: true }),
    })

    const data = await res.json()
    if (!res.ok) {
      return rejectWithValue(data.detail ?? 'Не удалось повысить объявление в VIP')
    }
    return data as Ads
  }
)

// ►►► Новый Thunk: Редактирование существующего объявления
export const editAd = createAsyncThunk<
  Ads,                                         // возвращаем тип — обновлённый Ads
  { slug: string; updatedData: FormData | Partial<Ads> },  // slug + новые поля
  { rejectValue: string }
>(
  'ads/editAd',
  async ({ slug, updatedData }, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Пожалуйста, войдите, чтобы редактировать объявление')
    }

    // Если updatedData — FormData, не указываем Content-Type, иначе ставим application/json
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    }

    let body: BodyInit
    if (updatedData instanceof FormData) {
      body = updatedData
      // Браузер сам проставит корректный Content-Type для FormData
    } else {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(updatedData)
    }

    const res = await fetch(`${API_BASE}/listings/${slug}/`, {
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
      // 401/403 → не авторизован или не является владельцем
      if (res.status === 401 || res.status === 403) {
        return rejectWithValue('У вас нет прав редактировать это объявление')
      }
      const errObj = dataParsed as ErrorResponse
      return rejectWithValue(errObj.detail || 'Не удалось обновить объявление')
    }

    // Возвращаем приведённый к Ads объект
    return dataParsed as Ads
  }
)
