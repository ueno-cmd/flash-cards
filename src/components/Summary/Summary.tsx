import type { StudyResult } from '../../types'
import styles from './Summary.module.css'

type Props = {
  result: StudyResult
  onRetry: () => void
  onBack: () => void
}

export function Summary({ result, onRetry, onBack }: Props) {
  const { total, correct } = result
  const incorrect = total - correct

  return (
    <div className={styles.container}>
      <p className={styles.heading}>おつかれさまでした！</p>
      <div className={styles.resultGrid}>
        <div className={styles.resultItem}>
          <p className={styles.count}>{total}</p>
          <p className={styles.countLabel}>枚学習</p>
        </div>
        <div className={`${styles.resultItem} ${styles.correct}`}>
          <p className={styles.count}>{correct}</p>
          <p className={styles.countLabel}>正解</p>
        </div>
        <div className={`${styles.resultItem} ${styles.incorrect}`}>
          <p className={styles.count}>{incorrect}</p>
          <p className={styles.countLabel}>不正解</p>
        </div>
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
