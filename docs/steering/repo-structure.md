# repo-structure.md

作成日：2026-05-22

---

## プロジェクト概要

Vite + React + TypeScript で動くフラッシュカードアプリ。
サーバー不要・ブラウザ完結・localStorage 永続保存。

---

## ディレクトリ構成

```
claude-code-template/
├── index.html                  # エントリーHTML（Vite のルート）
├── vite.config.ts              # Vite 設定（.js から変換）
├── tsconfig.json               # TypeScript 設定
├── tsconfig.app.json           # アプリ用 TS 設定
├── tsconfig.node.json          # Vite/Node 用 TS 設定
├── eslint.config.js            # ESLint 設定
├── package.json                # 依存関係・スクリプト
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.tsx                # React アプリのマウント（main.jsx を変換）
│   ├── App.tsx                 # ルートコンポーネント・画面ルーティング（App.jsx を変換）
│   ├── index.css               # グローバルスタイル（リセット・共通変数）
│   ├── types/
│   │   └── index.ts            # 共通型定義（Card, AppMode など）
│   ├── hooks/
│   │   └── useCards.ts         # カードの CRUD・localStorage 永続化ロジック
│   ├── components/
│   │   ├── CardList/
│   │   │   ├── CardList.tsx    # カード一覧表示コンポーネント
│   │   │   └── CardList.module.css
│   │   ├── CardEditor/
│   │   │   ├── CardEditor.tsx  # カード追加・編集フォームコンポーネント
│   │   │   └── CardEditor.module.css
│   │   ├── StudyMode/
│   │   │   ├── StudyMode.tsx   # 学習モード（1枚表示・めくり・次へ）コンポーネント
│   │   │   └── StudyMode.module.css
│   │   └── Summary/
│   │       ├── Summary.tsx     # 学習終了後のまとめ画面コンポーネント
│   │       └── Summary.module.css
│   └── utils/
│       └── csvImport.ts        # CSV パース・バリデーションロジック
├── docs/
│   ├── idea/
│   │   └── initial-requirements.md
│   └── steering/
│       ├── repo-structure.md   # 本ファイル
│       ├── glossary.md
│       └── dev-guidelines.md
└── .claude/
    └── commands/
        └── starter.md
```

---

## 各ファイルの責務

| ファイル | 責務 |
|---|---|
| `src/types/index.ts` | `Card`・`AppMode` などアプリ全体で使う型を一元管理 |
| `src/hooks/useCards.ts` | カードの追加・編集・削除・並び替え・localStorage 読み書き |
| `src/App.tsx` | `AppMode` に応じて表示コンポーネントを切り替えるルーティング |
| `src/components/CardEditor/` | カード追加・編集フォームのUI・バリデーション表示 |
| `src/components/CardList/` | 登録済みカード一覧の表示・編集/削除ボタン |
| `src/components/StudyMode/` | 1枚ずつ表示・タップで裏返し・次へ進む学習モードUI |
| `src/components/Summary/` | 全カード終了後のまとめ画面（枚数・再学習ボタン） |
| `src/utils/csvImport.ts` | CSV文字列をパースして `Card[]` に変換するピュア関数 |

---

## 画面遷移

```
[一覧画面 (list)]
  ├─ カード追加ボタン → [編集画面 (editor)]
  ├─ カード編集ボタン → [編集画面 (editor)]
  └─ 学習開始ボタン  → [学習モード (study)]
                            └─ 全枚完了 → [まとめ画面 (summary)]
                                              └─ もう一度 → [学習モード (study)]
                                              └─ 一覧へ  → [一覧画面 (list)]
```

---

## TypeScript 移行メモ

現在のテンプレートは `.jsx` / `.js` 構成のため、以下のファイルを変換・追加する：

- `src/App.jsx` → `src/App.tsx`（削除して新規作成）
- `src/main.jsx` → `src/main.tsx`（削除して新規作成）
- `vite.config.js` → `vite.config.ts`（削除して新規作成）
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` を新規作成
- `package.json` に TypeScript 関連 devDependency を追加
