import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

const KEYS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '+','-','×','÷','=','Clear','Enter',
]

interface KeyAction {
  label: string
  description: string
}

const KEY_ACTIONS: Record<string, KeyAction> = {
  S: { label: 'Save', description: 'Save current form' },
  P: { label: 'Print', description: 'Print current receipt' },
  R: { label: 'Reset', description: 'Reset form' },
  N: { label: 'New', description: 'New receipt' },
  F: { label: 'Search', description: 'Search clients' },
}

export function KeyboardButtons() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'

  const handleKey = (key: string) => {
    const action = KEY_ACTIONS[key]
    if (action) {
      console.log(`Key action: ${key} — ${action.label}`)
    }
    window.dispatchEvent(new CustomEvent('keyboard-action', { detail: key }))
  }

  return (
    <div className="p-3 border border-amber-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
      <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2">
        {isUrdu ? 'کی بورڈ بٹن' : 'Keyboard Buttons'}
      </h3>
      <div className="flex flex-wrap gap-1">
        {KEYS.map((key) => {
          const action = KEY_ACTIONS[key]
          return (
            <div key={key} className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 text-xs font-mono p-0"
                onClick={() => handleKey(key)}
              >
                {key}
              </Button>
              {action ? (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  {action.description}
                </div>
              ) : (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-muted-foreground">
                  Function pending
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
