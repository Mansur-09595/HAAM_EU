"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { adSchema, AdFormData } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { addAd } from "@/store/slices/ads/adsAction"
import { Camera, X } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateAdPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const categories = useAppSelector((state) => state.categories.items)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagesPreview, setImagesPreview] = useState<string[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
  
    const fileArray = Array.from(files).slice(0, 10)
    setSelectedFiles((prev) => [...prev, ...fileArray].slice(0, 10))
  
    const previews = fileArray.map((file) => URL.createObjectURL(file))
    setImagesPreview((prev) => [...prev, ...previews].slice(0, 10))
  }
  

  const handleRemoveImage = (srcToRemove: string) => {
    setImagesPreview((prev) => {
      URL.revokeObjectURL(srcToRemove)
      return prev.filter((src) => src !== srcToRemove)
    })
  }

  const onSubmit = async (data: AdFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('price', data.price.toString())
      formData.append('currency', data.currency)
      formData.append('category', data.category)
      formData.append('location', data.location)
  
      selectedFiles.forEach((file) => {
        formData.append('images', file)
      })
  
      const result = await dispatch(addAd(formData)).unwrap()
  
      toast({ title: 'Объявление опубликовано' })
      
      // ⏩ Редирект на страницу нового объявления
      if (result?.slug) {
        router.push(`/ad/${result.slug}`)
      } else {
        router.push('/listings')
      }
  
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Создать объявление</CardTitle>
          <CardDescription>Заполните форму, чтобы опубликовать объявление</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{String(errors.title.message)}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" rows={5} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-red-500">{String(errors.description.message)}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Цена</Label>
                <Input id="price" type="number" {...register("price", { valueAsNumber: true })} />
                {errors.price && (
                  <p className="text-sm text-red-500">{String(errors.price.message)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="currency">Валюта</Label>
                <Input id="currency" placeholder="RUB" {...register("currency")} />
                {errors.currency && (
                  <p className="text-sm text-red-500">{String(errors.currency.message)}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Категория</Label>
              <Select onValueChange={(val) => setValue("category", val)} defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) && categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{String(errors.category.message)}</p>
              )}
            </div>

            <div>
              <Label>Локация</Label>
              <Input placeholder="Например: Москва" {...register("location")} />
              {errors.location && (
                <p className="text-sm text-red-500">{String(errors.location.message)}</p>
              )}
            </div>

            <div>
              <Label>Фотографии</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={imagesPreview.length >= 10}
              />
              <p className="text-xs text-muted-foreground">
                Можно выбрать до 10 изображений. Первое изображение станет обложкой.
              </p>
              {errors.images && (
                <p className="text-sm text-red-500">{String(errors.images.message)}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {imagesPreview.map((src) => (
                <div key={src} className="relative aspect-square rounded-md overflow-hidden border">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveImage(src)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

                {imagesPreview.length < 10 && (
                  <div className="flex flex-col items-center justify-center aspect-square border rounded-md border-dashed text-muted-foreground">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs text-center">Выберите фото</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Публикация..." : "Опубликовать"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
