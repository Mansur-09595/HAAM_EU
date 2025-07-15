'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchCategories } from '@/store/slices/categories/categoriesAction'
import { lucideIcons } from '@/lib/lucideIcons'

export default function CategoryList() {
  const dispatch = useAppDispatch()
  const { items: categories, loading, error } = useAppSelector(state => state.categories)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  if (loading) {
    return <p>Загрузка категорий…</p>
  }

  if (error) {
    return <p className="text-red-600">Ошибка: {error}</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.isArray(categories) && categories.map(category => {
        const iconName = (category.icon ?? '').split('/').pop()?.toLowerCase() || ''
        const Icon = lucideIcons[iconName]
        return (
          <Link
            key={category.id}
            href={`/categories/category/${category.slug}`}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-3">
              {Icon ? <Icon className="h-6 w-6 text-blue-600" /> : <div className="h-6 w-6">❓</div>}
            </div>
            <span className="text-center font-medium">{category.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
