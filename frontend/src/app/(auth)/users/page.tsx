'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchUsers } from '@/store/slices/auth/users/usersAction'

export default function UsersPage() {
    const dispatch = useAppDispatch()
    // Передаём именно функцию-селектор в useAppSelector
    const users = useAppSelector(state => state.users.list)
    const loading = useAppSelector(state => state.users.loading)
    const error = useAppSelector(state => state.users.error)
    const currentUser = useAppSelector(state => state.auth.user)
  
    useEffect(() => {
      dispatch(fetchUsers())
    }, [dispatch])
  
    if (!currentUser?.is_staff) return <p>Access denied 1</p>
    if (loading) return <p>Загрузка...</p>
    if (error)   return <p className="text-red-500">Ошибка: {error}</p>
  
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Пользователи</h1>
        <Link href="/users/new" className="text-blue-600 hover:underline mb-4 block">
          Создать нового пользователя
        </Link>
  
        <ul className="space-y-2">
          {users.map(u => (
            <li key={u.id} className="border p-3 rounded hover:bg-gray-50">
              <Link href={`/users/${u.id}`} className="text-lg font-medium">
                {u.username}
              </Link>
              <p className="text-sm text-gray-600">{u.email}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }