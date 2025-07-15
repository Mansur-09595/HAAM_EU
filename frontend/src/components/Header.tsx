"use client"

import { useEffect } from 'react'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Plus, Heart, MessageSquare, User, LogIn, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppDispatch, useAppSelector } from '@/store/store'
import { logout } from '@/store/slices/auth/authSlice'
import { fetchNotifications } from '@/store/slices/notifications/notificationsAction'
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)

   // 1) Получаем userId
   const userId: number | null = user?.id ?? null

   // 2) Загружаем все уведомления один раз при авторизации
   useEffect(() => {
     if (userId) {
       dispatch(fetchNotifications())
     }
   }, [dispatch, userId])
 
   // 3) Подключаем WebSocket для real-time апдейтов
   useNotificationWebSocket(userId)
 
   // 4) Считаем количество непрочитанных уведомлений типа "message"
  const unreadMessagesCount = useAppSelector(
    state =>
      state.notifications.items.filter(
        notification => notification.notification_type === 'message' && !notification.is_read
      ).length
  )

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className={`text-lg ${pathname === "/" ? "font-bold" : ""}`}>
                  Главная
                </Link>
                <Link href="/ads" className={`text-lg ${pathname === "/ads" ? "font-bold" : ""}`}>
                  Объявления
                </Link>
                {user ? (
                  <>
                    <Link href="/favorites" className={`text-lg ${pathname === "/favorites" ? "font-bold" : ""}`}>
                      Избранное
                    </Link>
                    <Link href="/chat" className={`text-lg ${pathname === "/chat" ? "font-bold" : ""}`}>
                      Сообщения
                    </Link>
                    <Link href="/profile" className={`text-lg ${pathname === "/profile" ? "font-bold" : ""}`}>
                      Мой профиль
                    </Link>
                    <Link href="/my-ads" className={`text-lg ${pathname === "/my-ads" ? "font-bold" : ""}`}>
                      Мои объявления
                    </Link>
                  </>
                ) : (
                  <Link href="/login" className="mt-4">
                    Войти
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-2xl font-bold text-blue-600 ml-2 md:ml-0">
            HAAM.BE
          </Link>

          <nav className="hidden md:flex ml-10 space-x-6">
            <Link
              href="/ads"
              className={`hover:text-blue-600 ${pathname === "/ads" ? "text-blue-600 font-medium" : ""}`}
            >
              Объявления
            </Link>
            <Link
              href="/about"
              className={`hover:text-blue-600 ${pathname === "/about" ? "text-blue-600 font-medium" : ""}`}
            >
              Об сервисе
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link href="/new">
              <Plus className="h-4 w-4 mr-2" />
              Разместить объявление
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="icon" className="hidden md:flex">
                <Link href="/favorites">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Избранное</span>
                </Link>
              </Button>

               {/* Сообщения с бейджем */}
               <Button
                asChild
                variant="ghost"
                size="icon"
                className="hidden md:flex relative"
              >
                <Link href="/chat">
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <span 
                      className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1/2 translate-x-1/2 items-center 
                      justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                      {unreadMessagesCount}
                    </span>
                  )}
                  <span className="sr-only">Сообщения</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Мой профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-ads">Мои объявления</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      Избранное
                    </Link>
                  </DropdownMenuItem>
                  {/* Вот пункт «Сообщения» с бейджем */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/chat"
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Сообщения
                      </div>
                      {unreadMessagesCount > 0 && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => router.push('/login')} variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}