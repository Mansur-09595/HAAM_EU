'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchAds } from '@/store/slices/ads/adsAction'
import ListingFilters from '@/components/ListingsFilters'
import ListingGrid from '@/components/ListingGrid'
import { Button } from '@/components/ui/button'
import type { Ads } from '@/types/IAds'

export default function ListingsPage() {
  const dispatch = useAppDispatch()
  const { items: ads, count, page, loading, error } = useAppSelector(s => s.ads)
  const [filteredAds, setFilteredAds] = useState<Ads[]>(ads)

  // сначала грузим первую страницу
  useEffect(() => {
    dispatch(fetchAds({ page: 1 }))
  }, [dispatch])

  // сброс фильтров при новом массиве
  useEffect(() => {
    setFilteredAds(ads)
  }, [ads])

  const sortedAds = useMemo(() => {
    return [...filteredAds].sort((a, b) =>
      b.is_featured === a.is_featured ? 0 : b.is_featured ? 1 : -1
    )
  }, [filteredAds])

  if (loading && page === 1) return <p>Загрузка объявлений…</p>
  if (error) return <p className="text-red-600">Ошибка: {error}</p>

  const PAGE_SIZE = 8
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Все объявления</h1>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <aside>
          <ListingFilters onFilter={setFilteredAds} />
        </aside>
        <div>
          <ListingGrid listings={sortedAds} />

          <div className="flex space-x-2 justify-center mt-6">
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1
              return (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  onClick={() => dispatch(fetchAds({ page: p }))}
                >
                  {p}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
