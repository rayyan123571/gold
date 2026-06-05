import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Keyboard } from 'lucide-react'

const HINTS = [
  { key: 'Ctrl+N', label: 'New receipt' },
  { key: 'Ctrl+S', label: 'Save' },
  { key: 'Ctrl+P', label: 'Print' },
  { key: 'Ctrl+F', label: 'Search client' },
  { key: 'Esc', label: 'Close modal' },
  { key: 'Enter', label: 'Confirm' },
]

export function KeyboardHints() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setOpen(!open)}
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-popover border rounded-lg shadow-lg z-50 min-w-[180px]">
          <p className="text-xs font-medium text-muted-foreground mb-1">Keyboard Shortcuts</p>
          <div className="space-y-1">
            {HINTS.map((hint) => (
              <div key={hint.key} className="flex items-center justify-between gap-4 text-xs">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">{hint.key}</kbd>
                <span className="text-muted-foreground">{hint.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
