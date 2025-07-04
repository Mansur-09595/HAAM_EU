'use client'

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchUserById, deleteUser } from '@/store/slices/auth/users/usersAction';
import { fetchMyAds, deleteMyAd, toggleMyAdStatus } from '@/store/slices/ads/myAdsAction/myAdsAction';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Eye, MoreHorizontal, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Ads } from '@/types/IAds';

export default function UserDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = idParam && !isNaN(Number(idParam)) ? Number(idParam) : null;

  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector(state => state.users.selected);
  const loading = useAppSelector(state => state.users.loading);
  const error = useAppSelector(state => state.users.error);
  const currentUser = useAppSelector(state => state.auth.user);

  const { myItems: listings, loading: adsLoading, error: adsError } = useAppSelector(state => state.myads);
  const { toast } = useToast();

  useEffect(() => {
    // Редирект, если idParam — это 'confirm-email'
    if (idParam === 'confirm-email') {
      const token = new URLSearchParams(window.location.search).get('token');
      router.push(`/confirm-email${token ? `?token=${token}` : ''}`);
      return;
    }
    if (id !== null) {
      dispatch(fetchUserById(id));
    }
  }, [id, idParam, dispatch, router]);

  useEffect(() => {
    if (user && id !== null) {
      dispatch(fetchMyAds(id));
    }
  }, [user, id, dispatch]);

  if (id === null) {
    return <p className="text-red-500">Некорректный ID пользователя</p>;
  }
  if (!currentUser?.is_staff) return <p>Доступ запрещён</p>;
  if (loading) return <p>Загрузка…</p>;
  if (error) return <p className="text-red-500">Ошибка: {error}</p>;
  if (!user) return <p>Пользователь не найден.</p>;

  const onDelete = async (slug: string) => {
    try {
      await dispatch(deleteMyAd(slug)).unwrap();
      toast({ title: 'Объявление удалено' });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: typeof err === 'string' ? err : 'Не удалось удалить объявление',
        variant: 'destructive',
      });
    }
  };

  const onToggleStatus = async (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      await dispatch(toggleMyAdStatus({ slug, newStatus })).unwrap();
      toast({
        title: newStatus === 'active' ? 'Объявление активировано' : 'Объявление деактивировано',
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: typeof err === 'string' ? err : 'Не удалось изменить статус объявления',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
      <p className="mb-4 text-gray-600">{user.email}</p>
      {currentUser?.is_staff && (
        <div className="space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => router.push(`/users/${id}/edit`)}
          >
            Редактировать
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={() =>
              dispatch(deleteUser(id!))
                .unwrap()
                .then(() => router.push('/users'))
            }
          >
            Удалить
          </button>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Объявления</h2>
        {adsLoading && <p>Загрузка объявлений…</p>}
        {adsError && <p className="text-red-500">Ошибка: {adsError}</p>}
        {!adsLoading && !adsError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  isAdmin={currentUser?.is_staff === true}
                />
              ))
            ) : (
              <p className="col-span-full text-center py-10">Нет объявлений</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ListingCardProps {
 listing: Ads
 onDelete: (slug: string) => void
 onToggleStatus: (slug: string, currentStatus: string) => void
 isAdmin: boolean
}

function ListingCard({ listing, onDelete, onToggleStatus, isAdmin }: ListingCardProps) {
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

       {isAdmin && (
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
       )}

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