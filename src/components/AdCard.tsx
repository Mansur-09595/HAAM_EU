'use client'

import Link from 'next/link'
import { Ads } from '@/types/IAds'

type Props = {
  ad: Ads
}

export default function AdCard({ ad }: Props) {
  const mainImage = ad.images?.[0]?.image // первое изображение (если есть)

  return (
    <Link href={`/ad/${ad.id}`}>
      <div className="p-4 border rounded hover:shadow transition space-y-2">
        {mainImage && (
          <img
            src={mainImage}
            alt={ad.title}
            className="w-full h-48 object-cover rounded"
          />
        )}
        <h2 className="text-lg font-bold">{ad.title}</h2>
        <p className="text-sm text-gray-500">{ad.description}</p>
        <p className="text-blue-600 font-semibold">{ad.price} {ad.currency}</p>
      </div>
    </Link>
  )
}
