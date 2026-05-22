export type Card = {
  id: string
  front: string
  back: string
  createdAt: number
}

export type AppMode = 'list' | 'editor' | 'study' | 'summary'

export type StudyResult = {
  total: number
  correct: number
}
