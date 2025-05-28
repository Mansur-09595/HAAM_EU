import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads } from '@/types/IAds' // Импортируем тип объявления

const API_BASE = 'http://localhost:8000/api'

// 🔁 Загрузка всех объявлений
const PAGE_SIZE = 8  // или 10, как хотите

export const fetchAds = createAsyncThunk<
  {
    results: Ads[]
    count: number
    next: string | null
    previous: string | null
  },
  { page?: number; append?: boolean },
  { rejectValue: string }
>(
  'ads/fetchAds',
  async ({ page = 1 }, { rejectWithValue }) => {
    const res = await fetch(
      `${API_BASE}/listings/?page=${page}&page_size=${PAGE_SIZE}`
    )
    const data = await res.json()
    if (!res.ok) return rejectWithValue(data.detail || 'Ошибка при загрузке')
    return data
  }
)

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

    const res = await fetch(`${API_BASE}/listings/`, {
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
    const res = await fetch(`${API_BASE}/listings/${slug}/`)
    if (res.status === 404) {
      // можно вернуть null и отловить это на фронте
      return null
    }
    if (!res.ok) throw new Error("Ошибка загрузки")
    return (await res.json()) as Ads
  }
)

//VIP-статус объявления
export const toggleFeatured = createAsyncThunk<
  Ads,
  { id: number; is_featured: boolean },
  { rejectValue: string }
>(
  'ads/toggleFeatured',
  async ({ id, is_featured }, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`${API_BASE}/listings/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_featured }),
    })
    const data = await res.json()
    if (!res.ok) {
      return rejectWithValue(data.detail ?? 'Не удалось обновить VIP-статус')
    }
    return data as Ads
  }
)