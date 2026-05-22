export type Card = {
  id: string
  front: string
  back: string
  createdAt: number
}

export type AppMode = 'list' | 'editor' | 'study' | 'summary'
