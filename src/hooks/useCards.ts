import { useState, useEffect } from 'react'
import type { Card } from '../types'

const STORAGE_KEY = 'flashcard_cards'

// HTTP環境（LAN共有など）でcrypto.randomUUID()が使えない場合のフォールバック
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // フォールバック: Math.randomとDate.nowを組み合わせてIDを生成
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function isCard(value: unknown): value is Card {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === 'string' &&
    typeof (value as Record<string, unknown>).front === 'string' &&
    typeof (value as Record<string, unknown>).back === 'string' &&
    typeof (value as Record<string, unknown>).createdAt === 'number'
  )
}

function loadCards(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCard)
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
      id: generateId(),
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
      id: generateId(),
      createdAt: Date.now(),
    }))
    setCards((prev) => [...prev, ...newCards])
  }

  return { cards, addCard, updateCard, deleteCard, importCards }
}
