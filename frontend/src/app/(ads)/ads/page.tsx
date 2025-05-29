'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchAds } from '@/store/slices/ads/adsAction'
import { setPage } from '@/store/slices/ads/adsSlice'
import ListingFilters from '@/components/ListingsFilters'
import ListingGrid from '@/components/ListingGrid'
import { Button } from '@/components/ui/button'
// import type { Ads } from '@/types/IAds'

export default function ListingsPage() {
  const dispatch = useAppDispatch()
  const {
    items: ads,
    count,
    page,
    loading,
    error,
    category,
    city,
    searchTerm,
    minPrice,
    maxPrice,
  } = useAppSelector(s => s.ads)

  const PAGE_SIZE = 8
  const totalPages = Math.ceil(count / PAGE_SIZE)

  // При монтировании и при смене page или фильтров — запрашиваем список
  useEffect(() => {
    dispatch(
      fetchAds({
        page,
        category: category ? String(category) : undefined,
        city: city || undefined,
        searchTerm: searchTerm || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1_000_000 ? maxPrice : undefined,
      })
    )
  }, [
    dispatch,
    page,
    category,
    city,
    searchTerm,
    minPrice,
    maxPrice,
  ])

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Все объявления</h1>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <aside>
          <ListingFilters />
        </aside>
        <div>
          {loading && <p className="text-center py-10">Загрузка объявлений…</p>}
          {error && <p className="text-red-600 py-10 text-center">Ошибка: {error}</p>}
          {!loading && !error && (
            ads.length > 0
              ? <ListingGrid listings={ads} />
              : <p className="text-center py-10">Нет объявлений</p>
          )}

          {totalPages > 1 && (
            <div className="flex space-x-2 justify-center mt-6">
              {[...Array(totalPages)].map((_, idx) => {
                const p = idx + 1
                return (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    onClick={() => dispatch(setPage(p))}
                    disabled={loading}
                  >
                    {p}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}