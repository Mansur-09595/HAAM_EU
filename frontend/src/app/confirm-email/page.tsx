'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { confirmEmail } from '@/store/slices/auth/authAction'
import { resetConfirmState } from '@/store/slices/auth/authSlice'
import { Button } from '@/components/ui/button'

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { confirmLoading, confirmError, confirmSuccess } = useAppSelector(s => s.auth)

  useEffect(() => {
    if (!token) return
    dispatch(confirmEmail({ token }))
    // при unmount сбросим состояние, если пользователь вернётся сюда снова
    return () => { dispatch(resetConfirmState()) }
  }, [token, dispatch])

  // Если токена нет, сразу редиректим или показываем ошибку
  if (!token) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500">Неверная ссылка для подтверждения</p>
        <Button onClick={() => router.push('/login')}>На главную</Button>
      </div>
    )
  }

  if (confirmLoading) {
    return <p className="text-center py-6">Подтверждаем почту…</p>
  }

  if (confirmSuccess) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <p className="text-green-600">Почта успешно подтверждена!</p>
        <Button onClick={() => router.push('/login')}>Войти</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 text-center">
      <p className="text-red-500">{confirmError ?? 'Ошибка подтверждения почты'}</p>
      <Button onClick={() => router.push('/login')}>На страницу входа</Button>
    </div>
  )
}
