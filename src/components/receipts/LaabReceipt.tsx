import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useReceiptStore } from '@/stores/receiptStore'
import { useClientStore } from '@/stores/clientStore'
import { useShopStore } from '@/stores/shopStore'
import { useArchimedesStore } from '@/stores/archimedesStore'
import { useRateStore } from '@/stores/rateStore'
import { gramsToTolaMashaRati, calcCaret, TOLA_IN_GRAMS } from '@/utils/goldUtils'
import { Save, RotateCcw, Printer, Eye, MessageCircle } from 'lucide-react'

export function LaabReceipt() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { getNextRaseedNo, saveLaabReceipt } = useReceiptStore()
  const selectedClient = useClientStore((s) => s.selectedClient)

  const [raseedNo, setRaseedNo] = useState(1)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [naam, setNaam] = useState('')
  const [amadWazan, setAmadWazan] = useState(0)
  const [milawatWazan, setMilawatWazan] = useState(0)
  const [khaalisWazan, setKhaalisWazan] = useState(0)
  const [milawatFiTola, setMilawatFiTola] = useState(0)
  const [milawatFiGram, setMilawatFiGram] = useState(0)
  const [caret, setCaret] = useState(0)
  const [rateFiTola, setRateFiTola] = useState(() => useRateStore.getState().rateTezabiFiTola)
  const [total, setTotal] = useState(0)
  const [charges, setCharges] = useState(() => useRateStore.getState().fiGramCharges)
  const [baqaya, setBaqaya] = useState(0)
  const [point, setPoint] = useState(100)
  const [rati, setRati] = useState(0)

  useEffect(() => {
    const now = new Date()
    setDate(`${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`)
    setTime(now.toLocaleTimeString())
    getNextRaseedNo('laab').then(setRaseedNo)
  }, [getNextRaseedNo])

  useEffect(() => {
    setKhaalisWazan(amadWazan - milawatWazan)
  }, [amadWazan, milawatWazan])

  useEffect(() => {
    setCaret(calcCaret(khaalisWazan, amadWazan || 1))
  }, [khaalisWazan, amadWazan])

  useEffect(() => {
    setTotal((khaalisWazan / TOLA_IN_GRAMS) * rateFiTola + charges)
  }, [khaalisWazan, rateFiTola, charges])

  const archimedes = useArchimedesStore((s) => s.selected)

  useEffect(() => {
    if (archimedes) {
      setKhaalisWazan(archimedes.khaalis)
      setMilawatFiTola(archimedes.milawatFiTola)
      setMilawatFiGram(archimedes.milawatFiGram)
      setRateFiTola(archimedes.goldRate)
      setCharges(archimedes.laabCharges)
      setBaqaya(archimedes.baqi)
    }
  }, [archimedes])

  useEffect(() => {
    if (selectedClient) setNaam(selectedClient.naam)
  }, [selectedClient])

  const amadConverted = gramsToTolaMashaRati(amadWazan)
  const milawatConverted = gramsToTolaMashaRati(milawatWazan)
  const khaalisConverted = gramsToTolaMashaRati(khaalisWazan)

  const handleSave = async () => {
    await saveLaabReceipt({
      raseed_no: raseedNo, date, time, naam,
      amad_wazan: amadWazan, milawat_wazan: milawatWazan, khaalis_wazan: khaalisWazan,
      milawat_fi_tola: milawatFiTola, milawat_fi_gram: milawatFiGram,
      caret, rate_fi_tola: rateFiTola, total, charges, baqaya, point, rati,
    })
    useShopStore.getState().recalcTotals()
    handleReset()
  }

  const handleReset = () => {
    setAmadWazan(0); setMilawatWazan(0); setCharges(0); setRateFiTola(0); setBaqaya(0); setRati(0)
    getNextRaseedNo('laab').then(setRaseedNo)
  }

  const handlePrint = () => window.print()
  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`لاب رسید #${raseedNo}\nنام: ${naam}\nخالص: ${khaalisWazan}g\nٹوٹل: ${total}`)}`, '_blank')
  const handleView = () => alert(`Laab Receipt #${raseedNo}`)

  return (
    <div className="space-y-3 p-3 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 print-area">
      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">
        {isUrdu ? 'لاب رسید' : 'Laab Receipt'}
      </h3>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'رسید نمبر' : 'Receipt No'}</label>
          <Input className="h-7 text-xs" value={raseedNo} readOnly />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'تاریخ' : 'Date'}</label>
          <Input className="h-7 text-xs" value={date} readOnly dir="ltr" />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'وقت' : 'Time'}</label>
          <Input className="h-7 text-xs" value={time} readOnly dir="ltr" />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'نام' : 'Name'}</label>
          <Input className="h-7 text-xs" value={naam} onChange={(e) => setNaam(e.target.value)} dir="auto" />
        </div>

        <div>
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'آمد وزن' : 'Amad Wt'}</label>
            <Input className="h-7 text-xs" type="number" value={amadWazan ?? ''} onChange={(e) => setAmadWazan(Number(e.target.value))} />
          </div>
          <span className="text-[9px] text-muted-foreground">{amadConverted.tola}T {amadConverted.masha}M {amadConverted.rati}R</span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'ملاوٹ وزن' : 'Milawat Wt'}</label>
            <Input className="h-7 text-xs" type="number" value={milawatWazan ?? ''} onChange={(e) => setMilawatWazan(Number(e.target.value))} />
          </div>
          <span className="text-[9px] text-muted-foreground">{milawatConverted.tola}T {milawatConverted.masha}M {milawatConverted.rati}R</span>
        </div>

        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'خالص وزن' : 'Khaalis'}</label>
          <Input className="h-7 text-xs" value={khaalisWazan.toFixed(4)} readOnly />
        </div>
        <span className="text-[9px] text-muted-foreground -mt-1">{khaalisConverted.tola}T {khaalisConverted.masha}M {khaalisConverted.rati}R</span>

        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'ملاوٹ/تولہ' : 'Milawat/Tola'}</label>
          <Input className="h-7 text-xs" type="number" value={milawatFiTola ?? ''} onChange={(e) => setMilawatFiTola(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'ملاوٹ/گرام' : 'Milawat/g'}</label>
          <Input className="h-7 text-xs" type="number" value={milawatFiGram ?? ''} onChange={(e) => setMilawatFiGram(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'کیرٹ' : 'Caret'}</label>
          <Input className="h-7 text-xs" value={caret.toFixed(2)} readOnly />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'ریٹ/تولہ' : 'Rate/Tola'}</label>
          <Input className="h-7 text-xs" type="number" value={rateFiTola ?? ''} onChange={(e) => setRateFiTola(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'ٹوٹل' : 'Total'}</label>
          <Input className="h-7 text-xs" value={total.toFixed(2)} readOnly />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'چارجز' : 'Charges'}</label>
          <Input className="h-7 text-xs" type="number" value={charges ?? ''} onChange={(e) => setCharges(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'بقایا' : 'Baqaya'}</label>
          <Input className="h-7 text-xs" type="number" value={baqaya ?? ''} onChange={(e) => setBaqaya(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'پوائنٹ' : 'Point'}</label>
          <Input className="h-7 text-xs" type="number" value={point ?? ''} onChange={(e) => setPoint(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-[10px] text-muted-foreground min-w-[50px]">{isUrdu ? 'ریٹی' : 'Rati'}</label>
          <Input className="h-7 text-xs" type="number" value={rati ?? ''} onChange={(e) => setRati(Number(e.target.value))} />
        </div>
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
