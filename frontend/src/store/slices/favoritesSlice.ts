import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Тип одного объявления (можно доработать позже)
type FavoriteItem = {
  id: string
  title: string
}

// Тип хранилища избранного
type FavoritesState = {
  items: FavoriteItem[]
}

// Начальное состояние: пока ничего нет
const initialState: FavoritesState = {
  items: [],
}

// Создаём слайс — "ящик" с избранным
export const favoritesSlice = createSlice({
  name: 'favorites', // имя в Redux DevTools
  initialState,
  reducers: {
    // Добавить объявление в избранное
    addFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      // Проверяем, чтобы не было повторов
      const exists = state.items.find(item => item.id === action.payload.id)
      if (!exists) {
        state.items.push(action.payload)
      }
    },

    // Удалить из избранного
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
  },
})

// Экспортируем действия (диспетчер команды)
export const { addFavorite, removeFavorite } = favoritesSlice.actions

// Экспортируем редьюсер
export default favoritesSlice.reducer
