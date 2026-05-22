# glossary.md

作成日：2026-05-22

---

## 型定義

### `Card`

カード1枚を表すデータ型。

```ts
type Card = {
  id: string;       // UUID（crypto.randomUUID()で生成）
  front: string;    // 表面テキスト（問い）
  back: string;     // 裏面テキスト（答え）
  createdAt: number; // 作成日時（Date.now()のミリ秒）
};
```

### `AppMode`

アプリの現在画面を表すユニオン型。

```ts
type AppMode = 'list' | 'editor' | 'study' | 'summary';
```

---

## 変数・状態名

| 名前 | 型 | 説明 |
|---|---|---|
| `cards` | `Card[]` | 登録済みカードの配列 |
| `mode` | `AppMode` | 現在表示中の画面 |
| `editingCard` | `Card \| null` | 編集中のカード（新規追加時は null） |
| `currentIndex` | `number` | 学習モードで現在表示中のカードのインデックス |
| `isFlipped` | `boolean` | 学習モードでカードが裏返し状態かどうか |

---

## 関数・フック名

| 名前 | 場所 | 説明 |
|---|---|---|
| `useCards` | `src/hooks/useCards.ts` | カード CRUD と localStorage 永続化をまとめたカスタムフック |
| `addCard` | `useCards` の戻り値 | 新規カードを追加する |
| `updateCard` | `useCards` の戻り値 | 既存カードを上書き更新する |
| `deleteCard` | `useCards` の戻り値 | 指定 ID のカードを削除する |
| `importCards` | `useCards` の戻り値 | パース済み `Card[]` を既存リストに追加する |
| `parseCSV` | `src/utils/csvImport.ts` | CSV文字列を `Omit<Card, 'id' \| 'createdAt'>[]` に変換するピュア関数 |

---

## UI 用語（表示テキスト）

| 用語 | 使用箇所 | 説明 |
|---|---|---|
| 表（おもて） | CardEditor, StudyMode | カードの問い側 |
| 裏（うら） | CardEditor, StudyMode | カードの答え側 |
| 学習モード | App, CardList | StudyMode 画面のラベル |
| まとめ | Summary | 全カード終了後の画面ラベル |
| CSVインポート | CardList | CSV ファイル読み込み機能のボタンラベル |
| タップして裏返す | StudyMode | カードめくり操作の案内テキスト |

---

## localStorage キー

| キー | 型 | 説明 |
|---|---|---|
| `flashcard_cards` | `Card[]`（JSON文字列） | 登録済みカードデータの永続化先 |

---

## CSV フォーマット

- 1行 = 1カード
- カンマ区切り2列：`表テキスト,裏テキスト`
- ヘッダー行なし
- 空行は無視する
- 例：`東京,Tokyo`
