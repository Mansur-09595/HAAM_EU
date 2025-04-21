'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Heart, Share2, Flag, MapPin,
  Calendar, MessageSquare, Phone, Shield, Eye
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
// import SimilarListings from '@/components/similar-listings'

import { Ads } from '@/types/IAds'

export default function ListingDetailPage() {
  const params = useParams()
  const id = params?.id
  const [listing, setListing] = useState<Ads | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`http://localhost:8000/api/listings/${id}/`)
      const data = await res.json()
      setListing(data)
    }

    if (id) fetchListing()
  }, [id])

  if (!listing) return <p className="p-4">Загрузка...</p>

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Назад */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к объявлениям
          </Link>
        </Button>
      </div>

      {/* Контент */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div>
          {/* Заголовок */}
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-2">
              {listing.category_detail?.name}
            </div>

            <div className="flex items-start justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Flag className="h-5 w-5" /></Button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="text-3xl font-bold">{listing.price} ₽</div>
              {listing.is_featured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white">VIP</Badge>
              )}
            </div>
          </div>

          {/* Галерея */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="col-span-2">
                <Image
                  src={listing.images[0]?.image || '/placeholder.svg'}
                  alt={listing.title}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
              {listing.images.slice(1).map((img, index) => (
                <Image
                  key={index}
                  src={img.image}
                  alt={`${listing.title} ${index}`}
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg object-cover"
                />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-8">
            <TabsList>
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="attributes">Характеристики</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p>{listing.description}</p>
            </TabsContent>
            <TabsContent value="attributes" className="mt-4">
              <p>Характеристики недоступны</p>
            </TabsContent>
          </Tabs>

          {/* Карта */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Местоположение</h2>
            <div className="bg-muted rounded-lg h-[300px] flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{listing.location}</span>
            </div>
          </div>

          {/* Похожие */}
          {/* <div>
            <h2 className="text-xl font-bold mb-4">Похожие объявления</h2>
            <SimilarListings category={listing.category_detail?.name} excludeId={listing.id} />
          </div> */}
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={listing.owner.avatar || '/placeholder.svg'} alt={listing.owner.username} />
                  <AvatarFallback>{listing.owner.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold flex items-center">
                    {listing.owner.username}
                    <Shield className="h-4 w-4 text-blue-500 ml-1" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    На сайте с {new Date(listing.owner.date_joined).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button><MessageSquare className="mr-2 h-4 w-4" />Написать</Button>
                <Button variant="outline"><Phone className="mr-2 h-4 w-4" />Показать телефон</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Размещено: {new Date(listing.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{listing.view_count} просмотров</span>
              </div>
              <div className="text-sm text-muted-foreground">ID: {listing.id}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
