// src/app/(auth)/users/[id]/edit/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchUserById, updateUser } from '@/store/slices/auth/users/usersAction'

interface FormValues {
  username: string
  email: string
  phone?: string
  bio?: string
}

export default function EditUserPage() {
  const params = useParams()
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id
  const id = idParam ? Number(idParam) : null

  const dispatch = useAppDispatch()
  const router = useRouter()

  const user = useAppSelector(state => state.users.selected)
  const loading = useAppSelector(state => state.users.loading)
  const error = useAppSelector(state => state.users.error)
  const currentUser = useAppSelector(state => state.auth.user)


  const { register, handleSubmit, reset } = useForm<FormValues>()

  // Подгружаем профиль
  useEffect(() => {
    if (id !== null) dispatch(fetchUserById(id))
  }, [id, dispatch])

  // Когда он придёт — сбрасываем форму
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        phone: user.phone ?? '',
        bio: user.bio ?? '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: FormValues) => {
    if (id === null) return
    await dispatch(updateUser({ id, ...data })).unwrap()
    router.push(`/users/${id}`)
  }

  if (!currentUser?.is_staff) return <p>Access denied</p>
  if (loading) return <p>Загрузка…</p>
  if (error)   return <p className="text-red-500">Ошибка: {error}</p>
  if (!user)  return <p>Пользователь не найден.</p>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4 space-y-4">
      <div>
        <label className="block mb-1 font-medium">Имя пользователя</label>
        <input
          className="w-full border px-3 py-2 rounded"
          {...register('username', { required: true })}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          className="w-full border px-3 py-2 rounded"
          {...register('email', { required: true })}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Телефон</label>
        <input
          className="w-full border px-3 py-2 rounded"
          {...register('phone')}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Bio</label>
        <textarea
          className="w-full border px-3 py-2 rounded"
          rows={4}
          {...register('bio')}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Сохранить
        </button>
      </div>
    </form>
  )
}
