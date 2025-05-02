'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { Ads } from '@/types/IAds'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type Props = {
  listings: Ads[]
}

export default function ListingGrid({ listings }: Props) {
  if (!listings || listings.length === 0) return <p>Нет объявлений</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <Card key={listing.id ?? `${listing.title}-${listing.price}`} className="overflow-hidden group">
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Добавить в избранное</span>
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {listing.category_detail?.name} • {new Date(listing.created_at).toLocaleDateString('ru-RU')}
            </div>
            <Link href={`/ad/${listing.slug}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-2 mb-1">{listing.title}</h3>
            </Link>
            <div className="font-bold text-lg">{listing.price} {listing.currency}</div>
          </CardContent>
          <CardFooter className="px-4 py-2 text-sm text-muted-foreground border-t">
            {listing.location}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
