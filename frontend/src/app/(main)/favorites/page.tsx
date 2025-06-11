'use client'

import { useEffect } from 'react'
import ListingGrid from '@/components/ListingGrid'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchFavorites } from '@/store/slices/favorites/favoritesAction'

export default function FavoritesPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { items: listings, loading, error } = useAppSelector(state => state.favorites)

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites())
    }
  }, [dispatch, user])

  if (!user) {
    return <p className="p-4 text-red-600">⛔ Доступ только для авторизованных пользователей.</p>
  }

  if (loading) return <p className="p-4">Загрузка…</p>
  if (error) return <p className="p-4 text-red-600">Ошибка: {error}</p>

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      {listings.length === 0 ? (
        <p className="text-muted-foreground">У вас пока нет избранных объявлений.</p>
      ) : (
        <ListingGrid listings={listings} />
      )}
    </div>
  )
}