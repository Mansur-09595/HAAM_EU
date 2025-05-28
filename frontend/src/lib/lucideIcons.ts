import {
    Car,
    House,
    Briefcase,
    ShoppingBag,
    Shirt,
    Smartphone,
    Sofa,
    Wrench,
    Bike,
    Baby,
    Dog,
    Palette,
    // можно добавить другие по мере надобности
  } from 'lucide-react'
  
  // 👇 Сопоставление API-строк с компонентами из lucide-react
  export const lucideIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    car: Car,
    house: House,
    briefcase: Briefcase,
    shoppingbag: ShoppingBag,
    shirt: Shirt,
    smartphone: Smartphone,
    sofa: Sofa,
    wrench: Wrench,
    bike: Bike,
    baby: Baby,
    dog: Dog,
    palette: Palette,
  }
  