'use client'

import { useAppDispatch, useAppSelector } from '@/store/store'
import { addFavorite, removeFavorite } from '@/store/slices/favoritesSlice'

type Props = {
  id: string
  title: string
}

export default function FavoriteButton({ id, title }: Props) {
  const dispatch = useAppDispatch()

  // Получаем все избранные элементы
  const favorites = useAppSelector(state => state.favorites.items)

  // Проверяем, есть ли текущий элемент в избранном
  const isFavorite = favorites.some(item => item.id === id)

  // Обработчик нажатия на кнопку
  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(id))
    } else {
      dispatch(addFavorite({ id, title }))
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`text-2xl ${isFavorite ? 'text-yellow-500' : 'text-gray-400'} transition`}
    >
      {isFavorite ? '💛' : '🤍'}
    </button>
  )
}
