import { useTranslation } from 'react-i18next'
import { useShopStore } from '@/stores/shopStore'
import { useEffect, useRef } from 'react'

export function Footer() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { totals, loadTotals } = useShopStore()
  const loaded = useRef(false)

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true
      loadTotals()
    }
  }, [loadTotals])

  const items = [
    { label: isUrdu ? 'کیش' : 'Cash', value: totals?.cash ?? 0, format: (n: number) => n.toFixed(2) },
    { label: isUrdu ? 'تیزابی سونا' : 'Tezabi Sona', value: totals?.tezabi_sona ?? 0, format: (n: number) => n.toFixed(3) },
    { label: isUrdu ? 'پرچوں' : 'Parchun', value: totals?.parchun ?? 0, format: (n: number) => n.toFixed(3) },
    { label: isUrdu ? 'پیس' : 'Piece', value: totals?.piece ?? 0, format: (n: number) => String(n) },
  ]

  return (
    <footer className="border-t border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {items.map((item) => (
          <span key={item.label}>
            {item.label}: <strong className="text-amber-700 dark:text-amber-400">{item.format(item.value)}</strong>
          </span>
        ))}
      </div>
    </footer>
  )
}