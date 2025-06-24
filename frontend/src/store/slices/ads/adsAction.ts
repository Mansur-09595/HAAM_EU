import { createAsyncThunk } from '@reduxjs/toolkit'
import { Ads } from '@/types/IAds'
import { TokenManager } from '@/utils/tokenUtils'
import { AuthErrorHandler } from '@/utils/authErrorHandler'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://haam-db.onrender.com/api'

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
    if (searchTerm) params.set('search', searchTerm)
    if (minPrice !== undefined) params.set('price_min', String(minPrice))
    if (maxPrice !== undefined) params.set('price_max', String(maxPrice))

      const res = await TokenManager.fetchWithAuth(
        `${API_BASE}/listings/?${params.toString()}`
      )
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
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/`, {
        method: 'POST',
        body: newAd,
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

// 🔍 Поиск объявления по ID
export const fetchAdBySlug = createAsyncThunk("ads/fetchBySlug", async (slug: string) => {
  const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/${slug}/`)
  if (res.status === 404){
      // можно вернуть null и отловить это на фронте
      return null
    }
    if (!res.ok) throw new Error("Ошибка загрузки")
    return (await res.json()) as Ads
  }
)