import { Ads } from '@/types/IAds'
import ListingGrid from '@/components/ListingGrid' // обновлённый импорт

async function getAds(): Promise<Ads[]> {
  const res = await fetch('http://localhost:3000/api/ads', { cache: 'no-store' })
  return await res.json()
}

export default async function MyAdsPage() {
  const currentUserId = '123'
  const ads = await getAds()
  const myAds = ads
    .filter(ad => ad.owner.id === Number(currentUserId))
    .map(ad => ({
      ...ad,
      is_favorited: typeof ad.is_favorited === 'boolean' ? ad.is_favorited : ad.is_favorited === 'true',
    }))

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Мои объявления</h1>

      {myAds.length === 0 ? (
        <p className="text-gray-500">У вас пока нет объявлений.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ListingGrid listings={myAds} />
        </div>
      )}
    </main>
  )
}
