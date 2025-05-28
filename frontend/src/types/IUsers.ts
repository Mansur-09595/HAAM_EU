export type Users = {
    id: number
    username: string
    email: string
    phone?: string | null
    avatar?: string | null
    bio?: string
    is_staff: boolean
}

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}