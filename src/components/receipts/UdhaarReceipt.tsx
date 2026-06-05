import { useState, useEffect, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useReceiptStore } from '@/stores/receiptStore'
import { useClientStore } from '@/stores/clientStore'
import { useShopStore } from '@/stores/shopStore'
import { useRateStore } from '@/stores/rateStore'
import { calcRatePerGram } from '@/utils/goldUtils'
import { Save, RotateCcw, Printer, Eye, MessageCircle } from 'lucide-react'

export const UdhaarReceipt = memo(function UdhaarReceipt() {
  const { t, i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { udhaar } = useLedgerStore()
  const { getNextRaseedNo, saveUdhaarReceipt } = useReceiptStore()
  const selectedClient = useClientStore((s) => s.selectedClient)
  const updateClient = useClientStore((s) => s.updateClient)

  const [raseedNo, setRaseedNo] = useState(1)
  const [date, setDate] = useState('')
  const [naam, setNaam] = useState('')
  const [rateTola, setRateTola] = useState(() => useRateStore.getState().rateTezabiFiTola)
  const [rateGram, setRateGram] = useState(0)
  const [sonaDia, setSonaDia] = useState(0)
  const [sonaLia, setSonaLia] = useState(0)
  const [baqi, setBaqi] = useState(0)
  const [sabqaSona, setSabqaSona] = useState(0)
  const [cashDia, setCashDia] = useState(0)
  const [cashLia, setCashLia] = useState(0)
  const [baqiCash, setBaqiCash] = useState(0)
  const [sabqaCash, setSabqaCash] = useState(0)
  const printRef = useRef<HTMLDivElement>(null)

  const isFarokhtFilled = udhaar.farokht.wazan > 0

  useEffect(() => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    setDate(`${day}/${month}/${year}`)
    getNextRaseedNo('udhaar').then(setRaseedNo)
  }, [getNextRaseedNo])

  useEffect(() => {
    const rt = isFarokhtFilled ? udhaar.farokht.rate : udhaar.khareed.rate
    setRateTola(rt)
  }, [udhaar.farokht.rate, udhaar.khareed.rate, isFarokhtFilled])

  useEffect(() => {
    setRateGram(calcRatePerGram(rateTola))
  }, [rateTola])

  useEffect(() => {
    setBaqi(sonaDia - sonaLia)
    setBaqiCash(cashDia - cashLia)
  }, [sonaDia, sonaLia, cashDia, cashLia])

  useEffect(() => {
    if (selectedClient) {
      setNaam(selectedClient.naam)
      setSabqaSona(selectedClient.balance_sona)
      setSabqaCash(selectedClient.balance_cash)
    }
  }, [selectedClient])

  const handleSave = async () => {
    await saveUdhaarReceipt({
      raseed_no: raseedNo,
      date,
      naam,
      rate_tola: rateTola,
      rate_gram: rateGram,
      sona_dia: sonaDia,
      sona_lia: sonaLia,
      baqi,
      sabqa_sona: sabqaSona,
      cash_dia: cashDia,
      cash_lia: cashLia,
      baqi_cash: baqiCash,
      sabqa_cash: sabqaCash,
    })

    if (selectedClient?.id) {
      await updateClient(selectedClient.id, {
        balance_sona: sabqaSona + baqi,
        balance_cash: sabqaCash + baqiCash,
      })
    }

    useShopStore.getState().recalcTotals()
    handleReset()
  }

  const handleReset = () => {
    setSonaDia(0)
    setSonaLia(0)
    setCashDia(0)
    setCashLia(0)
    getNextRaseedNo('udhaar').then(setRaseedNo)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    const msg = `${isUrdu ? 'ادھار کی رسید' : 'Udhaar Receipt'}\nرسید نمبر: ${raseedNo}\nتاریخ: ${date}\nنام: ${naam}\nسونا دیا: ${sonaDia}\nسونا لیا: ${sonaLia}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleView = () => {
    alert(`Udhaar Receipt #${raseedNo} saved for ${naam}`)
  }

  return (
    <div className="space-y-4 p-4 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
      <div ref={printRef} className="print-area">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-3">
          {isUrdu ? 'ادھار کی رسید' : 'Udhaar Receipt'}
        </h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'رسید نمبر' : 'Receipt No.'}</label>
            <Input className="h-8 text-sm" value={raseedNo} readOnly />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'تاریخ' : 'Date'}</label>
            <Input className="h-8 text-sm" value={date} readOnly dir="ltr" />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'نام' : 'Name'}</label>
            <Input className="h-8 text-sm" value={naam} onChange={(e) => setNaam(e.target.value)} dir="auto" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'ریٹ فی تولہ' : 'Rate/Tola'}</label>
            <Input className="h-8 text-sm" type="number" value={rateTola} onChange={(e) => setRateTola(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'ریٹ فی گرام' : 'Rate/Gram'}</label>
            <Input className="h-8 text-sm" value={rateGram.toFixed(4)} readOnly dir="ltr" />
          </div>

          <div className="col-span-2 border-t border-amber-200 dark:border-zinc-700 pt-2 mt-1">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mb-1">
              {isUrdu ? 'گولڈ — سونے کا حصہ' : 'Gold Section'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'سونا دیا' : 'Gold Given'}</label>
            <Input className="h-8 text-sm" type="number" value={sonaDia} onChange={(e) => setSonaDia(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'سونا لیا' : 'Gold Taken'}</label>
            <Input className="h-8 text-sm" type="number" value={sonaLia} onChange={(e) => setSonaLia(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'باقی' : 'Balance'}</label>
            <Input className="h-8 text-sm" value={baqi.toFixed(3)} readOnly dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'سابقہ' : 'Previous'}</label>
            <Input className="h-8 text-sm" value={sabqaSona.toFixed(3)} readOnly dir="ltr" />
          </div>

          <div className="col-span-2 border-t border-amber-200 dark:border-zinc-700 pt-2 mt-1">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mb-1">
              {isUrdu ? 'کیش — نقد حصہ' : 'Cash Section'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'کیش دیا' : 'Cash Given'}</label>
            <Input className="h-8 text-sm" type="number" value={cashDia} onChange={(e) => setCashDia(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'کیش لیا' : 'Cash Taken'}</label>
            <Input className="h-8 text-sm" type="number" value={cashLia} onChange={(e) => setCashLia(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'باقی' : 'Balance'}</label>
            <Input className="h-8 text-sm" value={baqiCash.toFixed(2)} readOnly dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">{isUrdu ? 'سابقہ' : 'Previous'}</label>
            <Input className="h-8 text-sm" value={sabqaCash.toFixed(2)} readOnly dir="ltr" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" /> {t('common.save')}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-1" /> {t('common.reset')}
        </Button>
        <Button size="sm" variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" /> {t('common.print')}
        </Button>
        <Button size="sm" variant="outline" onClick={handleView}>
          <Eye className="h-4 w-4 mr-1" /> {t('common.view')}
        </Button>
        <Button size="sm" variant="outline" onClick={handleWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-1" /> {t('common.whatsapp')}
        </Button>
      </div>
    </div>
  )
})
