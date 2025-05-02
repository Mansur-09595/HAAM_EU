'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchAdsByCategory } from '@/store/slices/categories/extracted/adsByCategoryAction'
import ListingGrid from '@/components/ListingGrid'
import type { Ads } from '@/types/IAds'

export default function CategoryPage() {
  const { slug } = useParams()
  const dispatch = useAppDispatch()

  const { items: ads, loading, error } = useAppSelector(
    (state) => state.adsByCategory
  )

  useEffect(() => {
    if (slug) {
      dispatch(fetchAdsByCategory(String(slug)))
    }
  }, [slug, dispatch])

  if (!slug) {
    return <p className="text-gray-600">Категория не указана.</p>
  }

  if (loading) {
    return <p>Загрузка объявлений…</p>
  }

  if (error) {
    return <p className="text-red-600">Ошибка: {error}</p>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">
        Объявления категории «{slug}»
      </h1>

      {ads.length > 0 ? (
        <ListingGrid listings={ads as Ads[]} />
      ) : (
        <p>В этой категории пока нет объявлений.</p>
      )}
    </div>
  )
}
