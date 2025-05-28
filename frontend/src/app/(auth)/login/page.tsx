'use client'

import Link from "next/link"
import { useAppDispatch, useAppSelector } from '@/store/store'
import { loginUser } from '@/store/slices/auth/authAction'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const { error, loading } = useAppSelector(state => state.auth)
  const { register, handleSubmit } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap()
      if (result) router.push('/')
    } catch {
      // Ошибка уже отобразится через Redux error
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Вход</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          {...register('email')}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Пароль"
          {...register('password')}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
        {loading ? (
          <div className="bg-green-600 text-white px-4 py-2 rounded w-full text-center opacity-50 cursor-not-allowed">
            Регистрация...
          </div>
          ) : (
          <Link
            href="/users/new"
            className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
          >
            Зарегистрироваться
          </Link>
        )}
      </form>
    </main>
  )
}
