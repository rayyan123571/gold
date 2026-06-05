import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/db/db'
import { X, Search, Hash, User, FileText, BarChart3, Gem, CircleDollarSign, Beaker, ClipboardList } from 'lucide-react'

type ActionType =
  | 'udhaar_lena'
  | 'udhaar_dena'
  | 'sona_cash_dia'
  | 'udhaar_lia'
  | 'naqad'
  | 'sona_khareed'
  | 'sona_farokht'
  | 'lab_tafseel'
  | 'takhleel_tafseel'
  | 'lab_parchoon'
  | 'lab_parchi'

const ACTIONS: { key: ActionType; labelUr: string; labelEn: string; icon: typeof FileText }[] = [
  { key: 'udhaar_lena', labelUr: 'ادھار لینا ہے', labelEn: 'Udhaar Lena Ha', icon: CircleDollarSign },
  { key: 'udhaar_dena', labelUr: 'ادھار دینا ہے', labelEn: 'Udhaar Dena Ha', icon: CircleDollarSign },
  { key: 'sona_cash_dia', labelUr: 'سونا اور کیش ادھار دیا', labelEn: 'Sona & Cash Udhaar Dia', icon: Gem },
  { key: 'udhaar_lia', labelUr: 'ادھار لیا', labelEn: 'Udhaar Lia', icon: CircleDollarSign },
  { key: 'naqad', labelUr: 'نقد', labelEn: 'Naqad', icon: FileText },
  { key: 'sona_khareed', labelUr: 'سونا خرید', labelEn: 'Sona Khareed', icon: Gem },
  { key: 'sona_farokht', labelUr: 'سونا فروخت', labelEn: 'Sona Farokht', icon: Gem },
  { key: 'lab_tafseel', labelUr: 'لاب تفصیل', labelEn: 'Lab Tafseel', icon: BarChart3 },
  { key: 'takhleel_tafseel', labelUr: 'تحلیل تفصیل', labelEn: 'Takhleel Tafseel', icon: Beaker },
]

const LAB_ACTIONS: { key: ActionType; labelUr: string; labelEn: string }[] = [
  { key: 'lab_parchoon', labelUr: 'لاب پرچون خریدا ہے', labelEn: 'Lab Parchoon Khareeda Ha' },
  { key: 'lab_parchi', labelUr: 'لاب کی صرف پرچی بنائی ہے', labelEn: 'Lab Ki Sirf Parchi Bnai Ha' },
]

interface Column {
  key: string
  label: string
  render: (row: Record<string, unknown>) => string | number
}

type Fetcher = (nameFilter: string) => Promise<{ columns: Column[]; rows: Record<string, unknown>[] }>

const fetchers: Record<ActionType, Fetcher> = {
  udhaar_lena: async (nameFilter) => {
    let data = await db.udhaar_receipts.filter((r) => r.sona_lia > 0).toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'sona_lia', label: 'Sona Lia', render: (r) => (r.sona_lia as number).toFixed(3) },
        { key: 'cash_lia', label: 'Cash Lia', render: (r) => (r.cash_lia as number).toFixed(2) },
        { key: 'baqi', label: 'Baqi', render: (r) => (r.baqi as number).toFixed(3) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  udhaar_dena: async (nameFilter) => {
    let data = await db.udhaar_receipts.filter((r) => r.sona_dia > 0).toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'sona_dia', label: 'Sona Dia', render: (r) => (r.sona_dia as number).toFixed(3) },
        { key: 'cash_dia', label: 'Cash Dia', render: (r) => (r.cash_dia as number).toFixed(2) },
        { key: 'baqi', label: 'Baqi', render: (r) => (r.baqi as number).toFixed(3) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  sona_cash_dia: async (nameFilter) => {
    let data = await db.udhaar_receipts.filter((r) => r.sona_dia > 0 || r.cash_dia > 0).toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'sona_dia', label: 'Sona Dia', render: (r) => (r.sona_dia as number).toFixed(3) },
        { key: 'cash_dia', label: 'Cash Dia', render: (r) => (r.cash_dia as number).toFixed(2) },
        { key: 'baqi_sona', label: 'Baqi Sona', render: (r) => (r.baqi as number).toFixed(3) },
        { key: 'baqi_cash', label: 'Baqi Cash', render: (r) => (r.baqi_cash as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  udhaar_lia: async (nameFilter) => {
    let data = await db.udhaar_receipts.filter((r) => r.cash_lia > 0 || r.sona_lia > 0).toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'sona_lia', label: 'Sona Lia', render: (r) => (r.sona_lia as number).toFixed(3) },
        { key: 'cash_lia', label: 'Cash Lia', render: (r) => (r.cash_lia as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  naqad: async (nameFilter) => {
    let data = await db.naqad_receipts.toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'type', label: 'Type', render: (r) => r.type as string },
        { key: 'wazan', label: 'Wazan', render: (r) => (r.wazan as number).toFixed(3) },
        { key: 'khaalis', label: 'Khaalis', render: (r) => (r.khaalis as number).toFixed(3) },
        { key: 'qeemat', label: 'Qeemat', render: (r) => (r.qeemat as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  sona_khareed: async (nameFilter) => {
    let data = await db.naqad_receipts.filter((r) => r.type === 'buy').toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'wazan', label: 'Wazan', render: (r) => (r.wazan as number).toFixed(3) },
        { key: 'khaalis', label: 'Khaalis', render: (r) => (r.khaalis as number).toFixed(3) },
        { key: 'rate', label: 'Rate', render: (r) => (r.rate_tola as number).toFixed(2) },
        { key: 'qeemat', label: 'Qeemat', render: (r) => (r.qeemat as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  sona_farokht: async (nameFilter) => {
    let data = await db.naqad_receipts.filter((r) => r.type === 'sell').toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'wazan', label: 'Wazan', render: (r) => (r.wazan as number).toFixed(3) },
        { key: 'khaalis', label: 'Khaalis', render: (r) => (r.khaalis as number).toFixed(3) },
        { key: 'rate', label: 'Rate', render: (r) => (r.rate_tola as number).toFixed(2) },
        { key: 'qeemat', label: 'Qeemat', render: (r) => (r.qeemat as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  lab_tafseel: async (nameFilter) => {
    let data = await db.laab_receipts.toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'amad_wazan', label: 'Amad Wazan', render: (r) => (r.amad_wazan as number).toFixed(3) },
        { key: 'khaalis_wazan', label: 'Khaalis Wazan', render: (r) => (r.khaalis_wazan as number).toFixed(3) },
        { key: 'total', label: 'Total', render: (r) => (r.total as number).toFixed(2) },
        { key: 'charges', label: 'Charges', render: (r) => (r.charges as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  takhleel_tafseel: async (nameFilter) => {
    const naqad = await db.naqad_receipts.toArray()
    const udhaar = await db.udhaar_receipts.toArray()
    const laab = await db.laab_receipts.toArray()
    const rows: Record<string, unknown>[] = []
    for (const r of naqad) {
      if (nameFilter && !r.naam.toLowerCase().includes(nameFilter)) continue
      rows.push({ date: r.date, raseed_no: `#${r.raseed_no}`, naam: r.naam, type: `Naqad ${r.type}`, amount: r.qeemat })
    }
    for (const r of udhaar) {
      if (nameFilter && !r.naam.toLowerCase().includes(nameFilter)) continue
      if (r.baqi_cash > 0) rows.push({ date: r.date, raseed_no: `#${r.raseed_no}`, naam: r.naam, type: 'Udhaar Baqi', amount: r.baqi_cash })
    }
    for (const r of laab) {
      if (nameFilter && !r.naam.toLowerCase().includes(nameFilter)) continue
      rows.push({ date: r.date, raseed_no: `#${r.raseed_no}`, naam: r.naam, type: 'Laab', amount: r.total })
    }
    rows.sort((a, b) => (a.date as string).localeCompare(b.date as string))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => r.raseed_no as string },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'type', label: 'Type', render: (r) => r.type as string },
        { key: 'amount', label: 'Amount', render: (r) => (r.amount as number).toFixed(2) },
      ],
      rows,
    }
  },
  lab_parchoon: async (nameFilter) => {
    let data = await db.laab_receipts.toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'amad_wazan', label: 'Amad Wazan', render: (r) => (r.amad_wazan as number).toFixed(3) },
        { key: 'khaalis_wazan', label: 'Khaalis Wazan', render: (r) => (r.khaalis_wazan as number).toFixed(3) },
        { key: 'total', label: 'Total', render: (r) => (r.total as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
  lab_parchi: async (nameFilter) => {
    let data = await db.laab_receipts.toArray()
    if (nameFilter) data = data.filter((r) => r.naam.toLowerCase().includes(nameFilter))
    return {
      columns: [
        { key: 'date', label: 'Date', render: (r) => r.date as string },
        { key: 'raseed_no', label: 'Raseed No', render: (r) => `#${r.raseed_no}` },
        { key: 'naam', label: 'Naam', render: (r) => r.naam as string },
        { key: 'time', label: 'Time', render: (r) => r.time as string },
        { key: 'total', label: 'Total', render: (r) => (r.total as number).toFixed(2) },
      ],
      rows: data as unknown as Record<string, unknown>[],
    }
  },
}

export function UdhaarWindow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'

  const [customerCode, setCustomerCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [activeAction, setActiveAction] = useState<ActionType | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [raseedResult, setRaseedResult] = useState('')

  const fetchData = useCallback(async (action: ActionType) => {
    setActiveAction(action)
    setLoading(true)
    try {
      const filter = customerName.toLowerCase()
      const result = await fetchers[action](filter)
      setColumns(result.columns)
      setRows(result.rows)
    } finally {
      setLoading(false)
    }
  }, [customerName])

  const handleFindRaseed = async () => {
    const q = customerName.toLowerCase()
    const results: string[] = []

    const naqad = await db.naqad_receipts.filter((r) => r.naam.toLowerCase().includes(q)).toArray()
    naqad.forEach((r) => results.push(`Naqad #${r.raseed_no} — ${r.date}`))

    const udhaar = await db.udhaar_receipts.filter((r) => r.naam.toLowerCase().includes(q)).toArray()
    udhaar.forEach((r) => results.push(`Udhaar #${r.raseed_no} — ${r.date}`))

    const laab = await db.laab_receipts.filter((r) => r.naam.toLowerCase().includes(q)).toArray()
    laab.forEach((r) => results.push(`Laab #${r.raseed_no} — ${r.date}`))

    const wasooli = await db.wasooli_receipts.filter((r) => r.naam.toLowerCase().includes(q)).toArray()
    wasooli.forEach((r) => results.push(`Wasooli #${r.raseed_no} — ${r.date_time}`))

    setRaseedResult(results.length > 0 ? results.join('\n') : (isUrdu ? 'کوئی رسید نہیں ملی' : 'No receipts found'))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-6xl mx-4 max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-amber-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400">
            {isUrdu ? 'ادھار ونڈو' : 'Udhaar Window'}
          </h2>
          <Button size="sm" variant="ghost" className="h-8" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-72 border-r border-amber-200 dark:border-zinc-700 p-3 space-y-3 overflow-y-auto shrink-0">
            <div className="space-y-2">
              <div className="relative">
                <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-8 pl-7 text-xs"
                  placeholder={isUrdu ? 'کسٹمر کوڈ' : 'Customer Code'}
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-8 pl-7 text-xs"
                  placeholder={isUrdu ? 'کسٹمر نام' : 'Customer Name'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  dir="auto"
                />
              </div>
              <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={handleFindRaseed}>
                <Search className="h-3 w-3 mr-1" />
                {isUrdu ? 'رسید نمبر تلاش کریں' : 'Find Raseed'}
              </Button>
              {raseedResult && (
                <pre className="text-[10px] text-muted-foreground bg-amber-50 dark:bg-zinc-800 p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap">
                  {raseedResult}
                </pre>
              )}
            </div>

            <div className="border-t border-amber-200 dark:border-zinc-700 pt-3">
              <div className="grid grid-cols-1 gap-1">
                {ACTIONS.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant={activeAction === action.key ? 'default' : 'outline'}
                    className="h-7 justify-start text-[11px]"
                    onClick={() => fetchData(action.key)}
                  >
                    <action.icon className="h-3 w-3 mr-1.5 shrink-0" />
                    {isUrdu ? action.labelUr : action.labelEn}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t border-amber-200 dark:border-zinc-700 pt-3">
              <div className="grid grid-cols-1 gap-1">
                {LAB_ACTIONS.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant={activeAction === action.key ? 'default' : 'outline'}
                    className="h-7 justify-start text-[11px]"
                    onClick={() => fetchData(action.key)}
                  >
                    <ClipboardList className="h-3 w-3 mr-1.5 shrink-0" />
                    {isUrdu ? action.labelUr : action.labelEn}
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1 p-4 overflow-auto">
            {!activeAction && (
              <p className="text-center text-muted-foreground text-sm py-16">
                {isUrdu ? 'ایک آپشن منتخب کریں' : 'Select an option from the left'}
              </p>
            )}

            {loading && (
              <p className="text-center text-muted-foreground text-sm py-16">
                {isUrdu ? 'لوڈ ہو رہا ہے...' : 'Loading...'}
              </p>
            )}

            {!loading && activeAction && columns.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-200 dark:border-zinc-700">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                      {columns.map((col) => (
                        <th key={col.key} className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-amber-100 dark:border-zinc-800 hover:bg-amber-50/50 dark:hover:bg-zinc-800/50">
                        <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                        {columns.map((col) => (
                          <td key={col.key} className="px-3 py-1.5 whitespace-nowrap tabular-nums">
                            {col.render(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-muted-foreground">
                          {isUrdu ? 'کوئی ڈیٹا نہیں' : 'No data'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
