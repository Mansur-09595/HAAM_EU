import Link from 'next/link'
import Image from 'next/image'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { toggleFeatured } from '@/store/slices/ads/adsAction'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, StarOff } from 'lucide-react'
import type { Ads } from '@/types/IAds'

export default function FeaturedListingsVIP() {
  const dispatch = useAppDispatch()
  const ads = useAppSelector(state => state.ads.items)
  const currentUser = useAppSelector(state => state.auth.user)
  const isAdmin = currentUser?.is_staff

  // Фильтруем VIP-объявления
  const vipAds = ads.filter((ad: Ads) => ad.is_featured)

  const handleToggle = (id: number, isFeatured: boolean) => {
    dispatch(toggleFeatured({ id, is_featured: !isFeatured }))
  }

  if (vipAds.length === 0) {
    return <p className="text-center text-muted-foreground">Нет VIP-объявлений</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {vipAds.map((ad: Ads) => (
        <Card key={ad.id} className="overflow-hidden group relative">
          <div className="relative">
            <Link href={`/ad/${ad.slug}`}>  
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={ad.images?.[0]?.image || '/placeholder.svg'}
                  alt={ad.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </Link>

            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white" variant="secondary">
              VIP
            </Badge>

            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 rounded-full"
                onClick={() => handleToggle(ad.id, ad.is_featured)}
              >
                {ad.is_featured ? (
                  <Star className="h-5 w-5 text-yellow-500" />
                ) : (
                  <StarOff className="h-5 w-5 text-gray-500" />
                )}
                <span className="sr-only">
                  {ad.is_featured ? 'Снять VIP' : 'Сделать VIP'}
                </span>
              </Button>
            )}
          </div>

          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {ad.category_detail?.name} • {new Date(ad.created_at).toLocaleDateString('ru-RU')}
            </div>
            <Link href={`/ad/${ad.slug}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-2 mb-1">{ad.title}</h3>
            </Link>
            <div className="font-bold text-lg">{ad.price} {ad.currency}</div>
          </CardContent>

          <CardFooter className="px-4 py-2 text-sm text-muted-foreground border-t">
            {ad.location}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}