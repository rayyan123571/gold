import { useTranslation } from 'react-i18next'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useClientStore } from '@/stores/clientStore'
import { EditableCell } from './EditableCell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, memo } from 'react'

const UDHAAR_COLS = [
  { key: 'label', labelEn: '', labelUr: '' },
  { key: 'wazan', labelEn: 'Weight (g)', labelUr: 'سونے کا وزن' },
  { key: 'point', labelEn: 'Point', labelUr: 'پوائنٹ' },
  { key: 'khaalis', labelEn: 'Pure Gold', labelUr: 'خالص سونا' },
  { key: 'rate', labelEn: 'Rate', labelUr: 'ریٹ' },
  { key: 'qeemat', labelEn: 'Price', labelUr: 'قیمت' },
]

const UDHAAR_ROWS = [
  { key: 'farokht' as const, labelEn: 'Sold (Udhaar)', labelUr: 'خالص سونا ادھار فروخت کیا' },
  { key: 'khareed' as const, labelEn: 'Bought (Udhaar)', labelUr: 'خالص سونا ادھار خریدا' },
]

export const UdhaarLedger = memo(function UdhaarLedger() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { udhaar, updateUdhaarRow, sonaTotal, cashTotal } = useLedgerStore()
  const selectedClient = useClientStore((s) => s.selectedClient)

  useEffect(() => {
    if (selectedClient?.id) {
      useLedgerStore.getState().loadUdhaar(selectedClient.id)
    }
  }, [selectedClient?.id])

  const handleChange = (row: keyof typeof udhaar, field: keyof (typeof udhaar)[typeof row], value: number) => {
    updateUdhaarRow(row, field, value)
  }

  return (
    <Card className="border-amber-200 dark:border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400">
          {isUrdu ? 'ادھار لیجر' : 'Udhaar Ledger'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
      <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-amber-200 dark:border-zinc-700">
            {UDHAAR_COLS.map((col) => (
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
          {UDHAAR_ROWS.map((row) => {
            const data = udhaar[row.key]
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
                  <EditableCell value={data.wazan} onChange={(v) => handleChange(row.key, 'wazan', v)} />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell value={data.point} onChange={(v) => handleChange(row.key, 'point', v)} />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell value={data.khaalis} onChange={(v) => handleChange(row.key, 'khaalis', v)} />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell value={data.rate} onChange={(v) => handleChange(row.key, 'rate', v)} />
                </td>
                <td className="px-2 py-1.5">
                  <EditableCell value={data.qeemat} onChange={(v) => handleChange(row.key, 'qeemat', v)} />
                </td>
              </tr>
            )
          })}

          {/* Cash rows */}
          <tr className="border-b border-amber-100 dark:border-zinc-800 hover:bg-amber-50/50 dark:hover:bg-zinc-800/50">
            <td className="px-2 py-1.5 text-sm font-medium whitespace-nowrap" dir={isUrdu ? 'rtl' : 'ltr'}>
              {isUrdu ? 'کیش لیا' : 'Cash Received'}
            </td>
            <td colSpan={2} className="px-2 py-1.5">
              <EditableCell value={udhaar.farokht.cash_lia} onChange={(v) => handleChange('farokht', 'cash_lia', v)} />
            </td>
            <td colSpan={3} className="px-2 py-1.5">
              <EditableCell value={udhaar.khareed.cash_lia} onChange={(v) => handleChange('khareed', 'cash_lia', v)} />
            </td>
          </tr>
          <tr className="border-b border-amber-100 dark:border-zinc-800 hover:bg-amber-50/50 dark:hover:bg-zinc-800/50">
            <td className="px-2 py-1.5 text-sm font-medium whitespace-nowrap" dir={isUrdu ? 'rtl' : 'ltr'}>
              {isUrdu ? 'کیش دیا' : 'Cash Given'}
            </td>
            <td colSpan={2} className="px-2 py-1.5">
              <EditableCell value={udhaar.farokht.cash_dia} onChange={(v) => handleChange('farokht', 'cash_dia', v)} />
            </td>
            <td colSpan={3} className="px-2 py-1.5">
              <EditableCell value={udhaar.khareed.cash_dia} onChange={(v) => handleChange('khareed', 'cash_dia', v)} />
            </td>
          </tr>

          {/* Total row */}
          <tr className="bg-amber-100/50 dark:bg-zinc-800/50 font-semibold">
            <td className="px-2 py-2 text-sm whitespace-nowrap" dir={isUrdu ? 'rtl' : 'ltr'}>
              {isUrdu ? 'کل' : 'Total'}
            </td>
            <td colSpan={2} className="px-2 py-2 text-xs">
              <span dir={isUrdu ? 'rtl' : 'ltr'}>
                {isUrdu ? 'سونا لین دین' : 'Gold Balance'}: {sonaTotal.toFixed(3)}
              </span>
            </td>
            <td colSpan={3} className="px-2 py-2 text-xs">
              <span dir={isUrdu ? 'rtl' : 'ltr'}>
                {isUrdu ? 'کیش لین دین' : 'Cash Balance'}: {cashTotal.toFixed(2)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      </CardContent>
    </Card>
  )
})
