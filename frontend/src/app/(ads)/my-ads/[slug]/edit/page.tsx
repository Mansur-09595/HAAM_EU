// src/app/(ads)/my-ads/[slug]/edit/page.tsx
"use client";

import imageCompression from 'browser-image-compression'
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adSchema, type AdFormData } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/store";

import { fetchAdBySlug } from "@/store/slices/ads/adsAction";
import { editAd } from "@/store/slices/ads/myAdsAction/myAdsAction";
import {
  addListingImage,
  deleteListingImage,
  updateListingImage,
} from "@/store/slices/ads/myAdsImgAction/myAdsImgAction";

import { Camera, X, Loader2, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchBelgianCities } from "@/store/slices/cities/citiesAction";
import { fetchCategories } from "@/store/slices/categories/categoriesAction";

export default function EditListingPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  // Получаем slug из URL (App Router)
  const params = useParams();
  const slug = params.slug as string;

  // ───────────────────────────────────────────────────────────────────────────
  // Селекторы из Redux
  // ───────────────────────────────────────────────────────────────────────────
  const {
    selectedAd,
    loading: loadingAd,
    error: loadError,
  } = useAppSelector((state) => state.ads);

  const {
    items: categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useAppSelector((state) => state.categories);

  const {
    items: cities,
    loading: citiesLoading,
    error: citiesError,
  } = useAppSelector((state) => state.cities);

  // ───────────────────────────────────────────────────────────────────────────
  // React Hook Form
  // ───────────────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      currency: "RUB",
      category: "",
      location: "",
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Локальный state для работы с изображениями
  // ───────────────────────────────────────────────────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openCity, setOpenCity] = useState(false);
  const selectedCity = watch("location");
  const descriptionLength = watch("description")?.length || 0;

  // ───────────────────────────────────────────────────────────────────────────
  // 1) Загрузить категории и города при монтировании
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBelgianCities());
  }, [dispatch]);

  // ───────────────────────────────────────────────────────────────────────────
  // 2) Загрузить объявление по slug, когда slug доступен
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (slug) {
      dispatch(fetchAdBySlug(slug));
    }
  }, [dispatch, slug]);

  // ───────────────────────────────────────────────────────────────────────────
  // 3) Когда selectedAd придёт из Redux, заполняем форму и превью
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedAd) return;

    setValue("title", selectedAd.title);
    setValue("description", selectedAd.description);
    setValue("price", Number(selectedAd.price));
    setValue("currency", selectedAd.currency);
    setValue("category", String(selectedAd.category));
    setValue("location", selectedAd.location);

    // Превью существующих картинок (URL из selectedAd.images)
    const existingUrls = Array.isArray(selectedAd.images)
      ? selectedAd.images.map((img) => img.image)
      : [];
    setImagesPreview(existingUrls.slice(0, 10));

    // selectedFiles остаётся пустым
  }, [selectedAd, setValue]);

  // ───────────────────────────────────────────────────────────────────────────
  // 4) Очистка objectURL при размонтировании или изменении preview
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      imagesPreview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagesPreview]);

  // ───────────────────────────────────────────────────────────────────────────
  // Выбор новых файлов (до 10 штук), которые пользователь хочет добавить
  // ───────────────────────────────────────────────────────────────────────────
  const MAX_FILES = 10
  const MAX_FINAL_MB = 1       // конечный размер ≤1 МБ
  const MAX_DIMENSION = 1920   // максимальная ширина/высота
  
  // … внутри компонента, вместо существующего handleImageChange:
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAd) return
  
    const files = e.target.files
    if (!files) return
  
    // Берём не более оставшихся слотов
    const incoming = Array.from(files).slice(0, MAX_FILES - selectedFiles.length)
    const compressedFiles: File[] = []
    const newPreviews: string[] = []
  
    for (const file of incoming) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: MAX_FINAL_MB,
          maxWidthOrHeight: MAX_DIMENSION,
          useWebWorker: true,
        })
        compressedFiles.push(compressed)
        newPreviews.push(URL.createObjectURL(compressed))
      } catch {
        // если компрессия упала — всё равно добавим оригинал
        compressedFiles.push(file)
        newPreviews.push(URL.createObjectURL(file))
      }
    }
  
    setSelectedFiles(prev => [...prev, ...compressedFiles].slice(0, MAX_FILES))
    setImagesPreview(prev => [...prev, ...newPreviews].slice(0, MAX_FILES))
    e.target.value = ''
  }
  // ───────────────────────────────────────────────────────────────────────────
  // Удаление картинки (из сервера, если это был URL из selectedAd.images,
  // или просто удаление локального превью, если это новая картинка)
  // ───────────────────────────────────────────────────────────────────────────
  const handleRemoveImage = (index: number, src: string) => {
    // Проверяем, есть ли этот src среди существующих картинок сервера
    const existingImgObj = selectedAd?.images.find((img) => img.image === src);

    if (existingImgObj) {
      // Если src соответствует картинке сервера, удаляем через thunk
      dispatch(deleteListingImage({ imageId: existingImgObj.id }));
    }

    // В любом случае удаляем из локального preview
    URL.revokeObjectURL(src);
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Замена существующего изображения на новое (PATCH /api/listings/images/{id}/)
  // ───────────────────────────────────────────────────────────────────────────
  const handleReplaceExistingImage = (
    imageId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Отправляем PATCH для этого imageId
    dispatch(updateListingImage({ id: imageId, imageFile: file }));
    // Локальных превью не добавляем: после успешного ответа selectedAd.images обновится,
    // а вместе с ним обновится imagesPreview в useEffect выше.
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Установка флага is_primary у существующей картинки (PATCH)
  // ───────────────────────────────────────────────────────────────────────────
  const handleSetPrimary = (imageId: number) => {
    dispatch(updateListingImage({ id: imageId, is_primary: true }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Подтверждение отмены, если форма "грязная"
  // ───────────────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (isDirty && !window.confirm("Есть несохранённые изменения. Уйти?")) return;
    router.back();
  };

  // ───────────────────────────────────────────────────────────────────────────
  // onSubmit: 
  // 1) PATCH "текстовых" полей через editAd,
  // 2) POST новых файлов через addListingImage
  // ───────────────────────────────────────────────────────────────────────────
  const onSubmit = async (data: AdFormData) => {
    if (!selectedAd) {
      toast({
        title: "Ошибка",
        description: "Объявление ещё не загружено",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // ——— 1) PATCH текстовых полей ———
      const textForm = new FormData();
      textForm.append("title", data.title);
      textForm.append("description", data.description);
      textForm.append("price", data.price.toString());
      textForm.append("currency", data.currency);
      textForm.append("category", data.category);
      textForm.append("location", data.location);

      await dispatch(editAd({ slug, updatedData: textForm })).unwrap();

      // ——— 2) Загрузка новых изображений (если есть) ———
      if (selectedFiles.length > 0) {
        console.log("Добавляем картинки для объявления ID:", selectedAd.id);

        await Promise.all(
          selectedFiles.map((file) => {
            const fd = new FormData();
            fd.append("listing", String(selectedAd.id)); // ключ "listing" обязательно должен быть числовой ID
            fd.append("image", file, file.name);
            // Логируем содержимое FormData перед отправкой
            for (const [key, val] of fd.entries() as Iterable<[string, FormDataEntryValue]>) {
              console.log("[addListingImage] FormData:", key, val);
            }
            return dispatch(addListingImage({ formData: fd })).unwrap();
          })
        );
      }

      toast({ title: "Объявление обновлено" });
      router.push(`/ad/${slug}`);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Рендерим Loading / Error / Not Found
  // ───────────────────────────────────────────────────────────────────────────
  if (loadingAd || loadingCategories || citiesLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg border p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || categoriesError || citiesError) {
    const message = loadError || categoriesError || citiesError;
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-600">Ошибка: {message}</p>
          <Button onClick={() => router.back()}>Отмена</Button>
        </div>
      </div>
    );
  }

  if (!selectedAd) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto text-center">
          <p>Объявление не найдено.</p>
          <Button onClick={() => router.back()}>Отмена</Button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Основной JSX формы редактирования объявления
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Редактировать объявление</CardTitle>
          <CardDescription>Внесите изменения в ваше объявление</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <CardContent className="space-y-6">
            {/* ════════════════════════════════════════════════════ */}
            {/* Заголовок */}
            {/* ════════════════════════════════════════════════════ */}
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* Описание */}
            {/* ════════════════════════════════════════════════════ */}
            <div>
              <div className="flex justify-between">
                <Label htmlFor="description">Описание</Label>
                <span className="text-xs">{descriptionLength}/500</span>
              </div>
              <Textarea
                id="description"
                rows={5}
                {...register("description")}
                maxLength={500}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* Цена и Валюта */}
            {/* ════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Цена</Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>
              <div>
                <Label>Валюта</Label>
                <Select
                  onValueChange={(val) => setValue("currency", val)}
                  defaultValue={watch("currency")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="RUB">Russian Ruble (₽)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* Категория */}
            {/* ════════════════════════════════════════════════════ */}
            <div>
              <Label>Категория</Label>
              <Select
                onValueChange={(val) => setValue("category", val)}
                defaultValue={watch("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* Локация */}
            {/* ════════════════════════════════════════════════════ */}
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
                    {selectedCity ||
                      (citiesLoading ? "Загрузка…" : "Выберите город")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto">
                  {citiesLoading ? (
                    <p className="p-4 text-center text-sm">
                      Загрузка городов…
                    </p>
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
                              setValue("location", val);
                              setOpenCity(false);
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* Фотографии (CRUD) */}
            {/* ════════════════════════════════════════════════════ */}
            <div>
              <Label>Фотографии</Label>

              {/* 1) Загрузка новых файлов */}
              <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                <Label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center py-4">
                    <Camera className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">
                      Перетащите файлы сюда или нажмите для загрузки
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      До 10 фото • {imagesPreview.length}/10 загружено
                    </p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={!selectedAd || imagesPreview.length >= 10}
                  />
                </Label>
              </div>
              {errors.images && (
                <p className="text-sm text-red-500">
                  {String(errors.images.message)}
                </p>
              )}

              {/* 2) Сетка превью всех картинок */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {imagesPreview.map((src, index) => {
                  const existingImgObj = selectedAd.images.find(
                    (img) => img.image === src
                  );
                  return (
                    <div
                      key={src}
                      className="relative aspect-square rounded-md overflow-hidden border group"
                    >
                      <img
                        src={src || "/placeholder.svg"}
                        alt={`preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Если это изображение с сервера, показываем кнопки «Заменить» и «Сделать главным» */}
                      {existingImgObj && (
                        <div className="absolute top-1 left-1 z-10 flex space-x-1">
                          {/* Заменить файл */}
                          <label className="cursor-pointer bg-white rounded-full p-1 shadow-md">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleReplaceExistingImage(existingImgObj.id, e)
                              }
                            />
                            <Camera className="h-4 w-4 text-gray-700" />
                          </label>

                          {/* Сделать главным (если ещё не главный) */}
                          {!existingImgObj.is_primary && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSetPrimary(existingImgObj.id)
                              }
                              className="bg-white rounded-full p-1 shadow-md"
                            >
                              ★
                            </button>
                          )}
                        </div>
                      )}

                      {/* Кнопка «Удалить» (крестик) */}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white p-0"
                        onClick={() => handleRemoveImage(index, src)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  );
                })}

                {/* 3) Пустая ячейка «Добавить ещё» */}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
