import type { Card } from '../../types'
import styles from './Summary.module.css'

type Props = {
  cards: Card[]
  onRetry: () => void
  onBack: () => void
}

export function Summary({ cards, onRetry, onBack }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>おつかれさまでした！</p>
      <div>
        <p className={styles.count}>{cards.length}</p>
        <p className={styles.countLabel}>枚のカードを学習しました</p>
      </div>
      <p className={styles.message}>
        もう一度チャレンジしますか？
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={onRetry}>
          もう一度
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onBack}
        >
          一覧へ戻る
        </button>
      </div>
    </div>
  )
}
