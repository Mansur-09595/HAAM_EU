// src/app/(auth)/users/new/page.tsx
'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store/store'
import { createUser } from '@/store/slices/auth/users/usersAction'
import { loginUser } from '@/store/slices/auth/authAction'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormValues {
  username: string
  email: string
  password: string
  password2: string
  phone?: string
  avatar?: FileList
  bio?: string
}

export default function NewUserPage() {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // 1) Сначала создаём пользователя
    try {
      const formData = new FormData()
      formData.append('username', data.username)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('password2', data.password2)
      if (data.avatar?.[0]) formData.append('avatar', data.avatar[0])
      formData.append('phone', data.phone || '')
      formData.append('bio', data.bio || '')

      const user = await dispatch(createUser(formData)).unwrap()

      toast({ title: 'Регистрация прошла успешно', description: user.username })

      // 2) Потом сразу логинимся
      await dispatch(loginUser({ email: data.email, password: data.password })).unwrap()

      // 3) Редиректим на защищённую страницу, например в профиль
      router.push(`/confirm-mail-sent}`)
    } catch (err: unknown) {
      // Если ошибка из createUser или loginUser, то она уже обработана в этих эк
      // если ошибка из createUser или loginUser
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const password = watch('password')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
      className="max-w-md mx-auto p-6 space-y-4 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold">Регистрация</h2>

      <div>
        <Label htmlFor="username">Имя пользователя</Label>
        <Input
          id="username"
          {...register('username', { required: 'Обязательное поле' })}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email', { required: 'Обязательное поле' })}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          {...register('password', {
            required: 'Обязательное поле',
            minLength: { value: 8, message: 'Минимум 8 символов' },
          })}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="password2">Подтверждение пароля</Label>
        <Input
          id="password2"
          type="password"
          {...register('password2', {
            required: 'Подтвердите пароль',
            validate: (v) => v === password || 'Пароли не совпадают',
          })}
        />
        {errors.password2 && <p className="text-red-500 text-sm">{errors.password2.message}</p>}
      </div>

      <div>
        <Label htmlFor="avatar">Аватар (файл, необязательно)</Label>
        <Input id="avatar" type="file" accept="image/*" {...register('avatar')} />
      </div>

      <div>
        <Label htmlFor="phone">Телефон (необязательно)</Label>
        <Input id="phone" {...register('phone')} />
      </div>

      <div>
        <Label htmlFor="bio">О себе (необязательно)</Label>
        <Input id="bio" {...register('bio')} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Сохраняем…' : 'Зарегистрироваться'}
      </Button>
    </form>
  )
}
