import { createSlice } from '@reduxjs/toolkit'
import { fetchCategories } from './categoriesAction'
import { CategoryDetail } from '@/types/IAds' // Импортируем тип категории

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  parent: number | null
  children: CategoryDetail[]
}

interface CategoriesState {
  items: Category[]
  loading: boolean
  error: string | null
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Ошибка загрузки категорий'
      })
  }
})

export default categoriesSlice.reducer
