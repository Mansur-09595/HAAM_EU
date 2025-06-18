export interface INotification {
    id: number
    recipient: {
      id: number
      username: string
      email: string
      phone: string | null
      avatar: string | null
      bio: string
      is_staff?: boolean
    }
    sender: {
      id: number
      username: string
      email: string
      phone: string | null
      avatar: string | null
      bio: string
      is_staff?: boolean
    } | null
    notification_type: string
    content: string
    object_id: number | null
    is_read: boolean
    created_at: string
  }
  
  export interface INotificationsState {
    items: INotification[]
    loading: boolean
    error: string | null
  }