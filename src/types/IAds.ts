export type Ads = {
    id: number
    title: string
    description: string
    price: string
    currency: string
    category: number
    category_detail: {
      id: number
      name: string
      parent: number | null
      icon: string
      slug: string
      children: string
    }
    location: string
    owner: {
      id: number
      username: string
      email: string
      phone: string
      avatar: string
      bio: string
      date_joined: string
    }
    status: 'active' | 'inactive' | string
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
    is_favorited: boolean | string // зависит от API, уточни
  }
  