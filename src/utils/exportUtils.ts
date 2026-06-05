import { db } from '@/db/db'

export async function exportToCSV(tableName: string, data: Record<string, unknown>[]): Promise<void> {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]

  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h]
      const str = String(val ?? '')
      return str.includes(',') ? `"${str}"` : str
    })
    csvRows.push(values.join(','))
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${tableName}-${Date.now()}.csv`)
}

export async function exportAllToJSON(): Promise<void> {
  const data: Record<string, unknown[]> = {}

  const tables = ['accounts', 'clients', 'naqad_entries', 'udhaar_entries', 'roznamcha',
    'naqad_receipts', 'udhaar_receipts', 'laab_receipts', 'wasooli_receipts', 'shop_totals'] as const

  for (const table of tables) {
    const tb = (db as unknown as Record<string, { toArray: () => Promise<unknown[]> }>)[table]
    if (tb?.toArray) {
      data[table] = await tb.toArray()
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `gold-ledger-backup-${Date.now()}.json`)
}

export async function importFromJSON(file: File): Promise<string> {
  const text = await file.text()
  const data = JSON.parse(text)

  const tables = ['accounts', 'clients', 'naqad_entries', 'udhaar_entries', 'roznamcha',
    'naqad_receipts', 'udhaar_receipts', 'laab_receipts', 'wasooli_receipts', 'shop_totals'] as const

  let count = 0
  for (const table of tables) {
    const records = data[table]
    if (Array.isArray(records)) {
      const tb = (db as unknown as Record<string, { clear: () => Promise<void>; bulkAdd: (items: unknown[]) => Promise<void> }>)[table]
      if (tb?.clear && tb?.bulkAdd) {
        await tb.clear()
        await tb.bulkAdd(records)
        count += records.length
      }
    }
  }

  return `Imported ${count} records from ${Object.keys(data).length} tables`
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
