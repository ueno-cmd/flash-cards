# フラッシュカード修正7件 + 正解/不正解ボタン実装 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** コードレビューで指摘された7件の問題を修正し、正解/不正解の自己評価機能を追加する。

**Architecture:** `StudyResult` 型を新設して正解数を `App.tsx` で管理し `Summary` へ渡す。`StudyMode` は裏面表示後に正解/不正解ボタンを表示して結果を集計する。その他の修正はそれぞれ独立した局所変更として実施する。

**Tech Stack:** Vite 8 + React 19 + TypeScript (strict) + CSS Modules + localStorage

---

## ファイル変更マップ

| ファイル | 変更内容 |
|---|---|
| `src/types/index.ts` | `StudyResult` 型を追加 |
| `src/App.tsx` | `studyResult` state 追加・`handleFinishStudy` 引数変更・Summary に渡す |
| `src/components/StudyMode/StudyMode.tsx` | 正解/不正解ボタン・空配列ガード |
| `src/components/StudyMode/StudyMode.module.css` | 正解/不正解ボタンのスタイル追加 |
| `src/components/Summary/Summary.tsx` | `StudyResult` を受け取り正解数を表示 |
| `src/components/Summary/Summary.module.css` | 正解数スタイル追加 |
| `src/components/CardList/CardList.tsx` | CSV 0件フィードバック・削除確認ダイアログ |
| `src/components/CardEditor/CardEditor.tsx` | `submitted` フラグによるエラー表示改善 |
| `src/utils/csvImport.ts` | JSDoc にクォート非対応の注意を明記・`\r` 除去を明示 |
| `src/hooks/useCards.ts` | `crypto.randomUUID()` HTTP フォールバック追加 |

---

### Task 1: `StudyResult` 型の追加と `crypto.randomUUID` フォールバック

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/hooks/useCards.ts`

- [ ] **Step 1: `types/index.ts` に `StudyResult` 型を追加する**

```typescript
// src/types/index.ts
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
```

- [ ] **Step 2: `useCards.ts` に UUID フォールバックを追加する**

`crypto.randomUUID()` は HTTP 環境（LAN 共有など）では使えないため、フォールバックを追加する。

```typescript
// src/hooks/useCards.ts の先頭付近に追加（import の後）

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // HTTP環境向けフォールバック
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
```

`addCard` と `importCards` 内の `crypto.randomUUID()` を `generateId()` に置き換える。

```typescript
function addCard(front: string, back: string): void {
  const newCard: Card = {
    id: generateId(),
    front,
    back,
    createdAt: Date.now(),
  }
  setCards((prev) => [...prev, newCard])
}

function importCards(items: Omit<Card, 'id' | 'createdAt'>[]): void {
  const newCards: Card[] = items.map((item) => ({
    ...item,
    id: generateId(),
    createdAt: Date.now(),
  }))
  setCards((prev) => [...prev, ...newCards])
}
```

- [ ] **Step 3: TypeScript コンパイルを確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/types/index.ts src/hooks/useCards.ts
git commit -m "feat: StudyResult型追加・randomUUID HTTPフォールバック追加"
```

---

### Task 2: `csvImport.ts` の改善

**Files:**
- Modify: `src/utils/csvImport.ts`

- [ ] **Step 1: JSDoc にクォート非対応の注意と `\r` 除去の明示を追加する**

```typescript
// src/utils/csvImport.ts
import type { Card } from '../types'

/**
 * CSV文字列をCard配列に変換する（ヘッダーなし・2列形式）
 *
 * 対応フォーマット:
 *   front,back
 *   front,"back with comma, inside"  ← back側のカンマはslice(1).join(',')で結合
 *
 * 非対応:
 *   RFC 4180 ダブルクォートで囲まれた front フィールド（例: "front,with,comma",back）
 *   → front にカンマを含む場合は別の区切り文字（タブなど）を使うか手動入力を推奨
 *
 * 空行・列数が2未満の行はスキップする
 * Windows改行(\r\n)は trim() で除去済み
 */
export function parseCSV(csv: string): Omit<Card, 'id' | 'createdAt'>[] {
  return csv
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .flatMap((line) => {
      const columns = line.split(',')
      if (columns.length < 2) return []
      const front = columns[0].trim()
      const back = columns.slice(1).join(',').trim()
      if (!front || !back) return []
      return [{ front, back }]
    })
}
```

- [ ] **Step 2: TypeScript コンパイルを確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/utils/csvImport.ts
git commit -m "docs: csvImportにRFC4180クォート非対応の注意を明記"
```

---

### Task 3: `CardList.tsx` の改善（CSV 0件フィードバック・削除確認）

**Files:**
- Modify: `src/components/CardList/CardList.tsx`

- [ ] **Step 1: CSV 0件時のフィードバックと削除確認ダイアログを追加する**

```typescript
// src/components/CardList/CardList.tsx
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
```

- [ ] **Step 2: TypeScript コンパイルを確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/CardList/CardList.tsx
git commit -m "fix: CSVインポート0件フィードバック追加・削除確認ダイアログ追加"
```

---

### Task 4: `CardEditor.tsx` のエラー表示改善

**Files:**
- Modify: `src/components/CardEditor/CardEditor.tsx`

- [ ] **Step 1: `submitted` フラグを追加してエラー表示を改善する**

```typescript
// src/components/CardEditor/CardEditor.tsx
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
  const [submitted, setSubmitted] = useState(false)

  const isFrontEmpty = front.trim().length === 0
  const isBackEmpty = back.trim().length === 0
  const isValid = !isFrontEmpty && !isBackEmpty

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
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
          {submitted && isFrontEmpty && (
            <p className={styles.error}>表面を入力してください</p>
          )}
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
          {submitted && isBackEmpty && (
            <p className={styles.error}>裏面を入力してください</p>
          )}
        </div>
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
            disabled={submitted && !isValid}
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript コンパイルを確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/CardEditor/CardEditor.tsx
git commit -m "fix: CardEditorにsubmittedフラグを追加してエラー表示を改善"
```

---

### Task 5: `StudyMode` に正解/不正解ボタンと空配列ガードを実装

**Files:**
- Modify: `src/components/StudyMode/StudyMode.tsx`
- Modify: `src/components/StudyMode/StudyMode.module.css`

- [ ] **Step 1: `StudyMode.tsx` を更新する**

`onFinish` のシグネチャを `onFinish(result: StudyResult) => void` に変更し、裏面表示後に正解/不正解ボタンを表示する。空配列ガードも追加する。

```typescript
// src/components/StudyMode/StudyMode.tsx
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

  // 空配列ガード
  if (cards.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>学習できるカードがありません。</p>
        <button type="button" className={styles.btnCancel} onClick={onCancel}>
          一覧へ戻る
        </button>
      </div>
    )
  }

  const card = cards[currentIndex]
  const isLast = currentIndex === cards.length - 1

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
      <p className={styles.progress}>
        {currentIndex + 1} / {cards.length}
      </p>
      <button
        type="button"
        className={styles.card}
        onClick={!isFlipped ? handleFlip : undefined}
        aria-label={isFlipped ? undefined : 'タップして裏を確認'}
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
            className={styles.btnNext}
            onClick={handleFlip}
            disabled={isFlipped}
          >
            裏を見る
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `StudyMode.module.css` に正解/不正解ボタンのスタイルを追加する**

既存の CSS を読み込んで末尾に追記する。

```bash
cat /mnt/storage/projects/claude-code-template/src/components/StudyMode/StudyMode.module.css
```

末尾に以下を追加する（既存スタイルを維持したまま）：

```css
.empty {
  text-align: center;
  color: var(--color-text-muted, #888);
  margin: 2rem 0;
}

.judgeButtons {
  display: flex;
  gap: 0.75rem;
}

.btnCorrect {
  min-height: 48px;
  padding: 0 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  background-color: #22c55e;
  color: #fff;
}

.btnCorrect:active {
  opacity: 0.85;
}

.btnIncorrect {
  min-height: 48px;
  padding: 0 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  background-color: #ef4444;
  color: #fff;
}

.btnIncorrect:active {
  opacity: 0.85;
}
```

- [ ] **Step 3: TypeScript コンパイルを確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npx tsc --noEmit
```

期待: `App.tsx` で型エラーが出る（`onFinish` シグネチャ変更のため）。次の Task で修正する。

- [ ] **Step 4: コミット（型エラーは次 Task で修正）**

```bash
git add src/components/StudyMode/StudyMode.tsx src/components/StudyMode/StudyMode.module.css
git commit -m "feat: StudyModeに正解/不正解ボタンと空配列ガードを追加"
```

---

### Task 6: `App.tsx` と `Summary` を `StudyResult` に対応させる

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Summary/Summary.tsx`
- Modify: `src/components/Summary/Summary.module.css`

- [ ] **Step 1: `Summary.tsx` を `StudyResult` を受け取る形に更新する**

```typescript
// src/components/Summary/Summary.tsx
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
```

- [ ] **Step 2: `Summary.module.css` に結果グリッドのスタイルを追加する**

既存の CSS を確認してから末尾に追記する：

```bash
cat /mnt/storage/projects/claude-code-template/src/components/Summary/Summary.module.css
```

既存スタイルを維持したまま、以下を追加（`.count` と `.countLabel` が既存にある場合は置き換えず末尾追記）：

```css
.resultGrid {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin: 1rem 0;
}

.resultItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 5rem;
}

.correct .count {
  color: #22c55e;
}

.incorrect .count {
  color: #ef4444;
}
```

- [ ] **Step 3: `App.tsx` を `StudyResult` に対応させる**

```typescript
// src/App.tsx
import { useState } from 'react'
import type { Card, AppMode, StudyResult } from './types'
import { useCards } from './hooks/useCards'
import { CardList } from './components/CardList/CardList'
import { CardEditor } from './components/CardEditor/CardEditor'
import { StudyMode } from './components/StudyMode/StudyMode'
import { Summary } from './components/Summary/Summary'

function App() {
  const { cards, addCard, updateCard, deleteCard, importCards } = useCards()
  const [mode, setMode] = useState<AppMode>('list')
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [studyResult, setStudyResult] = useState<StudyResult>({ total: 0, correct: 0 })

  function handleAdd() {
    setEditingCard(null)
    setMode('editor')
  }

  function handleEdit(card: Card) {
    setEditingCard(card)
    setMode('editor')
  }

  function handleSave(front: string, back: string) {
    if (editingCard) {
      updateCard(editingCard.id, front, back)
    } else {
      addCard(front, back)
    }
    setMode('list')
  }

  function handleCancelEdit() {
    setMode('list')
  }

  function handleStartStudy() {
    setMode('study')
  }

  function handleFinishStudy(result: StudyResult) {
    setStudyResult(result)
    setMode('summary')
  }

  function handleCancelStudy() {
    setMode('list')
  }

  function handleRetry() {
    setMode('study')
  }

  function handleBackToList() {
    setMode('list')
  }

  if (mode === 'editor') {
    return (
      <CardEditor
        editingCard={editingCard}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    )
  }

  if (mode === 'study') {
    return (
      <StudyMode
        cards={cards}
        onFinish={handleFinishStudy}
        onCancel={handleCancelStudy}
      />
    )
  }

  if (mode === 'summary') {
    return (
      <Summary
        result={studyResult}
        onRetry={handleRetry}
        onBack={handleBackToList}
      />
    )
  }

  return (
    <CardList
      cards={cards}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={deleteCard}
      onImport={importCards}
      onStartStudy={handleStartStudy}
    />
  )
}

export default App
```

- [ ] **Step 4: TypeScript コンパイルを確認する（エラーなしになるはず）**

```bash
cd /mnt/storage/projects/claude-code-template && npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 5: コミット**

```bash
git add src/App.tsx src/components/Summary/Summary.tsx src/components/Summary/Summary.module.css
git commit -m "feat: SummaryにStudyResult（正解/不正解数）表示を追加"
```

---

### Task 7: 動作確認・最終コミット

**Files:** なし（確認のみ）

- [ ] **Step 1: 開発サーバーを起動して手動確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run dev
```

以下のシナリオを確認する：

1. **空配列ガード**: カードなし状態で「学習開始」は無効（disabled）になっていること
2. **正解/不正解ボタン**: 学習中、カードを裏返すと「✓ 正解」「✗ 不正解」が表示されること
3. **サマリー**: 学習終了後に「X枚学習 / Y正解 / Z不正解」が表示されること
4. **削除確認**: 削除ボタンを押すと確認ダイアログが表示されること
5. **CardEditor エラー**: 両フィールド空のまま保存を押すと両方にエラーが出ること
6. **CSV 0件**: 不正な CSV をインポートするとアラートが出ること

- [ ] **Step 2: TypeScript + lint の最終確認**

```bash
cd /mnt/storage/projects/claude-code-template && npx tsc --noEmit && npx eslint src/
```

期待: エラー・警告なし

- [ ] **Step 3: 最終コミット**

```bash
git add -A
git commit -m "chore: 全修正完了・動作確認済み"
```
