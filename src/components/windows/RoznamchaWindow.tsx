import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/db/db'
import { Printer, Search, X } from 'lucide-react'

interface DailySummary {
  date: string
  taken: { label: string; amount: number }[]
  given: { label: string; amount: number }[]
  takenTotal: number
  givenTotal: number
}

export function RoznamchaWindow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [filteredSummaries, setFilteredSummaries] = useState<DailySummary[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    if (!open) return

    const load = async () => {
      const dailyMap = new Map<string, DailySummary>()

      const addEntry = (date: string, taken: { label: string; amount: number }[], given: { label: string; amount: number }[]) => {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, taken: [], given: [], takenTotal: 0, givenTotal: 0 })
        }
        const day = dailyMap.get(date)!
        for (const t of taken) {
          day.taken.push(t)
          day.takenTotal += t.amount
        }
        for (const g of given) {
          day.given.push(g)
          day.givenTotal += g.amount
        }
      }

      const naqad = await db.naqad_receipts.toArray()
      for (const r of naqad) {
        if (r.type === 'sell') {
          addEntry(r.date, [{ label: `Naqad Sell: ${r.naam} (#${r.raseed_no})`, amount: r.qeemat }], [])
        } else {
          addEntry(r.date, [], [{ label: `Naqad Buy: ${r.naam} (#${r.raseed_no})`, amount: r.qeemat }])
        }
      }

      const udhaar = await db.udhaar_receipts.toArray()
      for (const r of udhaar) {
        if (r.cash_lia > 0) {
          addEntry(r.date, [{ label: `Udhaar Cash Lia: ${r.naam} (#${r.raseed_no})`, amount: r.cash_lia }], [])
        }
        if (r.cash_dia > 0) {
          addEntry(r.date, [], [{ label: `Udhaar Cash Dia: ${r.naam} (#${r.raseed_no})`, amount: r.cash_dia }])
        }
        if (r.baqi_cash > 0) {
          addEntry(r.date, [], [{ label: `Udhaar Baqi: ${r.naam} (#${r.raseed_no})`, amount: r.baqi_cash }])
        }
      }

      const laab = await db.laab_receipts.toArray()
      for (const r of laab) {
        addEntry(r.date, [{ label: `Laab: ${r.naam} (#${r.raseed_no})`, amount: r.total }], [])
      }

      const wasooli = await db.wasooli_receipts.toArray()
      for (const r of wasooli) {
        const d = r.date_time.split(' ')[0]
        addEntry(d, [{ label: `Wasooli: ${r.naam} (#${r.raseed_no})`, amount: r.baqi }], [])
      }

      const sorted = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
      setSummaries(sorted)
      setFilteredSummaries(sorted)
    }

    load()
  }, [open])

  const handleFilter = () => {
    let result = summaries
    if (fromDate) result = result.filter((s) => s.date >= fromDate)
    if (toDate) result = result.filter((s) => s.date <= toDate)
    setFilteredSummaries(result)
  }

  const handlePrint = () => window.print()

  if (!open) return null

  const grandTaken = filteredSummaries.reduce((sum, s) => sum + s.takenTotal, 0)
  const grandGiven = filteredSummaries.reduce((sum, s) => sum + s.givenTotal, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-amber-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400">
            {isUrdu ? 'روزنامچہ' : 'Roznamcha'}
          </h2>
          <div className="flex items-center gap-2">
            <Input className="h-8 w-28 text-xs" type="text" placeholder={isUrdu ? 'از تاریخ' : 'From'} value={fromDate} onChange={(e) => setFromDate(e.target.value)} dir="ltr" />
            <Input className="h-8 w-28 text-xs" type="text" placeholder={isUrdu ? 'تا تاریخ' : 'To'} value={toDate} onChange={(e) => setToDate(e.target.value)} dir="ltr" />
            <Button size="sm" variant="outline" className="h-8" onClick={handleFilter}><Search className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" className="h-8" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredSummaries.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              {isUrdu ? 'کوئی اندراج نہیں' : 'No entries found'}
            </p>
          ) : (
            <div className="space-y-6">
              {filteredSummaries.map((day) => (
                <div key={day.date} className="border border-amber-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <div className="bg-amber-100 dark:bg-zinc-800 px-4 py-2 font-bold text-amber-800 dark:text-amber-400 text-sm" dir="ltr">
                    {day.date}
                  </div>

                  <div className="p-4 space-y-4">
                    {day.taken.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                          {isUrdu ? 'لیا' : 'Taken'} — {isUrdu ? 'آیا' : 'Received'}
                        </h4>
                        <div className="space-y-1">
                          {day.taken.map((t, i) => (
                            <div key={i} className="flex justify-between text-xs text-muted-foreground">
                              <span>{t.label}</span>
                              <span className="tabular-nums font-medium text-green-600 dark:text-green-400">+₨{t.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {day.given.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
                          {isUrdu ? 'دیا' : 'Given'} — {isUrdu ? 'گیا' : 'Paid out'}
                        </h4>
                        <div className="space-y-1">
                          {day.given.map((g, i) => (
                            <div key={i} className="flex justify-between text-xs text-muted-foreground">
                              <span>{g.label}</span>
                              <span className="tabular-nums font-medium text-red-600 dark:text-red-400">-₨{g.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-amber-200 dark:border-zinc-700 px-4 py-2 flex justify-between text-sm font-bold">
                    <span>
                      {isUrdu ? 'کل' : 'Net'}
                    </span>
                    <span className={day.takenTotal - day.givenTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      ₨{(day.takenTotal - day.givenTotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="border-2 border-amber-400 dark:border-amber-600 rounded-lg overflow-hidden sticky bottom-0">
                <div className="bg-amber-50 dark:bg-zinc-800 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-400">
                    {isUrdu ? 'کل مجموعہ' : 'Grand Total'}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {isUrdu ? 'کل لیا' : 'Total Taken'}: ₨{grandTaken.toFixed(2)}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {isUrdu ? 'کل دیا' : 'Total Given'}: ₨{grandGiven.toFixed(2)}
                    </div>
                    <div className="text-sm font-bold mt-1">
                      <span className={grandTaken - grandGiven >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {isUrdu ? 'خالص' : 'Net'}: ₨{(grandTaken - grandGiven).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
