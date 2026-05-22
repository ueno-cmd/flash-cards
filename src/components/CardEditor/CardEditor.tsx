import { useState } from 'react'
import type { Card } from '../../types'
import styles from './CardEditor.module.css'

type Props = {
  editingCard: Card | null
  onSave: (front: string, back: string) => void
  onCancel: () => void
}

export function CardEditor({ editingCard, onSave, onCancel }: Props) {
  const [front, setFront] = useState(editingCard?.front ?? '')
  const [back, setBack] = useState(editingCard?.back ?? '')

  const isValid = front.trim().length > 0 && back.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onSave(front.trim(), back.trim())
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>
        {editingCard ? 'カードを編集' : 'カードを追加'}
      </p>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="front">
            表（問い）
          </label>
          <textarea
            id="front"
            className={styles.textarea}
            value={front}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFront(e.target.value)
            }
            placeholder="例：日本の首都は？"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="back">
            裏（答え）
          </label>
          <textarea
            id="back"
            className={styles.textarea}
            value={back}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBack(e.target.value)
            }
            placeholder="例：東京"
          />
        </div>
        {!isValid && front.length > 0 && back.length === 0 && (
          <p className={styles.error}>裏面を入力してください</p>
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={!isValid}
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
