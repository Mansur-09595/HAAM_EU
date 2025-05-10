// src/app/providers.tsx
'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor, useAppDispatch } from '@/store/store'
import { checkAuth, refreshToken, } from '@/store/slices/auth/authAction'
import { logout } from '@/store/slices/auth/authSlice'
import { jwtDecode } from 'jwt-decode'

type JwtPayload = { exp: number }

function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const access = localStorage.getItem('accessToken')
    if (access) {
      // Проверка профиля
      dispatch(checkAuth()).unwrap().catch(() => {
        // здесь можно делать редирект на логин
      })
      // Настраиваем авто-рефреш
      const { exp } = jwtDecode<JwtPayload>(access)
      const expiresInMs = exp * 1000 - Date.now()
      const timeout = Math.max(expiresInMs - 30_000, 0)
      setTimeout(() => {
        dispatch(refreshToken())
          .unwrap()
          .catch(() => {
            dispatch(logout())
          })
      }, timeout)
    }
  }, [dispatch])

  return null
}
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthInitializer />
        {children}
      </PersistGate>
    </Provider>
  )
}
