'use client'

import { useEffect, Suspense } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchAds } from '@/store/slices/ads/adsAction'
import { setSearchTerm, setMinPrice, setMaxPrice } from '@/store/slices/ads/adsSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import ListingGrid from '@/components/ListingGrid'
import CategoryList from '@/components/CategoryList'

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

  // console.log('filteredAds:', filteredAds)
  // console.log(filteredAds.map(ad => ad.id))

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 🔍 Поисковый баннер */}
      <section className="mb-10">
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 md:p-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Найдите то, что ищете</h1>
          <p className="text-lg mb-6 max-w-2xl">
            Миллионы объявлений о товарах, недвижимости, работе и услугах
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Поиск по объявлениям"
                className="pl-10 h-12 bg-white text-black w-full"
                value={searchTerm ?? ''}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              />
            </div>
            <Button className="h-12 px-6">Найти</Button>
          </div>
        </div>
      </section>

      {/* 💡 Категории */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Категории</h2>
        <Suspense fallback={<CategoryListSkeleton />}>
          <CategoryList />
        </Suspense>
      </section>


      {/* ⭐️ VIP объявления */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">VIP объявления</h2>
          <span className="text-blue-600">Смотреть все</span>
        </div>
        {/* TODO: FeaturedListings */}
        <Skeleton className="h-64 w-full rounded-lg" />
      </section>


        {/* 💰 Фильтры по цене */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="number"
            placeholder="Цена от"
            onChange={(e) => dispatch(setMinPrice(Number(e.target.value) || 0))}
            className="w-full sm:w-1/4"
          />
          <Input
            type="number"
            placeholder="Цена до"
            onChange={(e) => dispatch(setMaxPrice(Number(e.target.value) || 1000000))}
            className="w-full sm:w-1/4"
          />
        </div>

      {/* 🆕 Новые объявления */}
        {loading && <p>Загрузка...</p>}
        {error && <p className="text-red-500">Ошибка: {error}</p>}
        <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Новые объявления</h2>
          <span className="text-blue-600">Смотреть все</span>
        </div>
        <Suspense fallback={<ListingGridSkeleton />}>
          <ListingGrid listings={filteredAds} />  
        </Suspense>
        
      </section>
    </div>
  )
}
function CategoryListSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
    </div>
  )
}

function ListingGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
    </div>
  )
}