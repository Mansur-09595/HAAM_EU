import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads } from '@/types/IAds' // Импортируем тип объявления

// 🔁 Загрузка всех объявлений
export const fetchAds = createAsyncThunk('ads/fetchAds', async () => {
  const res = await fetch('http://localhost:8000/api/listings/')
  if (!res.ok) throw new Error('Ошибка при загрузке')
  const data = await res.json()
  return data.results as Ads[]
})

// ➕ Добавление объявления
export const addAd = createAsyncThunk<
  Ads,          // возвращаем тип объявления
  FormData,     // аргумент — FormData
  { rejectValue: string }
>(
  'ads/addAd',
  async (newAd, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      // нет токена вообще
      return rejectWithValue('Пожалуйста, войдите, чтобы добавить объявление')
    }

    const res = await fetch('http://localhost:8000/api/listings/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: newAd,
    })

    const data = await res.json()
    if (!res.ok) {
      // 401/403 → неавторизован
      if (res.status === 401 || res.status === 403) {
        return rejectWithValue('Пожалуйста, войдите, чтобы добавить объявление')
      }
      // остальные ошибки API
      return rejectWithValue(data.detail || 'Ошибка при добавлении объявления')
    }

    return data as Ads
  }
)

// 🔍 Поиск объявления по ID
export const fetchAdBySlug = createAsyncThunk("ads/fetchBySlug", async (slug: string) => {
    const res = await fetch(`http://localhost:8000/api/listings/${slug}/`)
    if (res.status === 404) {
      // можно вернуть null и отловить это на фронте
      return null
    }
    if (!res.ok) throw new Error("Ошибка загрузки")
    return (await res.json()) as Ads
  }
)

