'use client'

import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store/store'
import { Ads } from '@/types/IAds'

export default function MyAdsPage() {
  const { user } = useAppSelector(state => state.auth)
  const [ads, setAds] = useState<Ads[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/listings/')
        const data = await res.json()
        const allAds = data.results

        const filtered = allAds.filter((ad: Ads) => ad.owner.id === user?.id)
        setAds(filtered)
      } catch (err) {
        console.error('Ошибка загрузки объявлений:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchAds()
  }, [user])

  if (!user) return <p className="p-4 text-red-600">⛔ Доступ только для авторизованных.</p>
  if (loading) return <p className="p-4">Загрузка...</p>

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">🧾 Мои объявления</h1>

      {ads.length === 0 ? (
        <p>У вас пока нет объявлений.</p>
      ) : (
        <ul className="space-y-3">
          {ads.map(ad => (
            <li key={ad.id} className="border p-4 rounded">
              <h2 className="font-semibold text-lg">{ad.title}</h2>
              <p>{ad.description}</p>
              <p className="text-sm text-gray-600">💰 {ad.price} {ad.currency}</p>
              {ad.images.length > 0 && (
                <div className="flex space-x-2 mt-2">
                  {ad.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.image} // ✅ правильное поле
                      alt={ad.title}
                      className="w-32 h-32 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
