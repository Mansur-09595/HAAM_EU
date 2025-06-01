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

// ⭐ VIP-статус объявления (изменение is_featured)
export const toggleFeatured = createAsyncThunk<
  Ads,
  { slug: string; is_featured: boolean },
  { rejectValue: string }
>(
  'ads/toggleFeatured',
  async ({ slug, is_featured }, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Пожалуйста, войдите, чтобы изменить VIP-статус')
    }

    const res = await fetch(`${API_BASE}/listings/${slug}/`, {
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



// ►►► Новый Thunk: Обновление изображения объявления
// Тип возврата: мы ожидаем, что сервер вернёт тот же JSON, что и при создании:
// { id, image, is_primary, created_at }
export const updateListingImage = createAsyncThunk<
  {
    id: number;
    image: string;
    is_primary: boolean;
    created_at: string;
  },
  {
    id: number;               // id существующего ListingImage
    imageFile?: File;         // если нужно заменить файл
    is_primary?: boolean;     // если нужно только поменять флаг primary
  },
  { rejectValue: string }
>(
  "ads/updateListingImage",
  async ({ id, imageFile, is_primary }, { rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("Пожалуйста, войдите, чтобы обновить изображение");
    }

    // Собираем FormData: будем включать только те поля, что переданы
    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (typeof is_primary === "boolean") {
      formData.append("is_primary", is_primary ? "true" : "false");
    }

    const res = await fetch(`${API_BASE}/listings/images/${id}/`, {
      method: "PATCH", // или "PUT", если вы хотите полную замену
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type не ставим — браузер проставит multipart/form-data boundary
      },
      body: formData,
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch (err) {
      console.error("Не удалось распарсить JSON при updateListingImage:", err);
      return rejectWithValue("Неверный формат ответа от сервера при обновлении изображения");
    }

    if (!res.ok) {
      // Если сервер вернул ошибку (например, 400/403)
      const errObj = data as { detail?: string };
      return rejectWithValue(errObj.detail || "Не удалось обновить изображение");
    }

    return data as {
      id: number;
      image: string;
      is_primary: boolean;
      created_at: string;
    };
  }
);