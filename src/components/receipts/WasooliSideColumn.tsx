import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

export function WasooliSideColumn() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'

  const [parchunLia, setParchunLia] = useState(0)
  const [kulUjrat, setKulUjrat] = useState(0)
  const [ujratKaSonaSide, setUjratKaSonaSide] = useState(0)
  const [ujratKiRaqam, setUjratKiRaqam] = useState(0)
  const [ujratWasoolSide, setUjratWasoolSide] = useState(0)
  const [discountSide, setDiscountSide] = useState(0)
  const [sonaDenaHaSide, setSonaDenaHaSide] = useState(0)
  const [cashDiaSide, setCashDiaSide] = useState(0)
  const [sonaDiaSide, setSonaDiaSide] = useState(0)

  const Field = (props: { label: string; value: string | number; onChange?: (v: number) => void; readOnly?: boolean; dir?: string }) => (
    <div className="flex items-center gap-1">
      <label className="text-[10px] text-muted-foreground min-w-[50px]">{props.label}</label>
      <Input className="h-6 text-[10px]" type="number" value={props.value} onChange={props.onChange ? (e) => props.onChange!(Number(e.target.value)) : undefined} readOnly={props.readOnly} dir={props.dir as 'ltr' | 'rtl' | 'auto' | undefined} />
    </div>
  )

  return (
    <div className="p-3 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 space-y-1.5">
      <p className="text-[10px] font-medium text-muted-foreground mb-1">{isUrdu ? 'سائیڈ کالم' : 'Side Column'}</p>
      <Field small label={isUrdu ? 'پرچوں لیا' : 'Parchun'} value={parchunLia} onChange={setParchunLia} />
      <Field small label={isUrdu ? 'کل اجرت' : 'Total Ujrat'} value={kulUjrat} onChange={setKulUjrat} />
      <Field small label={isUrdu ? 'اجرت کا سونا' : 'Ujrat Sona'} value={ujratKaSonaSide} onChange={setUjratKaSonaSide} />
      <Field small label={isUrdu ? 'اجرت رقم' : 'Ujrat Cash'} value={ujratKiRaqam} onChange={setUjratKiRaqam} />
      <Field small label={isUrdu ? 'اجرت وصول' : 'Ujrat Wasool'} value={ujratWasoolSide} onChange={setUjratWasoolSide} />
      <Field small label={isUrdu ? 'ڈسکاؤنٹ' : 'Discount'} value={discountSide} onChange={setDiscountSide} />
      <Field small label={isUrdu ? 'سونا دینا' : 'Sona Dena'} value={sonaDenaHaSide} onChange={setSonaDenaHaSide} />
      <Field small label={isUrdu ? 'کیش دیا' : 'Cash Dia'} value={cashDiaSide} onChange={setCashDiaSide} />
      <Field small label={isUrdu ? 'سونا دیا' : 'Sona Dia'} value={sonaDiaSide} onChange={setSonaDiaSide} />
    </div>
  )
}
