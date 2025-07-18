import { createAsyncThunk } from '@reduxjs/toolkit'
import { Category } from './categoriesSlice' // Тип категории

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api'}/listings/categories/`)
    if (!res.ok) throw new Error('Ошибка при загрузке категорий')
    
    const data = await res.json()
    return data.results as Category[] // ✅ ВАЖНО: вытаскиваем categories из data.results
  }
)