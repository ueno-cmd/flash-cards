import { useState } from 'react'
import type { Card, StudyResult } from '../../types'
import styles from './StudyMode.module.css'

type Props = {
  cards: Card[]
  onFinish: (result: StudyResult) => void
  onCancel: () => void
}

export function StudyMode({ cards, onFinish, onCancel }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  if (cards.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>学習できるカードがありません。</p>
        <button type="button" className={styles.btnBack} onClick={onCancel}>
          一覧へ戻る
        </button>
      </div>
    )
  }

  const card = cards[currentIndex]
  const isLast = currentIndex === cards.length - 1
  const progressPct = ((currentIndex + (isFlipped ? 1 : 0)) / cards.length) * 100

  function handleFlip() {
    setIsFlipped(true)
  }

  function handleJudge(isCorrect: boolean) {
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount
    if (isLast) {
      onFinish({ total: cards.length, correct: newCorrectCount })
    } else {
      if (isCorrect) setCorrectCount((prev) => prev + 1)
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.progressRow}>
        <span className={styles.progress}>{currentIndex + 1} / {cards.length}</span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <button
        type="button"
        className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
        onClick={!isFlipped ? handleFlip : undefined}
        aria-label={isFlipped ? undefined : 'タップして裏を確認'}
        style={{ cursor: isFlipped ? 'default' : 'pointer' }}
      >
        <span className={styles.cardSide}>{isFlipped ? '裏 / Answer' : '表 / Question'}</span>
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
          className={styles.btnBack}
          onClick={onCancel}
        >
          一覧
        </button>
        {isFlipped ? (
          <div className={styles.judgeButtons}>
            <button
              type="button"
              className={styles.btnIncorrect}
              onClick={() => handleJudge(false)}
            >
              ✗ 不正解
            </button>
            <button
              type="button"
              className={styles.btnCorrect}
              onClick={() => handleJudge(true)}
            >
              ✓ 正解
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.btnFlip}
            onClick={handleFlip}
          >
            裏を見る
          </button>
        )}
      </div>
    </div>
  )
}
