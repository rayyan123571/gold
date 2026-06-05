import { useTranslation } from 'react-i18next'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useClientStore } from '@/stores/clientStore'
import { EditableCell } from './EditableCell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, memo } from 'react'

const NAQAD_COLS = [
  { key: 'label', labelEn: '', labelUr: '' },
  { key: 'wazan', labelEn: 'Weight (g)', labelUr: 'سونے کا وزن' },
  { key: 'point', labelEn: 'Point', labelUr: 'پوائنٹ' },
  { key: 'khaalis', labelEn: 'Pure Gold', labelUr: 'خالص سونا' },
  { key: 'rate', labelEn: 'Rate', labelUr: 'ریٹ' },
  { key: 'qeemat', labelEn: 'Price', labelUr: 'قیمت' },
]

const ROWS = [
  { key: 'naqad' as const, labelEn: 'Cash', labelUr: 'نقد' },
  { key: 'farokht' as const, labelEn: 'Sold (Pure)', labelUr: 'خالص سونا نقد فروخت کیا' },
  { key: 'khareed' as const, labelEn: 'Bought (Pure)', labelUr: 'خالص سونا نقد خریدا' },
]

export const NaqadLedger = memo(function NaqadLedger() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { naqad, updateNaqadRow } = useLedgerStore()
  const selectedClient = useClientStore((s) => s.selectedClient)

  useEffect(() => {
    if (selectedClient?.id) {
      useLedgerStore.getState().loadNaqad(selectedClient.id)
    }
  }, [selectedClient?.id])

  const handleChange = (row: keyof typeof naqad, field: keyof (typeof naqad)[typeof row], value: number) => {
    updateNaqadRow(row, field, value)
  }

  return (
    <Card className="border-amber-200 dark:border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400">
          {isUrdu ? 'نقد لیجر' : 'Naqad Ledger'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
      <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-amber-200 dark:border-zinc-700">
            {NAQAD_COLS.map((col) => (
              <th
                key={col.key}
                className="px-2 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap"
                dir={isUrdu ? 'rtl' : 'ltr'}
              >
                {isUrdu ? col.labelUr : col.labelEn}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const data = naqad[row.key]
            const isLabelRow = row.key === 'naqad'
            return (
              <tr
                key={row.key}
                className="border-b border-amber-100 dark:border-zinc-800 hover:bg-amber-50/50 dark:hover:bg-zinc-800/50"
              >
                <td
                  className="px-2 py-1.5 text-sm font-medium whitespace-nowrap"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                >
                  {isUrdu ? row.labelUr : row.labelEn}
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell
                    value={data.wazan}
                    onChange={(v) => handleChange(row.key, 'wazan', v)}
                    readOnly={isLabelRow}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell
                    value={data.point}
                    onChange={(v) => handleChange(row.key, 'point', v)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell
                    value={data.khaalis}
                    onChange={(v) => handleChange(row.key, 'khaalis', v)}
                    readOnly={isLabelRow}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell
                    value={data.rate}
                    onChange={(v) => handleChange(row.key, 'rate', v)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell
                    value={data.qeemat}
                    onChange={(v) => handleChange(row.key, 'qeemat', v)}
                    readOnly={isLabelRow}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
      </CardContent>
    </Card>
  )
})
