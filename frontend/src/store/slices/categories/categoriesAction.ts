import { createAsyncThunk } from '@reduxjs/toolkit'
import { Category } from './categoriesSlice' // Тип категории

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const res = await fetch('https://haam-db.onrender.com/api/listings/categories/')
    if (!res.ok) throw new Error('Ошибка при загрузке категорий')
    
    const data = await res.json()
    return data.results as Category[] // ✅ ВАЖНО: вытаскиваем categories из data.results
  }
)