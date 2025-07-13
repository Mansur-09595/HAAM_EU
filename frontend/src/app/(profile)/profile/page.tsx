"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useAppSelector, useAppDispatch } from "@/store/store"
import PrivateRoute from "@/components/PrivateRoute"
import { updateUser } from "@/store/slices/auth/users/usersAction"
import { useToast } from "@/hooks/use-toast"

import { Bell, Camera, CreditCard, Heart, LogOut, MessageSquare, Package, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Тип формы
interface ProfileForm {
  email: string
  username: string
  bio?: string
  phone?: string
  current_password?: string
  new_password?: string
  confirm_password?: string
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user } = useAppSelector(s => s.auth)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ProfileForm>({
    defaultValues: {
      email: user?.email || "",
      username: user?.username || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
    },
    shouldUnregister: true, 
  })

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        username: user.username,
        bio: user.bio || "",
        phone: user.phone || "",
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
      })
    }
  }, [user, reset])

  const onSubmitPersonal = async (data: ProfileForm) => {
    if (!user) return
    setIsLoading(true)
    try {
      await dispatch(updateUser({
        id: user.id,
        email: data.email,
        username: data.username,
        bio: data.bio,
        phone: data.phone
      })).unwrap()
      toast({ title: "Профиль обновлён", description: "Данные сохранены" })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка"
      toast({ title: "Ошибка", description: errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitSecurity = () => {
    // TODO: смена пароля
    toast({ title: "Пароль обновлён", description: "Используйте новый пароль при следующем входе" })
  }

  const onSubmitNotifications = () => {
    // TODO: отправка настроек уведомлений
    toast({ title: "Настройки сохранены" })
  }

  return (
    <PrivateRoute>
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt="Аватар" />
                    <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <Button variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold">{user?.username}</h2>
                {/* <p className="text-sm text-muted-foreground">
                  На Авито с {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : '...' }
                </p> */}
              </div>

              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/profile"><User className="mr-2 h-4 w-4" />Мой профиль</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/my-ads"><Package className="mr-2 h-4 w-4" />Мои объявления</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/favorites"><Heart className="mr-2 h-4 w-4" />Избранное</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/chat"><MessageSquare className="mr-2 h-4 w-4" />Сообщения</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/notifications"><Bell className="mr-2 h-4 w-4" />Уведомления</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start line-through text-gray-500" asChild>
                  <Link href="#"><CreditCard className="mr-2 h-4 w-4 line-through text-gray-500" />Платежи</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start line-through text-gray-500" asChild>
                  <Link href="#"><Settings className="mr-2 h-4 w-4" />Настройки</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />Выйти
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="mb-4 whitespace-nowrap flex gap-2 px-1 sm:justify-center">
              <TabsTrigger value="personal">Личные данные</TabsTrigger>
              <TabsTrigger value="security">Безопасность</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            </TabsList>

            {/* Personal */}
            <TabsContent value="personal">
              <form onSubmit={handleSubmit(onSubmitPersonal)} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Личные данные</CardTitle>
                    <CardDescription>Обновите контактную информацию</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {/* fields */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email", { required: "Обязательное поле" })} />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" {...register("username", { required: "Обязательное поле" })} />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">О себе</Label>
                        <Textarea id="bio" rows={3} {...register("bio")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input id="phone" type="tel" {...register("phone")} />
                      </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Сохраняем…" : "Сохранить"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Безопасность</CardTitle>
                  <CardDescription>Смените пароль</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="security-form" onSubmit={handleSubmit(onSubmitSecurity)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Текущий пароль</Label>
                      <Input id="current_password" type="password" autoComplete="current-password" {...register("current_password", { required: "Обязательное поле" })} />
                      {errors.current_password && <p className="text-red-500 text-sm">{errors.current_password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">Новый пароль</Label>
                      <Input id="new_password" type="password" autoComplete="new-password" {...register("new_password", { required: "Обязательное поле" })} />
                      {errors.new_password && <p className="text-red-500 text-sm">{errors.new_password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Подтвердите пароль</Label>
                      <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password", { required: "Обязательное поле", validate: v => v === watch("new_password") || "Пароли не совпадают" })} />
                      {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>}
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" form="security-form">Сменить пароль</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Уведомления</CardTitle>
                  <CardDescription>Ваши предпочтения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_notifications">Email уведомления</Label>
                    <Input id="email_notifications" type="checkbox" {...register("email_notifications")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push_notifications">Push уведомления</Label>
                    <Input id="push_notifications" type="checkbox" {...register("push_notifications")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms_notifications">SMS уведомления</Label>
                    <Input id="sms_notifications" type="checkbox" {...register("sms_notifications")} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSubmit(onSubmitNotifications)}>Сохранить</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PrivateRoute>
  )
}
