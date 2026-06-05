import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export function TajziaWindow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-amber-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400">
            {isUrdu ? 'تجزیہ' : 'Analytics'}
          </h2>
          <Button size="sm" variant="ghost" className="h-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  )
}
