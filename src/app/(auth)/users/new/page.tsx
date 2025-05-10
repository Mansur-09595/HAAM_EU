'use client'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store/store'
import { createUser } from '@/store/slices/auth/users/usersAction'

export default function NewUserPage() {
  const { register, handleSubmit } = useForm<{ username:string; email:string; password:string }>()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const onSubmit = async (data: { username: string; email: string; password: string }) => {
    const result = await dispatch(createUser({ 
      ...data, 
      phone: '', 
      avatar: '', 
      bio: '', 
      is_staff: false 
    })).unwrap()
    router.push(`/users/${result.id}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} placeholder="Username" />
      <input {...register('email')} placeholder="Email" />
      <input {...register('password')} type="password" placeholder="Password" />
      <button type="submit">Создать</button>
    </form>
  )
}