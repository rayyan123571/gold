import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { useRateStore } from '@/stores/rateStore'
import { useThemeLang } from '@/hooks/useThemeLang'
import { MainLayout } from '@/components/layout/MainLayout'
import { LogOut, Moon, Sun, Languages, Plus, Minus } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

function useZoom() {
  const [zoom, setZoom] = useState(() => {
    const saved = localStorage.getItem('zoom')
    return saved ? Number(saved) : 100
  })

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 10, 200)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 10, 30)), [])
  const zoomReset = useCallback(() => setZoom(100), [])

  useEffect(() => {
    localStorage.setItem('zoom', String(zoom))
  }, [zoom])

  return { zoom, zoomIn, zoomOut, zoomReset }
}

export function MainPage() {
  const { t, i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { currentUser, logout } = useAuthStore()
  const { dark, toggleTheme, toggleLang } = useThemeLang()
  const { fiGramCharges, parchiCharges, rateTezabiFiGram, rateTezabiFiTola, setFiGramCharges, setParchiCharges, setRateTezabiFiGram, setRateTezabiFiTola } = useRateStore()
  const { zoom, zoomIn, zoomOut, zoomReset } = useZoom()

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-zinc-950 transition-colors">
      <header className="border-b border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-amber-800 dark:text-amber-400">
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{currentUser}</span>

            {/* Zoom controls */}
            <div className="flex items-center gap-0.5 border-l border-amber-200 dark:border-zinc-700 pl-2 ml-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} title={isUrdu ? 'زیوم آؤٹ' : 'Zoom Out'}>
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <button
                onClick={zoomReset}
                className="text-[11px] font-mono tabular-nums min-w-[36px] text-center px-1 py-0.5 rounded hover:bg-amber-100 dark:hover:bg-zinc-800 text-muted-foreground"
                title={isUrdu ? 'ری سیٹ' : 'Reset'}
              >
                {zoom}%
              </button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} title={isUrdu ? 'زیوم ان' : 'Zoom In'}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={toggleLang}>
              <Languages className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{isUrdu ? 'فی گرام چارجز' : 'Fi Gram Charges'}</span>
            <Input className="h-6 w-16 text-[10px]" type="number" value={fiGramCharges ?? ''} onChange={(e) => setFiGramCharges(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{isUrdu ? 'پرچی چارجز' : 'Parchi Charges'}</span>
            <Input className="h-6 w-16 text-[10px]" type="number" value={parchiCharges ?? ''} onChange={(e) => setParchiCharges(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{isUrdu ? 'ریٹ تیزابی فی گرام' : 'Rate Tezabi Fi Gram'}</span>
            <Input className="h-6 w-16 text-[10px]" type="number" value={rateTezabiFiGram ?? ''} onChange={(e) => setRateTezabiFiGram(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{isUrdu ? 'ریٹ تیزابی فی تولہ' : 'Rate Tezabi Fi Tola'}</span>
            <Input className="h-6 w-16 text-[10px]" type="number" value={rateTezabiFiTola ?? ''} onChange={(e) => setRateTezabiFiTola(Number(e.target.value))} />
          </label>
        </div>
      </header>

      <div className="zoom-container">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }}
        >
          <MainLayout />
        </div>
      </div>
    </div>
  )
}
