import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads } from '@/types/IAds' // Импортируем тип объявления

const API_BASE = 'http://localhost:8000/api'

// 🔁 Загрузка всех объявлений
export const fetchAds = createAsyncThunk<
  { results: Ads[]; count: number; next: string | null; previous: string | null },
  {
    page?: number
    category?: string
    city?: string
    searchTerm?: string
    minPrice?: number
    maxPrice?: number
    append?: boolean
  },
  { rejectValue: string }
>(
  'ads/fetchAds',
  async (
    {
      page = 1,
      category,
      city,
      searchTerm,
      minPrice,
      maxPrice,
    },
    { rejectWithValue }
  ) => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('page_size', String(8))
    if (category) params.set('category_slug', category)
    if (city) params.set('location', city)
    if (searchTerm) params.set('searchTerm', searchTerm)
    if (minPrice !== undefined) params.set('minPrice', String(minPrice))
    if (maxPrice !== undefined) params.set('maxPrice', String(maxPrice))

    const res = await fetch(`${API_BASE}/listings/?${params.toString()}`)
     // Если ответ не OK, читаем текст (HTML или сообщение об ошибке)
     if (!res.ok) {
      const text = await res.text()
      console.error('Ошибка при fetchAds:', text)
      return rejectWithValue(
        `Ошибка ${res.status} ${res.statusText}`
      )
    }

    // Если OK, пробуем распарсить JSON
    let data: { results: Ads[]; count: number; next: string | null; previous: string | null }
    try {
      data = await res.json()
    } catch (err) {
      console.error('Не удалось распарсить JSON:', err)
      return rejectWithValue('Неверный формат ответа от сервера')
    }

    // Убедимся, что данные в ожидаемой структуре
    if (
      !data ||
      !Array.isArray(data.results) ||
      typeof data.count !== 'number'
    ) {
      console.error('Неожиданная структура данных:', data)
      return rejectWithValue('Неожиданная структура данных от сервера')
    }

    return data as {
      results: Ads[]
      count: number
      next: string | null
      previous: string | null
    }
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