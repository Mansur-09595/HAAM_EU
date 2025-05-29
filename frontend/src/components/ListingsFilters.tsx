'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchCategories } from '@/store/slices/categories/categoriesAction'
import { fetchBelgianCities } from '@/store/slices/cities/citiesAction'
import {
  setSearchTerm,
  setMinPrice,
  setMaxPrice,
  setCategory,
  setCity,
  clearFilters,
  setPage,
} from '@/store/slices/ads/adsSlice'
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
import type { Category } from '@/types/IAds'

export default function ListingFilters() {
  const dispatch = useAppDispatch()

  const {
    searchTerm,
    minPrice,
    maxPrice,
    category:  selectedCategory ,
    city: selectedCity,
  } = useAppSelector(state => state.ads)

  const { items: categories } = useAppSelector(state => state.categories)
  const { items: cities, loading: citiesLoading } = useAppSelector(state => state.cities)

  const [openCat, setOpenCat] = useState(false)
  const [openCity, setOpenCity] = useState(false)

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchBelgianCities())
  }, [dispatch])

  return (
    <div className="bg-card rounded-lg border p-4 space-y-6">
      <h2 className="font-semibold text-lg">Фильтры</h2>

      <Accordion type="multiple" defaultValue={[]}>  
        {/* Поиск */}
        <AccordionItem value="search">
          <AccordionTrigger>Поиск</AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder="По названию"
              value={searchTerm}
              onChange={e => {
                dispatch(setSearchTerm(e.target.value))
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Категория */}
        <AccordionItem value="category">
          <AccordionTrigger>Категория</AccordionTrigger>
          <AccordionContent>
            <Popover open={openCat} onOpenChange={setOpenCat}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCat}
                  className="w-full justify-between"
                >
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
                            dispatch(
                              setCategory(
                                val === selectedCategory ? '' : val
                              )
                            )
                            dispatch(setPage(1))
                            setOpenCat(false)
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedCategory === c.slug
                                ? 'opacity-100'
                                : 'opacity-0'
                            }`}
                          />
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
                    onChange={e => {
                      dispatch(setMinPrice(Number(e.target.value) || 0))
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="max">До</Label>
                  <Input
                    id="max"
                    type="number"
                    value={maxPrice}
                    onChange={e => {
                      dispatch(
                        setMaxPrice(Number(e.target.value) || 1_000_000)
                      )
                    }}
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
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  className="w-full justify-between"
                >
                  {selectedCity || 'Все города'}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Поиск города..." />
                  <CommandEmpty>Не найдено</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          dispatch(setCity(''))
                          dispatch(setPage(1))
                          setOpenCity(false)
                        }}
                      >
                        Все города
                      </CommandItem>
                      {citiesLoading ? (
                        <p className="p-2">Загрузка городов…</p>
                      ) : (
                        cities.map((cityObj, i) => (
                          <CommandItem
                            key={`${cityObj.name}-${cityObj.admin}-${i}`}
                            value={cityObj.name}
                            onSelect={val => {
                              dispatch(
                                setCity(
                                  val === selectedCity ? '' : val
                                )
                              )
                              dispatch(setPage(1))
                              setOpenCity(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCity === cityObj.name
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              }`}
                            />
                            {cityObj.name} ({cityObj.admin})
                          </CommandItem>
                        ))
                      )}
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
        <Button
          className="flex-1"
          onClick={() => dispatch(setPage(1))}
        >
          Применить
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            dispatch(clearFilters())
            dispatch(setPage(1))
          }}
        >
          Сбросить
        </Button>
      </div>
    </div>
  )
}