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
