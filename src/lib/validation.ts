import { z } from 'zod'

export const adSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа'),
  description: z.string().min(10, 'Минимум 10 символов'),
  price: z.number().positive('Цена должна быть положительной'),
  currency: z.string().min(1, 'Укажите валюту'),
  category: z.string().min(1, 'Выберите категорию'),
  location: z.string().min(1, 'Укажите локацию'),
  images: z
    .any()
    .refine(
      (files) => !files || files.length <= 10,
      'Максимум 10 изображений'
    )
    .optional(),
})

export type AdFormData = z.infer<typeof adSchema>
