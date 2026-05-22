# フラッシュカードアプリ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vite + React + TypeScript でフラッシュカードアプリを実装し、カードの登録・一覧・学習・CSVインポートをブラウザだけで完結させる。

**Architecture:** `useCards` カスタムフックがカード CRUD と localStorage 永続化を担い、`App.tsx` が `AppMode` に基づいて画面を切り替える。各画面は独立したコンポーネントとして `src/components/` 以下に配置し、CSS Modules でスタイリングする。

**Tech Stack:** Vite 8, React 19, TypeScript (strict), CSS Modules, localStorage, `crypto.randomUUID()`

---

## ファイル構成

| 操作 | パス |
|---|---|
| 変換（jsx→tsx） | `src/main.tsx`（`src/main.jsx` を削除・再作成） |
| 変換（jsx→tsx） | `src/App.tsx`（`src/App.jsx` を削除・再作成） |
| 変換（js→ts） | `vite.config.ts`（`vite.config.js` を削除・再作成） |
| 修正 | `index.html`（script src を main.tsx に変更） |
| 修正 | `eslint.config.js`（tsx ファイル対象に拡張） |
| 修正 | `package.json`（TypeScript 関連 devDependency 追加） |
| 新規作成 | `tsconfig.json` |
| 新規作成 | `tsconfig.app.json` |
| 新規作成 | `tsconfig.node.json` |
| 新規作成 | `src/types/index.ts` |
| 新規作成 | `src/hooks/useCards.ts` |
| 新規作成 | `src/utils/csvImport.ts` |
| 新規作成 | `src/components/CardEditor/CardEditor.tsx` |
| 新規作成 | `src/components/CardEditor/CardEditor.module.css` |
| 新規作成 | `src/components/CardList/CardList.tsx` |
| 新規作成 | `src/components/CardList/CardList.module.css` |
| 新規作成 | `src/components/StudyMode/StudyMode.tsx` |
| 新規作成 | `src/components/StudyMode/StudyMode.module.css` |
| 新規作成 | `src/components/Summary/Summary.tsx` |
| 新規作成 | `src/components/Summary/Summary.module.css` |
| 修正 | `src/index.css`（テンプレート用スタイルを削除してアプリ用に書き直し） |

---

## Task 1: TypeScript 環境のセットアップ

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Modify: `eslint.config.js`

- [ ] **Step 1: TypeScript 関連パッケージをインストールする**

```bash
cd /mnt/storage/projects/claude-code-template
npm install --save-dev typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

期待出力：`added N packages` のようなメッセージが表示され、エラーなし。

- [ ] **Step 2: tsconfig.json を作成する**

`tsconfig.json` の内容：

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 3: tsconfig.app.json を作成する**

`tsconfig.app.json` の内容：

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: tsconfig.node.json を作成する**

`tsconfig.node.json` の内容：

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: vite.config.ts を作成し、vite.config.js を削除する**

`vite.config.ts` の内容：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

```bash
rm /mnt/storage/projects/claude-code-template/vite.config.js
```

- [ ] **Step 6: eslint.config.js を TypeScript 対応に更新する**

`eslint.config.js` の内容：

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
```

```bash
npm install --save-dev typescript-eslint
```

- [ ] **Step 7: main.tsx を作成し、main.jsx を削除する**

`src/main.tsx` の内容：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('root element が見つかりません')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

```bash
rm /mnt/storage/projects/claude-code-template/src/main.jsx
```

- [ ] **Step 8: index.html の script src を更新する**

`index.html` の該当行を変更する：

変更前：`<script type="module" src="/src/main.jsx"></script>`
変更後：`<script type="module" src="/src/main.tsx"></script>`

- [ ] **Step 9: 仮の App.tsx を作成し、App.jsx を削除してビルドが通るか確認する**

`src/App.tsx` の内容（仮）：

```tsx
function App() {
  return <div>フラッシュカードアプリ</div>
}

export default App
```

```bash
rm /mnt/storage/projects/claude-code-template/src/App.jsx
```

- [ ] **Step 10: 開発サーバーを起動して TypeScript エラーがないか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run dev &
sleep 3 && curl -s http://localhost:5173 | head -5
```

期待出力：HTML が返ってくること（エラーなし）。確認したらサーバーを止める（`kill %1`）。

- [ ] **Step 11: lint が通るか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint
```

期待出力：エラーなし（警告のみなら許容）。

- [ ] **Step 12: コミットする**

```bash
cd /mnt/storage/projects/claude-code-template
git add src/main.tsx src/App.tsx vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js index.html package.json package-lock.json
git commit -m "chore: TypeScript環境をセットアップ"
```

---

## Task 2: 型定義・カスタムフック・CSVユーティリティの作成

**Files:**
- Create: `src/types/index.ts`
- Create: `src/hooks/useCards.ts`
- Create: `src/utils/csvImport.ts`

- [ ] **Step 1: src/types/index.ts を作成する**

```ts
export type Card = {
  id: string
  front: string
  back: string
  createdAt: number
}

export type AppMode = 'list' | 'editor' | 'study' | 'summary'
```

- [ ] **Step 2: src/utils/csvImport.ts を作成する**

```ts
import type { Card } from '../types'

/**
 * CSV文字列をCard配列に変換する（ヘッダーなし・2列形式）
 * 空行・列数が2以外の行はスキップする
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

- [ ] **Step 3: src/hooks/useCards.ts を作成する**

```ts
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
```

- [ ] **Step 4: lint を実行してエラーがないか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint
```

期待出力：エラーなし。

- [ ] **Step 5: コミットする**

```bash
cd /mnt/storage/projects/claude-code-template
git add src/types/index.ts src/hooks/useCards.ts src/utils/csvImport.ts
git commit -m "feat: 型定義・useCardsフック・csvImportユーティリティを追加"
```

---

## Task 3: CardEditor コンポーネントの実装

カードの新規追加・編集フォーム画面。

**Files:**
- Create: `src/components/CardEditor/CardEditor.tsx`
- Create: `src/components/CardEditor/CardEditor.module.css`

- [ ] **Step 1: CardEditor.module.css を作成する**

```css
.container {
  padding: 24px 16px;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--text-h);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h);
}

.textarea {
  font-size: 16px;
  font-family: var(--sans);
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  width: 100%;
}

.textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: 0;
}

.error {
  font-size: 13px;
  color: #e53e3e;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btnPrimary {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  min-height: 48px;
}

.btnPrimary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btnSecondary {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  min-height: 48px;
}
```

- [ ] **Step 2: CardEditor.tsx を作成する**

```tsx
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
```

- [ ] **Step 3: lint を実行してエラーがないか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint
```

期待出力：エラーなし。

- [ ] **Step 4: コミットする**

```bash
cd /mnt/storage/projects/claude-code-template
git add src/components/CardEditor/CardEditor.tsx src/components/CardEditor/CardEditor.module.css
git commit -m "feat: CardEditorコンポーネントを追加"
```

---

## Task 4: CardList コンポーネントの実装

カード一覧表示・CSVインポートボタン・学習開始ボタン。

**Files:**
- Create: `src/components/CardList/CardList.tsx`
- Create: `src/components/CardList/CardList.module.css`

- [ ] **Step 1: CardList.module.css を作成する**

```css
.container {
  padding: 24px 16px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-h);
}

.headerActions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btnPrimary {
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  min-height: 44px;
  white-space: nowrap;
}

.btnSecondary {
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  min-height: 44px;
  white-space: nowrap;
}

.btnSecondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  padding: 48px 0;
  color: var(--text);
  font-size: 15px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
}

.cardText {
  flex: 1;
  text-align: left;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-h);
  overflow-wrap: break-word;
  min-width: 0;
}

.front {
  font-weight: 500;
}

.separator {
  color: var(--text);
  margin: 2px 0;
  font-size: 13px;
}

.back {
  color: var(--text);
}

.itemActions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btnIcon {
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  min-height: 36px;
  white-space: nowrap;
}

.btnIcon:hover {
  background: var(--accent-bg);
  border-color: var(--accent-border);
  color: var(--accent);
}

.btnDelete:hover {
  background: rgba(229, 62, 62, 0.1);
  border-color: rgba(229, 62, 62, 0.5);
  color: #e53e3e;
}
```

- [ ] **Step 2: CardList.tsx を作成する**

```tsx
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
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file, 'UTF-8')
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
                  onClick={() => onDelete(card.id)}
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

- [ ] **Step 3: lint を実行してエラーがないか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint
```

期待出力：エラーなし。

- [ ] **Step 4: コミットする**

```bash
cd /mnt/storage/projects/claude-code-template
git add src/components/CardList/CardList.tsx src/components/CardList/CardList.module.css
git commit -m "feat: CardListコンポーネントを追加"
```

---

## Task 5: StudyMode コンポーネントの実装

1枚ずつ表示してタップで裏返す学習モード。

**Files:**
- Create: `src/components/StudyMode/StudyMode.tsx`
- Create: `src/components/StudyMode/StudyMode.module.css`

- [ ] **Step 1: StudyMode.module.css を作成する**

```css
.container {
  padding: 24px 16px;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.progress {
  font-size: 14px;
  color: var(--text);
  align-self: flex-end;
}

.card {
  width: 100%;
  min-height: 200px;
  padding: 32px 24px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--bg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-shadow: var(--shadow);
  box-sizing: border-box;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}

.card:active {
  background: var(--accent-bg);
}

.cardLabel {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

.cardText {
  font-size: 22px;
  font-weight: 500;
  color: var(--text-h);
  text-align: center;
  line-height: 1.5;
  word-break: break-word;
}

.hint {
  font-size: 13px;
  color: var(--text);
}

.actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btnNext {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  min-height: 48px;
}

.btnNext:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btnCancel {
  padding: 14px 20px;
  font-size: 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  min-height: 48px;
}
```

- [ ] **Step 2: StudyMode.tsx を作成する**

```tsx
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
```

- [ ] **Step 3: lint を実行してエラーがないか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint
```

期待出力：エラーなし。

- [ ] **Step 4: コミットする**

```bash
cd /mnt/storage/projects/claude-code-template
git add src/components/StudyMode/StudyMode.tsx src/components/StudyMode/StudyMode.module.css
git commit -m "feat: StudyModeコンポーネントを追加"
```

---

## Task 6: Summary コンポーネントの実装

全カード終了後のまとめ画面。

**Files:**
- Create: `src/components/Summary/Summary.tsx`
- Create: `src/components/Summary/Summary.module.css`

- [ ] **Step 1: Summary.module.css を作成する**

```css
.container {
  padding: 48px 16px;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.heading {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-h);
  margin: 0;
}

.message {
  font-size: 16px;
  color: var(--text);
  line-height: 1.6;
  margin: 0;
}

.count {
  font-size: 48px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.countLabel {
  font-size: 15px;
  color: var(--text);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.btnPrimary {
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  min-height: 48px;
}

.btnSecondary {
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  min-height: 48px;
}
```

- [ ] **Step 2: Summary.tsx を作成する**

```tsx
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
```

- [ ] **Step 3: lint を実行してエラーがないか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint
```

期待出力：エラーなし。

- [ ] **Step 4: コミットする**

```bash
cd /mnt/storage/projects/claude-code-template
git add src/components/Summary/Summary.tsx src/components/Summary/Summary.module.css
git commit -m "feat: Summaryコンポーネントを追加"
```

---

## Task 7: App.tsx の実装（画面ルーティング）とグローバルスタイルの整理

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: index.css をアプリ用に書き直す**

既存の `src/index.css` の内容を以下で置き換える：

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;

  font-size: 16px;
  font-family: var(--sans);
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px,
      rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

#root {
  min-height: 100svh;
}

h1, h2, h3, p {
  margin: 0;
}

button {
  font-family: var(--sans);
}
```

- [ ] **Step 2: index.html のタイトルを変更する**

`index.html` の `<title>` タグを変更する：

変更前：`<title>claude-code-template</title>`
変更後：`<title>フラッシュカード</title>`

- [ ] **Step 3: App.tsx を実装する**

`src/App.tsx` の内容を以下で置き換える：

```tsx
import { useState } from 'react'
import type { Card, AppMode } from './types'
import { useCards } from './hooks/useCards'
import { CardList } from './components/CardList/CardList'
import { CardEditor } from './components/CardEditor/CardEditor'
import { StudyMode } from './components/StudyMode/StudyMode'
import { Summary } from './components/Summary/Summary'

function App() {
  const { cards, addCard, updateCard, deleteCard, importCards } = useCards()
  const [mode, setMode] = useState<AppMode>('list')
  const [editingCard, setEditingCard] = useState<Card | null>(null)

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

  function handleFinishStudy() {
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
        cards={cards}
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

- [ ] **Step 4: 不要なアセットを削除する（App.css など）**

```bash
rm -f /mnt/storage/projects/claude-code-template/src/App.css
rm -f /mnt/storage/projects/claude-code-template/src/assets/react.svg
rm -f /mnt/storage/projects/claude-code-template/src/assets/vite.svg
rm -f /mnt/storage/projects/claude-code-template/src/assets/hero.png
```

- [ ] **Step 5: lint を実行してエラーがないか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint
```

期待出力：エラーなし。

- [ ] **Step 6: 開発サーバーを起動して動作確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run dev
```

ブラウザで `http://localhost:5173` を開き、以下を確認する：
1. カード一覧画面が表示される
2. 「＋ 追加」ボタンでCardEditorに遷移する
3. 表・裏を入力して「保存」でカード一覧に戻り、カードが表示される
4. 「学習開始」でStudyModeに遷移する
5. カードをタップで裏返せる
6. 「次へ」で次カードへ進み、最後に Summary が表示される
7. ページリロード後もカードが保持されている（localStorage 永続化）

確認後サーバーを止める（`Ctrl+C`）。

- [ ] **Step 7: プロダクションビルドが通るか確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run build
```

期待出力：`dist/` にビルド成果物が生成され、エラーなし。

- [ ] **Step 8: コミットする**

```bash
cd /mnt/storage/projects/claude-code-template
git add src/App.tsx src/index.css index.html
git commit -m "feat: App.tsxで画面ルーティングを実装・グローバルスタイルを整理"
```

---

## Task 8: CSVインポート動作確認と最終コミット

**Files:**
- なし（動作確認のみ）

- [ ] **Step 1: テスト用 CSV ファイルを作成する**

```bash
cat > /tmp/test-flashcards.csv << 'EOF'
東京,Tokyo
大阪,Osaka
京都,Kyoto
北海道,Hokkaido
沖縄,Okinawa
EOF
```

- [ ] **Step 2: 開発サーバーを起動して CSV インポートを確認する**

```bash
cd /mnt/storage/projects/claude-code-template && npm run dev
```

ブラウザで `http://localhost:5173` を開き、以下を確認する：
1. 「CSVインポート」ボタンをクリックし、`/tmp/test-flashcards.csv` を選択
2. 5枚のカード（東京/Tokyo など）が一覧に追加されること
3. 「学習開始」で全5枚を学習できること
4. まとめ画面で「5枚のカードを学習しました」と表示されること
5. 「もう一度」で学習モードに戻ること

確認後サーバーを止める。

- [ ] **Step 3: 最終の lint とビルド確認**

```bash
cd /mnt/storage/projects/claude-code-template && npm run lint && npm run build
```

期待出力：エラーなし、`dist/` にビルド成果物が生成される。

- [ ] **Step 4: 最終コミット**

```bash
cd /mnt/storage/projects/claude-code-template
git add -A
git commit -m "chore: フラッシュカードアプリ完成・動作確認済み"
```
