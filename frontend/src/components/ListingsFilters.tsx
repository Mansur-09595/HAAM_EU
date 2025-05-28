// components/ListingFilters.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchCategories } from '@/store/slices/categories/categoriesAction' // Правильный импорт
import { fetchBelgianCities } from '@/store/slices/cities/citiesAction'      // <-- добавили импорт
import { setSearchTerm, setMinPrice, setMaxPrice } from '@/store/slices/ads/adsSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
} from '@/components/ui/command'
import { Check, ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import type { Ads, Category } from '@/types/IAds'

interface ListingFiltersProps {
  onFilter: (ads: Ads[]) => void
}

export default function ListingFilters({ onFilter }: ListingFiltersProps) {
  const dispatch = useAppDispatch()

  // Данные из Redux: объявления (загружаются в родительской странице) и категории
  const { items: ads, searchTerm, minPrice, maxPrice } = useAppSelector(s => s.ads)
  const { items: categories } = useAppSelector(s => s.categories)

  const { items: cities, loading: citiesLoading } = useAppSelector(s => s.cities)   // <-- читаем из state.cities


  // Локальные UI-стейты
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [openCat, setOpenCat] = useState(false)
  const [openCity, setOpenCity] = useState(false)

  // При монтировании грузим только категории
  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchBelgianCities()) 
  }, [dispatch])

  // Собираем список уникальных городов из загруженных ads
  // const cities = useMemo(() => {
  //   const setCity = new Set<string>()
  //   ads.forEach(ad => setCity.add(ad.location))
  //   return Array.from(setCity)
  // }, [ads])

  // Флаги активности
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const isSearch = normalizedSearch !== ''
  const isPrice = minPrice > 0 || maxPrice < 1_000_000
  const isCategory = selectedCategory !== ''
  const isCity = selectedCity !== ''

  // Применяем фильтры
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      if (isSearch && !ad.title.toLowerCase().includes(normalizedSearch)) return false
      if (isPrice) {
        const price = Number(ad.price)
        if (price < minPrice || price > maxPrice) return false
      }
      if (isCategory && ad.category_detail.slug !== selectedCategory) return false
      if (isCity && ad.location !== selectedCity) return false
      return true
    })
  }, [ads, normalizedSearch, isSearch, isPrice, minPrice, maxPrice, isCategory, selectedCategory, isCity, selectedCity])

  // Вызываем коллбэк при изменении фильтрованного списка
  useEffect(() => {
    onFilter(filteredAds)
  }, [filteredAds, onFilter])

  return (
    <div className="bg-card rounded-lg border p-4 space-y-6">
      <h2 className="font-semibold text-lg">Фильтры</h2>

      <Accordion type="multiple" defaultValue={[
        'search', 'category', 'price', 'location', 'options'
      ]}>
        {/* Поиск */}
        <AccordionItem value="search">
          <AccordionTrigger>Поиск</AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder="По названию"
              value={searchTerm}
              onChange={e => dispatch(setSearchTerm(e.target.value))}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Категория */}
        <AccordionItem value="category">
          <AccordionTrigger>Категория</AccordionTrigger>
          <AccordionContent>
            <Popover open={openCat} onOpenChange={setOpenCat}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openCat} className="w-full justify-between">
                  {selectedCategory
                    ? categories.find(c => c.slug === selectedCategory)?.name
                    : 'Все категории'}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Поиск категории..." />
                  <CommandEmpty>Не найдено</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {categories.map((c: Category) => (
                        <CommandItem
                          key={c.id}
                          value={c.slug}
                          onSelect={val => {
                            setSelectedCategory(val === selectedCategory ? '' : val)
                            setOpenCat(false)
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${selectedCategory === c.slug ? 'opacity-100' : 'opacity-0'}`} />
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </AccordionContent>
        </AccordionItem>

        {/* Цена */}
        <AccordionItem value="price">
          <AccordionTrigger>Цена</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div>
                  <Label htmlFor="min">От</Label>
                  <Input
                    id="min"
                    type="number"
                    value={minPrice}
                    onChange={e => dispatch(setMinPrice(Number(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <Label htmlFor="max">До</Label>
                  <Input
                    id="max"
                    type="number"
                    value={maxPrice}
                    onChange={e => dispatch(setMaxPrice(Number(e.target.value) || 1_000_000))}
                  />
                </div>
              </div>
              <Slider
                value={[minPrice, maxPrice]}
                max={1_000_000}
                step={1_000}
                onValueChange={([min, max]) => {
                  dispatch(setMinPrice(min))
                  dispatch(setMaxPrice(max))
                }}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Город */}
        <AccordionItem value="location">
          <AccordionTrigger>Город</AccordionTrigger>
          <AccordionContent>
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openCity} className="w-full justify-between">
                  {selectedCity || 'Все города'}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {citiesLoading
                        ? <p>Загрузка городов…</p>
                        : (
                          <Command>
                            <CommandInput placeholder="Поиск города..." />
                            <CommandEmpty>Не найдено</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                <CommandItem
                                  value=""
                                  onSelect={() => {
                                    setSelectedCity('')
                                    setOpenCity(false)
                                  }}
                                >
                                  Все города
                                </CommandItem>
                                {cities.map((city, i) => (
                                  <CommandItem
                                    key={`${city.name}-${city.admin}-${i}`}
                                    value={city.name}
                                    onSelect={val => {
                                      setSelectedCity(val === selectedCity ? '' : val)
                                      setOpenCity(false)
                                    }}
                                  >
                                    <Check className={`mr-2 h-4 w-4 ${selectedCity === city.name ? 'opacity-100' : 'opacity-0'}`} />
                                    {city.name} ({city.admin})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        )
                      }
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </AccordionContent>
        </AccordionItem>

        {/* Доп. опции */}
        <AccordionItem value="options">
          <AccordionTrigger>Дополнительно</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="only-photo" />
                <Label htmlFor="only-photo">Только с фото</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="only-delivery" />
                <Label htmlFor="only-delivery">С доставкой</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="flex-1" onClick={() => onFilter(filteredAds)}>
          Применить
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setSelectedCategory('')
            setSelectedCity('')
            dispatch(setSearchTerm(''))
            dispatch(setMinPrice(0))
            dispatch(setMaxPrice(1_000_000))
          }}
        >
          Сбросить
        </Button>
      </div>
    </div>
  )
}
