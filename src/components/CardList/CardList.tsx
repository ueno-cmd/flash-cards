import { useRef } from 'react'
import type { Card } from '../../types'
import { parseCSV } from '../../utils/csvImport'
import styles from './CardList.module.css'

type Props = {
  cards: Card[]
  onAdd: () => void
  onEdit: (card: Card) => void
  onDelete: (id: string) => void
  onImport: (items: Omit<Card, 'id' | 'createdAt'>[]) => void
  onStartStudy: () => void
}

export function CardList({
  cards,
  onAdd,
  onEdit,
  onDelete,
  onImport,
  onStartStudy,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text !== 'string') return
      const items = parseCSV(text)
      if (items.length > 0) {
        onImport(items)
      } else {
        alert('インポートできるカードが見つかりませんでした。\nCSVの形式を確認してください（1列目: 表、2列目: 裏）。')
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleDelete(id: string) {
    if (!window.confirm('このカードを削除しますか？')) return
    onDelete(id)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.title}>カード一覧（{cards.length}枚）</p>
        <div className={styles.headerActions}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => fileInputRef.current?.click()}
          >
            CSVインポート
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            disabled={cards.length === 0}
            onClick={onStartStudy}
          >
            学習開始
          </button>
          <button type="button" className={styles.btnPrimary} onClick={onAdd}>
            ＋ 追加
          </button>
        </div>
      </div>
      {cards.length === 0 ? (
        <p className={styles.empty}>
          カードがありません。「＋ 追加」か「CSVインポート」でカードを登録してください。
        </p>
      ) : (
        <ul className={styles.list}>
          {cards.map((card) => (
            <li key={card.id} className={styles.item}>
              <div className={styles.cardText}>
                <p className={styles.front}>{card.front}</p>
                <p className={styles.separator}>▼</p>
                <p className={styles.back}>{card.back}</p>
              </div>
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.btnIcon}
                  onClick={() => onEdit(card)}
                >
                  編集
                </button>
                <button
                  type="button"
                  className={`${styles.btnIcon} ${styles.btnDelete}`}
                  onClick={() => handleDelete(card.id)}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
