'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  fetchMyAds,
  deleteMyAd,
  toggleMyAdStatus,
  promoteMyAdToVip,
} from '@/store/slices/ads/myAdsAction/myAdsAction'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Eye, MoreHorizontal, Plus, Trash2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { Ads } from '@/types/IAds'

export default function MyListingsPage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  // Берём user из auth-слайса
  const { user } = useAppSelector((state) => state.auth)
  // Берём уже отфильтрованные «мои» объявления
  const { myItems: listings, loading, error } = useAppSelector((state) => state.myads)

  // При монтировании страницы и при изменении user будем вызывать fetchMyAds(user.id)
  useEffect(() => {
    if (user) {
      dispatch(fetchMyAds(user.id))
    }
  }, [dispatch, user])

  // Удаление «моего» объявления
  const onDelete = async (slug: string) => {
    try {
      await dispatch(deleteMyAd(slug)).unwrap()
      toast({
        title: 'Объявление удалено',
        description: 'Ваше объявление успешно удалено',
      })
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: typeof err === 'string' ? err : 'Не удалось удалить объявление',
        variant: 'destructive',
      })
    }
  }

  // Переключение статуса «моего» объявления (active ↔ archived)
  const onToggleStatus = async (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active'
    try {
      await dispatch(toggleMyAdStatus({ slug, newStatus })).unwrap()
      toast({
        title: `Объявление ${newStatus === 'active' ? 'активировано' : 'деактивировано'}`,
        description: `Ваше объявление успешно ${
          newStatus === 'active' ? 'активировано' : 'деактивировано'
        }`,
      })
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: typeof err === 'string' ? err : 'Не удалось изменить статус объявления',
        variant: 'destructive',
      })
    }
  }

  // Повысить «моё» объявление до VIP
  const onPromote = async (slug: string) => {
    try {
      await dispatch(promoteMyAdToVip(slug)).unwrap()
      toast({
        title: 'Объявление поднято в VIP',
        description: 'Ваше объявление теперь отображается в VIP-секции',
      })
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: typeof err === 'string' ? err : 'Не удалось повысить объявление до VIP',
        variant: 'destructive',
      })
    }
  }

  if (!user) {
    return <p className="p-4 text-red-600">⛔ Доступ только для авторизованных пользователей.</p>
  }

  if (loading) {
    return <p className="p-4">Загрузка ваших объявлений…</p>
  }

  if (error) {
    return <p className="p-4 text-red-600">Ошибка: {error}</p>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои объявления</h1>
        <Button asChild>
          <Link href="/listings/create">
            <Plus className="mr-2 h-4 w-4" />
            Разместить объявление
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="archived">Неактивные</TabsTrigger>
          <TabsTrigger value="all">Все</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings
              .filter((listing) => listing.status === 'active')
              .map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onPromote={onPromote}
                />
              ))}
            {listings.filter((l) => l.status === 'active').length === 0 && (
              <p className="col-span-full text-center py-10">Нет активных объявлений</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings
              .filter((listing) => listing.status === 'archived')
              .map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onPromote={onPromote}
                />
              ))}
            {listings.filter((l) => l.status === 'archived').length === 0 && (
              <p className="col-span-full text-center py-10">Нет неактивных объявлений</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onPromote={onPromote}
                />
              ))
            ) : (
              <p className="col-span-full text-center py-10">У вас пока нет объявлений</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ListingCardProps {
  listing: Ads
  onDelete: (slug: string) => void
  onToggleStatus: (slug: string, currentStatus: string) => void
  onPromote: (slug: string) => void
}

function ListingCard({ listing, onDelete, onToggleStatus, onPromote }: ListingCardProps) {
  return (
    <Card className="overflow-hidden group relative">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/my-ads/${listing.slug}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onToggleStatus(listing.slug, listing.status)}>
              <Eye className="mr-2 h-4 w-4" />
              {listing.status === 'active' ? 'Деактивировать' : 'Активировать'}
            </DropdownMenuItem>

            {!listing.is_featured && (
              <DropdownMenuItem onClick={() => onPromote(listing.slug)}>
                <Badge className="mr-2 h-4 px-1 bg-yellow-500 hover:bg-yellow-600">VIP</Badge>
                Поднять в VIP
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(listing.slug)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {listing.is_featured && (
          <Badge variant="secondary" className="absolute top-2 left-2 bg-yellow-500 text-white">
            VIP
          </Badge>
        )}

        {listing.status === 'archived' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
            <Badge variant="outline" className="bg-white text-black">
              Неактивно
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-1">
          {listing.category_detail?.name} •{' '}
          {new Date(listing.created_at).toLocaleDateString('ru-RU')}
        </div>
        <Link href={`/listings/${listing.id}`} className="hover:underline">
          <h3 className="font-semibold line-clamp-2 mb-1">{listing.title}</h3>
        </Link>
        <div className="font-bold text-lg">
          {listing.price.toLocaleString()} {listing.currency}
        </div>
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {listing.view_count}
          </div>
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            {listing.is_favorited}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-2 text-sm text-muted-foreground border-t">
        {listing.location}
      </CardFooter>
    </Card>
  )
}
