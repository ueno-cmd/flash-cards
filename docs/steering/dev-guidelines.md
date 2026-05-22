# dev-guidelines.md

作成日：2026-05-22

---

## 技術スタック

| 項目 | 採用技術 |
|---|---|
| ビルドツール | Vite 8.x |
| UIフレームワーク | React 19.x |
| 言語 | TypeScript（strict モード） |
| スタイル | CSS Modules（`*.module.css`） |
| 状態管理 | React 組み込み（useState / useReducer） |
| 永続化 | localStorage |
| テスト | なし（初期スコープ外） |

---

## コーディングルール

### 全般

- コードコメントは日本語で書く（変数名・関数名・型名は英語）
- `any` 型の使用禁止。型が不明な場合は `unknown` を使い型ガードで絞り込む
- `as` キャストは localStorage の読み出し時のみ許容（型ガードを必ず併用）
- `console.log` は開発時のみ使用し、コミット前に削除する

### TypeScript

- `tsconfig.app.json` で `"strict": true` を有効にする
- 型定義は `src/types/index.ts` に集約し、各コンポーネントからインポートする
- React コンポーネントの Props 型は `type Props = { ... }` で定義する（`interface` は使わない）
- イベントハンドラの型は React の組み込み型を使う（例：`React.ChangeEvent<HTMLInputElement>`）

### React

- 関数コンポーネントのみ使用（クラスコンポーネント禁止）
- カスタムフックは `src/hooks/` 以下に配置し、ファイル名は `use*.ts` にする
- 副作用（localStorage 読み書き）は `useEffect` で管理する
- コンポーネントは1ファイル1コンポーネントを原則とする

### スタイル

- スタイルは CSS Modules（`*.module.css`）を使う
- グローバルスタイルは `src/index.css` のみに書く
- インラインスタイル（`style={{ ... }}`）は使わない
- 外部UIライブラリ（Tailwind, MUI, Chakra 等）は使わない
- CDN からのライブラリ読み込みも禁止

### モバイル対応

- 最小タップ領域は 44×44px を確保する
- フォントサイズの最小値は `16px`（ iOS でのズーム防止）
- `index.html` に `<meta name="viewport" content="width=device-width, initial-scale=1">` を含める（既存）
- レイアウトは `flexbox` または `grid` でレスポンシブに組む

---

## 禁止事項

| 禁止 | 理由 |
|---|---|
| 外部UIライブラリの使用 | 要件でスコープ外と明記 |
| CDN からのスクリプト/スタイル読み込み | 要件でスコープ外と明記 |
| サーバーサイド処理・API呼び出し | ブラウザ完結が要件 |
| `any` 型の使用 | 型安全性の確保 |
| クラスコンポーネント | React 19 の方針に従う |
| IE 対応コード | 要件で IEサポート不要と明記 |
| ○×による正解記録機能 | スコープ外 |
| スペースド・リピティション機能 | スコープ外 |
| ユーザー認証・クラウド同期 | スコープ外 |
| 画像・音声カード | スコープ外 |
| デッキ（カテゴリ）管理 | 初期スコープ外 |

---

## ファイル命名規則

| 種類 | 規則 | 例 |
|---|---|---|
| コンポーネント | PascalCase + `.tsx` | `CardEditor.tsx` |
| CSS Modules | コンポーネント名 + `.module.css` | `CardEditor.module.css` |
| カスタムフック | `use` + PascalCase + `.ts` | `useCards.ts` |
| ユーティリティ | camelCase + `.ts` | `csvImport.ts` |
| 型定義 | `index.ts`（集約） | `src/types/index.ts` |

---

## localStorage 仕様

- キー：`flashcard_cards`
- 値：`JSON.stringify(Card[])` で保存、読み出し時は `JSON.parse` + 型ガード
- 保存タイミング：カードの追加・更新・削除のたびに即時保存（`useEffect` 経由）
- 読み込みタイミング：アプリ初回マウント時（`useCards` フックの初期化）

---

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動（http://localhost:5173）
npm run build    # プロダクションビルド
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLint 実行
```
