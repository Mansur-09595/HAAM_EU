'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, StarOff } from 'lucide-react'
import { Ads } from '@/types/IAds'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { toggleFeatured } from '@/store/slices/ads/adsAction'

type Props = {
  listings: Ads[]
}

export default function ListingGrid({ listings }: Props) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(state => state.auth.user)
  const isAdmin = currentUser?.is_staff

  if (!listings || listings.length === 0) return <p>Нет объявлений</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {listings.map((listing, idx ) => (
        <Card  key={`${listing.slug}-${listing.created_at}-${idx}`} className="overflow-hidden group relative">
          {/* VIP badge for all users */}
          {listing.is_featured && (
            <span className="absolute top-2 left-2 bg-yellow-300 text-white px-2 py-1 rounded text-xs">
              VIP
            </span>
          )}

          <div className="relative">
            <Link href={`/ad/${listing.slug}`}>  
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={listing.images?.[0]?.image || '/placeholder.svg'}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </Link>

            <div className="absolute top-2 right-2 flex space-x-1">
              {/* Favorite icon (heart) */}
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/80 hover:bg-white rounded-full"
                onClick={() => console.log('Toggle favorite')}
              >
                <Heart className="h-5 w-5 text-red-500" />
                <span className="sr-only">Добавить в избранное</span>
              </Button>

              {/* Admin-only toggle VIP */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white rounded-full"
                  onClick={() =>
                    dispatch(
                      toggleFeatured({ id: listing.id, is_featured: !listing.is_featured })
                    )
                  }
                >
                  {listing.is_featured ? (
                    <Star className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="sr-only">
                    {listing.is_featured ? 'Убрать VIP' : 'Сделать VIP'}
                  </span>
                </Button>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {listing.category_detail?.name} •{' '}
              {new Date(listing.created_at).toLocaleDateString('ru-RU')}
            </div>
            <Link href={`/ad/${listing.slug}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-2 mb-1">
                {listing.title}
              </h3>
            </Link>
            <div className="font-bold text-lg">
              {listing.price} {listing.currency}
            </div>
          </CardContent>

          <CardFooter className="px-4 py-2 text-sm text-muted-foreground border-t">
            {listing.location}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}