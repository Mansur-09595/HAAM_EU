'use client'

import { useAppDispatch, useAppSelector } from '@/store/store'
import { useEffect } from 'react'
import { fetchAds } from '@/store/slices/ads/adsAction'
import { setSearchTerm, setMinPrice, setMaxPrice } from '@/store/slices/ads/adsSlice'
import AdCard from '@/components/AdCard'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const {
    items: ads,
    loading,
    error,
    searchTerm,
    minPrice,
    maxPrice,
  } = useAppSelector((state) => state.ads)

  useEffect(() => {
    dispatch(fetchAds())
  }, [dispatch])

  const normalizedSearch = (searchTerm ?? '').toLowerCase()

  const isSearchActive = normalizedSearch.trim() !== ''
  const isPriceFilterActive = minPrice > 0 || maxPrice < 1000000

  const filteredAds = ads.filter((ad) => {
    const matchesTitle = isSearchActive
      ? ad.title?.toLowerCase().includes(normalizedSearch)
      : true

    const matchesPrice = isPriceFilterActive
      ? Number(ad.price) >= Number(minPrice) && Number(ad.price) <= Number(maxPrice)
      : true

    return matchesTitle && matchesPrice
  })

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Объявления</h1>

      <input
        type="text"
        placeholder="🔍 Поиск по заголовку..."
        className="w-full p-2 border rounded"
        value={searchTerm ?? ''}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
      />

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <input
          type="number"
          placeholder="Цена от"
          onChange={(e) =>
            dispatch(setMinPrice(Number(e.target.value) || 0))
          }
          className="p-2 border rounded w-full sm:w-1/4"
        />
        <input
          type="number"
          placeholder="Цена до"
          onChange={(e) =>
            dispatch(setMaxPrice(Number(e.target.value) || 1000000))
          }
          className="p-2 border rounded w-full sm:w-1/4"
        />
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAds.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </main>
  )
}
