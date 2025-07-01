'use client'

import React, { useState } from "react"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from '@/store/store'
import { loginUser } from '@/store/slices/auth/authAction'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const { error } = useAppSelector(state => state.auth)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const result = await dispatch(loginUser(data)).unwrap()
      if (result) router.push('/')
    } catch {
      // Ошибка уже отображена через Redux error
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Вход</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form autoComplete="on" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          id="email"
          type="email"
          placeholder="Email"
          autoComplete="username"
          {...register('email')}
          required
          className="w-full p-2 border rounded"
        />
        <input
          id="password"
          type="password"
          placeholder="Пароль"
          autoComplete="current-password"
          {...register('password')}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Входим...
            </>
          ) : (
            'Войти'
          )}
        </button>
        {!loading && (
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
