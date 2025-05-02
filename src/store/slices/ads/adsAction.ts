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
export const addAd = createAsyncThunk('ads/addAd', async (newAd: FormData) => {
  const token = localStorage.getItem('accessToken')

  const res = await fetch('http://localhost:8000/api/listings/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, // не указываем Content-Type!
    },
    body: newAd,
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('❌ Ошибка добавления:', errorText)
    throw new Error('Ошибка при добавлении объявления')
  }

  return await res.json()
})

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

