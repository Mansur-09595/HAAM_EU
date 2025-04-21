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
export const addAd = createAsyncThunk(
  'ads/addAd',
  async (newAd: { title: string; description: string; price: string; currency: string }) => {
    const token = localStorage.getItem('accessToken')
    const res = await fetch('http://localhost:8000/api/listings/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAd),
    })

    if (!res.ok) throw new Error('Ошибка при добавлении')

    const data = await res.json()
    return data as Ads
  }
)