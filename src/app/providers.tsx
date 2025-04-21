'use client'

import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor, useAppDispatch  } from '@/store/store'
import { checkAuth } from '@/store/slices/auth/authAction'

// Этот компонент будет вызван уже после инициализации Redux Provider
function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* Теперь все хуки Redux работают корректно */}
        <AuthInitializer />
        {children}
      </PersistGate>
    </Provider>
  )
}
