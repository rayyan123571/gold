import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useReceiptStore } from '@/stores/receiptStore'
import { useClientStore } from '@/stores/clientStore'
import { useShopStore } from '@/stores/shopStore'
import { useArchimedesStore } from '@/stores/archimedesStore'
import { useRateStore } from '@/stores/rateStore'
import { Save, RotateCcw, Printer, Eye, MessageCircle } from 'lucide-react'

export function WasooliReceipt() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { getNextRaseedNo, saveWasooliReceipt } = useReceiptStore()
  const selectedClient = useClientStore((s) => s.selectedClient)

  const [raseedNo, setRaseedNo] = useState(1)
  const [dateTime, setDateTime] = useState('')
  const [naam, setNaam] = useState('')
  const [rateFiTola, setRateFiTola] = useState(() => useRateStore.getState().rateTezabiFiTola)
  const [parchunWazan, setParchunWazan] = useState(0)
  const [khaalisWazan, setKhaalisWazan] = useState(0)
  const [ujratKaSona, setUjratKaSona] = useState(0)
  const [sonaDenaHa, setSonaDenaHa] = useState(0)
  const [cashDia, setCashDia] = useState(0)
  const [cashKaSona, setCashKaSona] = useState(0)
  const [ujratLeniha, setUjratLeniha] = useState(0)
  const [khaalisSonaDia, setKhaalisSonaDia] = useState(0)
  const [ujratWasool, setUjratWasool] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [baqi, setBaqi] = useState(0)



  useEffect(() => {
    const now = new Date()
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const time = now.toLocaleTimeString()
    setDateTime(`${date} ${time}`)
    getNextRaseedNo('wasooli').then(setRaseedNo)
  }, [getNextRaseedNo])

  const archimedes = useArchimedesStore((s) => s.selected)

  useEffect(() => {
    if (archimedes) {
      setKhaalisWazan(archimedes.khaalis)
      setRateFiTola(archimedes.goldRate)
    }
  }, [archimedes])

  useEffect(() => {
    if (selectedClient) setNaam(selectedClient.naam)
  }, [selectedClient])

  useEffect(() => {
    setBaqi(sonaDenaHa - ujratWasool)
  }, [sonaDenaHa, ujratWasool])



  const handleSave = async () => {
    await saveWasooliReceipt({
      raseed_no: raseedNo, date_time: dateTime, naam, rate_fi_tola: rateFiTola,
      parchun_wazan: parchunWazan, khaalis_wazan: khaalisWazan,
      ujrat_ka_sona: ujratKaSona, sona_dena_ha: sonaDenaHa,
      cash_dia: cashDia, cash_ka_sona: cashKaSona,
      ujrat_leni_ha: ujratLeniha, khaalis_sona_dia: khaalisSonaDia,
      ujrat_wasool: ujratWasool, discount, baqi,
    })
    useShopStore.getState().recalcTotals()
    handleReset()
  }

  const handleReset = () => {
    setRateFiTola(0); setParchunWazan(0); setKhaalisWazan(0); setUjratKaSona(0)
    setSonaDenaHa(0); setCashDia(0); setCashKaSona(0); setUjratLeniha(0)
    setKhaalisSonaDia(0); setUjratWasool(0); setDiscount(0)

    getNextRaseedNo('wasooli').then(setRaseedNo)
  }

  const handlePrint = () => window.print()
  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`وصولی رسید #${raseedNo}\nنام: ${naam}\nباقی: ${baqi}`)}`, '_blank')
  const handleView = () => alert(`Wasooli Receipt #${raseedNo}`)

  const Field = (props: { label: string; value: string | number; onChange?: (v: number) => void; readOnly?: boolean; dir?: string; small?: boolean }) => (
    <div className="flex items-center gap-1">
      <label className="text-[10px] text-muted-foreground min-w-[50px]">{props.label}</label>
      <Input className={`${props.small ? 'h-6 text-[10px]' : 'h-7 text-xs'}`} type="number" value={props.value} onChange={props.onChange ? (e) => props.onChange!(Number(e.target.value)) : undefined} readOnly={props.readOnly} dir={props.dir as 'ltr' | 'rtl' | 'auto' | undefined} />
    </div>
  )

  return (
    <div className="space-y-3 p-3 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 print-area">
      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">
        {isUrdu ? 'وصولی رسید' : 'Wasooli Receipt'}
      </h3>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'رسید نمبر' : 'Receipt No'}</label>
          <Input className="h-7 text-xs" value={raseedNo} readOnly />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'تاریخ/وقت' : 'Date/Time'}</label>
          <Input className="h-7 text-xs" value={dateTime} readOnly dir="ltr" />
        </div>
        <div className="flex items-center gap-1 col-span-2">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'نام' : 'Name'}</label>
          <Input className="h-7 text-xs" value={naam} onChange={(e) => setNaam(e.target.value)} dir="auto" />
        </div>

        <Field label={isUrdu ? 'ریٹ/تولہ' : 'Rate/Tola'} value={rateFiTola} onChange={setRateFiTola} />
        <Field label={isUrdu ? 'پرچوں وزن' : 'Parchun Wt'} value={parchunWazan} onChange={setParchunWazan} />
        <Field label={isUrdu ? 'خالص وزن' : 'Khaalis Wt'} value={khaalisWazan} onChange={setKhaalisWazan} />
        <Field label={isUrdu ? 'اجرت کا سونا' : 'Ujrat Sona'} value={ujratKaSona} onChange={setUjratKaSona} />
        <Field label={isUrdu ? 'سونا دینا ہے' : 'Sona Dena'} value={sonaDenaHa} onChange={setSonaDenaHa} />
        <Field label={isUrdu ? 'کیش دیا' : 'Cash Dia'} value={cashDia} onChange={setCashDia} />
        <Field label={isUrdu ? 'کیش کا سونا' : 'Cash Sona'} value={cashKaSona} onChange={setCashKaSona} />
        <Field label={isUrdu ? 'اجرت لینی' : 'Ujrat leni'} value={ujratLeniha} onChange={setUjratLeniha} />
        <Field label={isUrdu ? 'خالص سونا دیا' : 'Khaalis Dia'} value={khaalisSonaDia} onChange={setKhaalisSonaDia} />
        <Field label={isUrdu ? 'اجرت وصول' : 'Ujrat Wasool'} value={ujratWasool} onChange={setUjratWasool} />
        <Field label={isUrdu ? 'ڈسکاؤنٹ' : 'Discount'} value={discount} onChange={setDiscount} />
        <Field label={isUrdu ? 'باقی' : 'Baqi'} value={baqi.toFixed(3)} readOnly />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" className="h-7 text-xs" onClick={handleSave}><Save className="h-3 w-3 mr-1" />{isUrdu ? 'محفوظ' : 'Save'}</Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleReset}><RotateCcw className="h-3 w-3 mr-1" />{isUrdu ? 'ری سیٹ' : 'Reset'}</Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handlePrint}><Printer className="h-3 w-3 mr-1" />{isUrdu ? 'پرنٹ' : 'Print'}</Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleView}><Eye className="h-3 w-3 mr-1" />{isUrdu ? 'دیکھیں' : 'View'}</Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleWhatsApp}><MessageCircle className="h-3 w-3 mr-1" />{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</Button>
      </div>
    </div>
  )
}
