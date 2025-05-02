import { createAsyncThunk } from '@reduxjs/toolkit'
import { Category } from './categoriesSlice' // Тип категории

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const res = await fetch('http://localhost:8000/api/listings/categories/')
    if (!res.ok) throw new Error('Ошибка при загрузке категорий')
    
    const data = await res.json()
    return data.results as Category[] // ✅ ВАЖНО: вытаскиваем categories из data.results
  }
)

// 🔍 Поиск объявления по slug
export const fetchAdsByCategory = createAsyncThunk(
  'ads/fetchByCategory',
  async (slug: string) => {
    const res = await fetch(`http://localhost:8000/api/listings/?category_slug=${slug}`)
    if (!res.ok) throw new Error('Ошибка при загрузке объявлений по категории')
    const data = await res.json()
    return data.results
  }
)