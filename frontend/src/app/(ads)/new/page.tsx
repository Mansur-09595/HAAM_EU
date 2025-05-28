"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { adSchema, type AdFormData } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { addAd } from "@/store/slices/ads/adsAction"
import { Camera, X, Loader2, ChevronDown } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchBelgianCities } from '@/store/slices/cities/citiesAction'

const CURRENCIES = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "RUB", label: "Russian Ruble (₽)" },
  { value: "GBP", label: "British Pound (£)" },
]

export default function CreateAdPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const categories = useAppSelector(state => state.categories.items)
  const { items: cities, loading: citiesLoading } = useAppSelector(state => state.cities)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      currency: 'RUB',
      location: '',
    },
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagesPreview, setImagesPreview] = useState<string[]>([])
  const descriptionLength = watch('description')?.length || 0
  const [openCity, setOpenCity] = useState(false)
  const selectedCity = watch('location')

  // load categories & cities
  useEffect(() => {
    dispatch(fetchBelgianCities())
  }, [dispatch])

  // cleanup previews
  useEffect(() => {
    return () => imagesPreview.forEach(url => URL.revokeObjectURL(url))
  }, [imagesPreview])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const fileArray = Array.from(files).slice(0, 10 - selectedFiles.length)
    setSelectedFiles(prev => [...prev, ...fileArray].slice(0, 10))
    const previews = fileArray.map(file => URL.createObjectURL(file))
    setImagesPreview(prev => [...prev, ...previews].slice(0, 10))
    e.target.value = ''
  }

  const handleRemoveImage = (index: number, src: string) => {
    URL.revokeObjectURL(src)
    setImagesPreview(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('Есть несохранённые изменения. Уйти?')) return
    router.back()
  }

  const onSubmit = async (data: AdFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("price", data.price.toString())
      formData.append("currency", data.currency)
      formData.append("category", data.category)
      formData.append("location", data.location)

      selectedFiles.forEach((file) => {
        formData.append("images", file)
      })

      const result = await dispatch(addAd(formData)).unwrap()

      toast({ title: "Объявление опубликовано" })

      // Редирект на страницу нового объявления
      if (result?.slug) {
        router.push(`/ad/${result.slug}`)
      } else {
        router.push("/listings")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: String(error),
        variant: "destructive",
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
          <CardDescription>Заполните форму</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <CardContent className="space-y-6">
            {/* Заголовок */}
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            {/* Описание */}
            <div>
              <div className="flex justify-between">
                <Label htmlFor="description">Описание</Label>
                <span className="text-xs">{descriptionLength}/500</span>
              </div>
              <Textarea id="description" rows={5} {...register('description')} maxLength={500} />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            {/* Цена и Валюта */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Цена</Label>
                <Input id="price" type="number" {...register('price', { valueAsNumber: true })} />
                {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
              </div>
              <div>
                <Label>Валюта</Label>
                <Select onValueChange={val => setValue('currency', val)} defaultValue="RUB">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Категория */}
            <div>
              <Label>Категория</Label>
              <Select onValueChange={val => setValue('category', val)} defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>

            {/* Локация */}
            <div>
              <Label htmlFor="location">Город</Label>
              <Popover open={openCity} onOpenChange={setOpenCity}>
                <PopoverTrigger asChild>
                  <Button
                    id="location"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCity}
                    className="w-full justify-between mt-2"
                  >
                    {selectedCity || (citiesLoading ? 'Загрузка…' : 'Выберите город')}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto">
                  {citiesLoading ? (
                    <p className="p-4 text-center text-sm">Загрузка городов…</p>
                  ) : (
                    <Command>
                      <CommandInput placeholder="Поиск города…" />
                      <CommandEmpty>Ничего не найдено.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city, idx) => (
                          <CommandItem
                            key={`${city.name}-${city.admin}-${idx}`}
                            value={city.name}
                            onSelect={(val) => {
                              setValue('location', val)
                              setOpenCity(false)
                            }}
                          >
                            {city.name} ({city.admin})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  )}
                </PopoverContent>
              </Popover>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label>Фотографии</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                <Label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center py-4">
                    <Camera className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Перетащите файлы сюда или нажмите для загрузки</p>
                    <p className="text-xs text-gray-500 mt-1">До 10 фото • {imagesPreview.length}/10 загружено</p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={imagesPreview.length >= 10}
                  />
                </Label>
              </div>
              {errors.images && <p className="text-sm text-red-500">{String(errors.images.message)}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {imagesPreview.map((src, index) => (
                  <div key={src} className="relative aspect-square rounded-md overflow-hidden border group">
                    <img
                      src={src || "/placeholder.svg"}
                      alt={`preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index, src)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикация...
                </>
              ) : (
                "Опубликовать"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
