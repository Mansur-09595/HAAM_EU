'use client'

import { useAppSelector } from '@/store/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector(state => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  return user ? <>{children}</> : null
}
