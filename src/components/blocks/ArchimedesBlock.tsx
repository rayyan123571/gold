import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EditableCell } from '@/components/ledger/EditableCell'
import { gramsToTolaMashaRati, TOLA_IN_GRAMS } from '@/utils/goldUtils'
import { useArchimedesStore } from '@/stores/archimedesStore'
import { RotateCcw } from 'lucide-react'

const ROW_LABELS = ['local', 'copper', 'standard', 'silver', 'puresilver'] as const
type RowKey = (typeof ROW_LABELS)[number]

const ROW_LABEL_MAP: Record<RowKey, { en: string; ur: string }> = {
  local: { en: 'Local', ur: 'لوکل' },
  copper: { en: 'Copper', ur: 'کاپر' },
  standard: { en: 'Standard', ur: 'سٹینڈرڈ' },
  silver: { en: 'Silver', ur: 'سلور' },
  puresilver: { en: 'Pure Silver', ur: 'پیور سلور' },
}

const DENSITIES: Record<RowKey, number> = {
  local: 14.0,
  copper: 8.96,
  standard: 14.0,
  silver: 10.5,
  puresilver: 10.5,
}

interface RowData {
  khaalis: number
  milawatFiGram: number
  milawatFiTola: number
  goldRate: number
  laabCharges: number
  total: number
  baqi: number
  parchi: boolean
}

const emptyRow = (): RowData => ({
  khaalis: 0,
  milawatFiGram: 0,
  milawatFiTola: 0,
  goldRate: 0,
  laabCharges: 0,
  total: 0,
  baqi: 0,
  parchi: false,
})

export function ArchimedesBlock() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'

  const [kandaWazan, setKandaWazan] = useState(0)
  const [paniWazan, setPaniWazan] = useState(0)
  const [rows, setRows] = useState<Record<RowKey, RowData>>({
    local: emptyRow(),
    copper: emptyRow(),
    standard: emptyRow(),
    silver: emptyRow(),
    puresilver: emptyRow(),
  })

  useEffect(() => {
    if (kandaWazan <= 0 || paniWazan <= 0 || kandaWazan <= paniWazan) return

    const volume = kandaWazan - paniWazan

    setRows((prev) => {
      const next = { ...prev }
      for (const key of ROW_LABELS) {
        const density = DENSITIES[key]
        const khaalis = volume * density
        const milawat = kandaWazan - khaalis
        const milawatFiGram = khaalis > 0 ? milawat / khaalis : 0
        const milawatFiTola = milawatFiGram * TOLA_IN_GRAMS

        next[key] = {
          ...next[key],
          khaalis: Number(khaalis.toFixed(4)),
          milawatFiGram: Number(milawatFiGram.toFixed(4)),
          milawatFiTola: Number(milawatFiTola.toFixed(4)),
        }
      }
      return next
    })
  }, [kandaWazan, paniWazan])

  const updateRow = (key: RowKey, field: keyof RowData, value: number | boolean) => {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const handleReset = () => {
    setKandaWazan(0)
    setPaniWazan(0)
    setRows({
      local: emptyRow(),
      copper: emptyRow(),
      standard: emptyRow(),
      silver: emptyRow(),
      puresilver: emptyRow(),
    })
    useArchimedesStore.getState().selectRow(null)
  }

  const kandaConverted = gramsToTolaMashaRati(kandaWazan)
  const paniConverted = gramsToTolaMashaRati(paniWazan)

  return (
    <div className="space-y-4">
      {/* Block 2 — Input */}
      <div className="p-3 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
        <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2">
          {isUrdu ? 'آرکیمیڈیز — ان پٹ' : 'Archimedes — Input'}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              {isUrdu ? 'وزن کاندے پر (گرام)' : 'Weight on scale (g)'}
            </label>
            <Input className="h-8" type="number" value={kandaWazan ?? ''} onChange={(e) => setKandaWazan(Number(e.target.value))} />
            <span className="text-[10px] text-muted-foreground">
              {kandaConverted.tola}T {kandaConverted.masha}M {kandaConverted.rati}R
            </span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              {isUrdu ? 'وزن پانی میں (گرام)' : 'Weight in water (g)'}
            </label>
            <Input className="h-8" type="number" value={paniWazan ?? ''} onChange={(e) => setPaniWazan(Number(e.target.value))} />
            <span className="text-[10px] text-muted-foreground">
              {paniConverted.tola}T {paniConverted.masha}M {paniConverted.rati}R
            </span>
          </div>
        </div>
      </div>

      {/* Block 3 — Results Table */}
      <div className="overflow-x-auto p-3 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-400">
            {isUrdu ? 'آرکیمیڈیز — نتائج' : 'Archimedes — Results'}
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-amber-200 dark:border-zinc-700">
              <th className="px-1 py-1 text-left">{isUrdu ? 'دھات' : 'Metal'}</th>
              <th className="px-1 py-1">{isUrdu ? 'خالص (گرام)' : 'Pure (g)'}</th>
              <th className="px-1 py-1">{isUrdu ? 'ملاوٹ/گرام' : 'Milawat/g'}</th>
              <th className="px-1 py-1">{isUrdu ? 'ملاوٹ/تولہ' : 'Milawat/Tola'}</th>
              <th className="px-1 py-1">{isUrdu ? 'تولہ' : 'Tola'}</th>
              <th className="px-1 py-1">{isUrdu ? 'ماشہ' : 'Masha'}</th>
              <th className="px-1 py-1">{isUrdu ? 'ریٹی' : 'Rati'}</th>
              <th className="px-1 py-1">{isUrdu ? 'ریٹ' : 'Rate'}</th>
              <th className="px-1 py-1">{isUrdu ? 'چارجز' : 'Charges'}</th>
              <th className="px-1 py-1">{isUrdu ? 'ٹوٹل' : 'Total'}</th>
              <th className="px-1 py-1">{isUrdu ? 'باقی' : 'Baqi'}</th>
              <th className="px-1 py-1">✓</th>
            </tr>
          </thead>
          <tbody>
            {ROW_LABELS.map((key) => {
              const row = rows[key]
              const weight = gramsToTolaMashaRati(row.khaalis)
              return (
                <tr key={key} className="border-b border-amber-100 dark:border-zinc-800 hover:bg-amber-50/50 dark:hover:bg-zinc-800/50">
                  <td className="px-1 py-1 font-medium whitespace-nowrap">
                    {isUrdu ? ROW_LABEL_MAP[key].ur : ROW_LABEL_MAP[key].en}
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell value={row.khaalis} onChange={(v) => updateRow(key, 'khaalis', v)} />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell value={row.milawatFiGram} onChange={(v) => updateRow(key, 'milawatFiGram', v)} />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell value={row.milawatFiTola} onChange={(v) => updateRow(key, 'milawatFiTola', v)} />
                  </td>
                  <td className="px-1 py-1 tabular-nums">{weight.tola}</td>
                  <td className="px-1 py-1 tabular-nums">{weight.masha}</td>
                  <td className="px-1 py-1 tabular-nums">{weight.rati}</td>
                  <td className="px-1 py-1">
                    <EditableCell value={row.goldRate} onChange={(v) => updateRow(key, 'goldRate', v)} />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell value={row.laabCharges} onChange={(v) => updateRow(key, 'laabCharges', v)} />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell value={row.total} onChange={(v) => updateRow(key, 'total', v)} />
                  </td>
                  <td className="px-1 py-1">
                    <EditableCell value={row.baqi} onChange={(v) => updateRow(key, 'baqi', v)} />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={row.parchi}
                      onChange={(e) => {
                        const checked = e.target.checked
                        const newRows = { ...rows }
                        for (const k of ROW_LABELS) {
                          newRows[k] = { ...newRows[k], parchi: k === key ? checked : false }
                        }
                        setRows(newRows)
                        if (checked) {
                          useArchimedesStore.getState().selectRow({
                            khaalis: row.khaalis,
                            milawatFiGram: row.milawatFiGram,
                            milawatFiTola: row.milawatFiTola,
                            goldRate: row.goldRate,
                            laabCharges: row.laabCharges,
                            total: row.total,
                            baqi: row.baqi,
                          })
                        } else {
                          useArchimedesStore.getState().selectRow(null)
                        }
                      }}
                      className="accent-amber-600"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
