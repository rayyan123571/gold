import { useState, useEffect, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useReceiptStore } from '@/stores/receiptStore'
import { useClientStore } from '@/stores/clientStore'
import { useShopStore } from '@/stores/shopStore'
import { useRateStore } from '@/stores/rateStore'
import { calcRatePerGram, gramsToTolaMashaRati, TOLA_IN_GRAMS } from '@/utils/goldUtils'
import { QRCodeSVG } from 'qrcode.react'
import { Save, RotateCcw, Printer, Eye, MessageCircle } from 'lucide-react'

export const NaqadReceipt = memo(function NaqadReceipt() {
  const { t, i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { naqad } = useLedgerStore()
  const { getNextRaseedNo, saveNaqadReceipt } = useReceiptStore()
  const selectedClient = useClientStore((s) => s.selectedClient)

  const [raseedNo, setRaseedNo] = useState(1)
  const [date, setDate] = useState('')
  const [naam, setNaam] = useState('')
  const [rateTola, setRateTola] = useState(() => useRateStore.getState().rateTezabiFiTola)
  const [rateGram, setRateGram] = useState(0)
  const [wazan, setWazan] = useState(0)
  const [khaalis, setKhaalis] = useState(0)
  const [qeemat, setQeemat] = useState(0)
  const [raqamLi, setRaqamLi] = useState(0)
  const printRef = useRef<HTMLDivElement>(null)

  const isFarokhtFilled = naqad.farokht.wazan > 0
  const isKhareedFilled = naqad.khareed.wazan > 0
  const bothFilled = isFarokhtFilled && isKhareedFilled
  const receiptType = bothFilled ? ('buy' as const) : isKhareedFilled ? ('buy' as const) : ('sell' as const)
  const receiptTitle = isUrdu
    ? `رسید سونا ${receiptType === 'buy' ? 'خرید' : 'فروخت'}`
    : `Receipt — ${receiptType === 'buy' ? 'Buy' : 'Sell'}`

  useEffect(() => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    setDate(`${day}/${month}/${year}`)
    getNextRaseedNo('naqad').then(setRaseedNo)
  }, [getNextRaseedNo])

  useEffect(() => {
    const rt = isFarokhtFilled ? naqad.farokht.rate : naqad.khareed.rate
    setRateTola(rt)
  }, [naqad.farokht.rate, naqad.khareed.rate, isFarokhtFilled])

  useEffect(() => {
    setRateGram(calcRatePerGram(rateTola))
    setQeemat((khaalis / TOLA_IN_GRAMS) * rateTola)
  }, [rateTola, khaalis])

  useEffect(() => {
    if (selectedClient) {
      setNaam(selectedClient.naam)
    }
  }, [selectedClient])

  const wazanConverted = gramsToTolaMashaRati(wazan)
  const khaalisConverted = gramsToTolaMashaRati(khaalis)

  const handleSave = async () => {
    await saveNaqadReceipt({
      raseed_no: raseedNo,
      date,
      naam,
      rate_tola: rateTola,
      rate_gram: rateGram,
      wazan,
      khaalis,
      qeemat,
      raqam_li: raqamLi,
      type: receiptType,
    })
    useShopStore.getState().recalcTotals()
    handleReset()
  }

  const handleReset = () => {
    setWazan(0)
    setKhaalis(0)
    setQeemat(0)
    setRaqamLi(0)
    getNextRaseedNo('naqad').then(setRaseedNo)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    const msg = `${receiptTitle}\nرسید نمبر: ${raseedNo}\nتاریخ: ${date}\nنام: ${naam}\nوزن: ${wazan}g\nخالص: ${khaalis}g\nقیمت: ${qeemat}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleView = () => {
    alert(`Receipt #${raseedNo} saved for ${naam}`)
  }

  return (
    <div className="space-y-4 p-4 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
      <div ref={printRef} className="print-area">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-3">
          {receiptTitle}
        </h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'رسید نمبر' : 'Receipt No.'}
            </label>
            <Input className="h-8 text-sm" value={raseedNo} readOnly />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'تاریخ' : 'Date'}
            </label>
            <Input className="h-8 text-sm" value={date} readOnly dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'نام' : 'Name'}
            </label>
            <Input className="h-8 text-sm" value={naam} onChange={(e) => setNaam(e.target.value)} dir="auto" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'ریٹ فی تولہ' : 'Rate/Tola'}
            </label>
            <Input className="h-8 text-sm" type="number" value={rateTola} onChange={(e) => setRateTola(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'ریٹ فی گرام' : 'Rate/Gram'}
            </label>
            <Input className="h-8 text-sm" value={rateGram.toFixed(4)} readOnly dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'وزن (گرام)' : 'Weight (g)'}
            </label>
            <Input className="h-8 text-sm" type="number" value={wazan} onChange={(e) => setWazan(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <span className="text-[10px] text-muted-foreground">
              {wazanConverted.tola}T {wazanConverted.masha}M {wazanConverted.rati}R
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'خالص سونا' : 'Pure Gold'}
            </label>
            <Input className="h-8 text-sm" type="number" value={khaalis} onChange={(e) => setKhaalis(Number(e.target.value))} dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'قیمت' : 'Price'}
            </label>
            <Input className="h-8 text-sm" value={qeemat.toFixed(2)} readOnly dir="ltr" />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <span className="text-[10px] text-muted-foreground">
              {khaalisConverted.tola}T {khaalisConverted.masha}M {khaalisConverted.rati}R
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground min-w-[60px]">
              {isUrdu ? 'رقم لی' : 'Amount Recv'}
            </label>
            <Input className="h-8 text-sm" type="number" value={raqamLi} onChange={(e) => setRaqamLi(Number(e.target.value))} dir="ltr" />
          </div>
        </div>
      </div>

      {wazan > 0 && (
        <div className="flex justify-center py-2 print-area">
          <QRCodeSVG value={`Gold Receipt #${raseedNo}\n${naam}\n${wazan}g @ ₨${rateTola}/tola\nTotal: ₨${qeemat}`} size={80} />
        </div>
      )}

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
