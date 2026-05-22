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
