export interface CategoryDetail {
  id: number
  name: string
  parent: number | null
  icon: string
  slug: string
  children: CategoryDetail[]
}

export interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
  icon: string
  children: CategoryDetail[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Ads {
  id: number
  title: string
  slug: string
  description: string
  price: string
  currency: string
  category: number
  category_detail: CategoryDetail
  location: string
  owner: {
    id: number
    username: string
    email: string
    phone: string | null
    avatar: string | null
    bio: string
    date_joined: string
  }
  status: 'active' | 'archived' | string
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  images: {
    id: number
    image: string
    is_primary: boolean
    created_at: string
  }[]
  videos: {
    id: number
    video: string
    created_at: string
  }[]
  is_favorited: boolean | string
}

export type AdPost = {
  title: string
  description: string
  price: string
  currency: string
  category: number
  location: string
  images?: string[]  // или File[] если будешь использовать FormData
  videos?: string[]
}
