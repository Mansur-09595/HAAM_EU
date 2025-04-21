'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adSchema, AdFormData } from '@/lib/validation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewAdPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
  })

  const onSubmit = async (data: AdFormData) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('price', data.price.toString())
    if (data.image?.[0]) formData.append('image', data.image[0])

    const res = await fetch('/api/ads', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      reset()
      router.push('/')
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Добавить объявление</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          {...register('image')}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) setPreview(URL.createObjectURL(file))
          }}
          className="w-full"
        />
        {preview && <img src={preview} className="w-full rounded" />}

        <input
          type="text"
          placeholder="Название"
          {...register('title')}
          className="w-full p-2 border rounded"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <textarea
          placeholder="Описание"
          {...register('description')}
          className="w-full p-2 border rounded"
        />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}

        <input
          type="number"
          placeholder="Цена"
          {...register('price')}
          className="w-full p-2 border rounded"
        />
        {errors.price && <p className="text-red-500">{errors.price.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting ? 'Добавляем...' : 'Добавить'}
        </button>
      </form>
    </main>
  )
}
