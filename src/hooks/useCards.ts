import { useState, useEffect } from 'react'
import type { Card } from '../types'

const STORAGE_KEY = 'flashcard_cards'

function loadCards(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Card[]
  } catch {
    return []
  }
}

function saveCards(cards: Card[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>(loadCards)

  useEffect(() => {
    saveCards(cards)
  }, [cards])

  function addCard(front: string, back: string): void {
    const newCard: Card = {
      id: crypto.randomUUID(),
      front,
      back,
      createdAt: Date.now(),
    }
    setCards((prev) => [...prev, newCard])
  }

  function updateCard(id: string, front: string, back: string): void {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, front, back } : c)),
    )
  }

  function deleteCard(id: string): void {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  function importCards(items: Omit<Card, 'id' | 'createdAt'>[]): void {
    const newCards: Card[] = items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }))
    setCards((prev) => [...prev, ...newCards])
  }

  return { cards, addCard, updateCard, deleteCard, importCards }
}
