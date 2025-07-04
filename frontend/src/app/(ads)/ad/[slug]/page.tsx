'use client'

import { useEffect } from 'react'
import { useParams, notFound, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from "@/store/store"
import { fetchAdBySlug } from "@/store/slices/ads/adsAction"
import { createConversation } from '@/store/slices/chat/chatActions'
import {
  ArrowLeft, Heart, Share2, Flag, MapPin,
  Calendar, MessageSquare, Phone, Shield, Eye
} from 'lucide-react'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { toggleFavorite } from '@/store/slices/favorites/favoritesAction'


export default function ListingDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()

  // 1) Загрузка самого объявления
  const { selectedAd: listing, loading: loadingAd, error: adError } = useAppSelector(
    state => state.ads
  )

  // 2) Текущий залогиненный пользователь берём из auth-слайса
  const currentUser = useAppSelector(state => state.auth.user)
  const loadingProfile = useAppSelector(state => state.auth.loading)

  useEffect(() => {
    if (slug) {
      dispatch(fetchAdBySlug(String(slug)))
    }
  }, [slug, dispatch])

  if (loadingAd || loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p>Загрузка…</p>
      </div>
    )
  }

  if (adError === 'Объявление не найдено') {
    return notFound()
  }
  if (!listing) {
    return null
  }

  const handleStartChat = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (currentUser.id === listing.owner.id) {
      return
    }
    try {
      const conv = await dispatch(
        createConversation({ participant_id: listing.owner.id, listing_id: listing.id })
      ).unwrap()
      router.push(`/chat?conv=${conv.id}`)
    } catch (err) {
      console.error('Не удалось начать переписку:', err)
    }
  }
  
  const isFavorite =
          typeof listing.is_favorited === 'boolean'
            ? listing.is_favorited
            : listing.is_favorited === 'true'
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Назад */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ads">
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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      dispatch(
                        toggleFavorite({
                          slug: listing.slug,
                          is_favorited: isFavorite,
                        })
                      )
                    }
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="sr-only">
                      {isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    </span>
                  </Button>
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
                  key={img.id || index}
                  src={img.image}
                  alt={`${listing.title} ${index + 1}`}
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
            <div className="bg-muted rounded-lg h-[300px] overflow-hidden mb-2">
              <GoogleMapEmbed address={listing.location} />
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="ml-1">{listing.location}</span>
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
                <Button disabled={currentUser?.id === listing.owner.id} onClick={handleStartChat}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                    Написать
                </Button>
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
              {/* <div className="text-sm text-muted-foreground">ID: {listing.id}</div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
