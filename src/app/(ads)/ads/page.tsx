// src/app/ads/page.tsx
'use client'

import { useEffect, useState, useMemo  } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAds } from '@/store/slices/ads/adsAction'
import ListingFilters from '@/components/ListingsFilters'
import ListingGrid from '@/components/ListingGrid'
// import FeaturedListingsVIP from '@/components/FeaturedListingsVIP'
import type { Ads } from '@/types/IAds'

export default function ListingsPage() {
  const dispatch = useAppDispatch()
  const { items: ads, loading, error } = useAppSelector(state => state.ads)

  // Локальный стейт для отфильтрованных объявлений
  const [filteredAds, setFilteredAds] = useState<Ads[]>([])

  // Загружаем все объявления
  useEffect(() => {
    dispatch(fetchAds())
  }, [dispatch])

  // Сброс фильтрованного списка при получении ads
  useEffect(() => {
    setFilteredAds(ads)
  }, [ads])

   // Сортируем: сначала VIP (is_featured=true), затем остальные
   const sortedAds = useMemo(() => {
    return [...filteredAds].sort((a, b) =>
      b.is_featured === a.is_featured
        ? 0
        : b.is_featured
        ? 1
        : -1
    )
  }, [filteredAds])

  if (loading) return <p>Загрузка всех объявлений…</p>
  if (error)   return <p className="text-red-600">Ошибка: {error}</p>

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Все объявления</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <aside>
          <ListingFilters onFilter={setFilteredAds} />
        </aside>

        <div>
          {sortedAds.length > 0 ? (
            <ListingGrid listings={sortedAds} />
          ) : (
            <Skeleton className="h-[400px] w-full" />
          )}
        </div>
      </div>
    </div>
  )
}