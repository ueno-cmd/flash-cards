import { useState } from 'react'
import type { Card } from '../../types'
import styles from './StudyMode.module.css'

type Props = {
  cards: Card[]
  onFinish: () => void
  onCancel: () => void
}

export function StudyMode({ cards, onFinish, onCancel }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const card = cards[currentIndex]
  const isLast = currentIndex === cards.length - 1

  function handleFlip() {
    setIsFlipped((prev) => !prev)
  }

  function handleNext() {
    if (!isFlipped) return
    if (isLast) {
      onFinish()
    } else {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
    }
  }

  if (!card) return null

  return (
    <div className={styles.container}>
      <p className={styles.progress}>
        {currentIndex + 1} / {cards.length}
      </p>
      <button
        type="button"
        className={styles.card}
        onClick={handleFlip}
        aria-label={isFlipped ? '表に戻す' : 'タップして裏を確認'}
      >
        <span className={styles.cardLabel}>{isFlipped ? '裏' : '表'}</span>
        <span className={styles.cardText}>
          {isFlipped ? card.back : card.front}
        </span>
        {!isFlipped && (
          <span className={styles.hint}>タップして裏返す</span>
        )}
      </button>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnCancel}
          onClick={onCancel}
        >
          一覧へ
        </button>
        <button
          type="button"
          className={styles.btnNext}
          onClick={handleNext}
          disabled={!isFlipped}
        >
          {isLast ? '終了' : '次へ'}
        </button>
      </div>
    </div>
  )
}
