import { useState, useEffect, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClientStore } from '@/stores/clientStore'
import { BookOpen, Users, Search, Calendar, BarChart3 } from 'lucide-react'
import { db } from '@/db/db'

interface TopBarProps {
  onRoznamcha: () => void
  onUdhaar: () => void
  onTajzia: () => void
}

export const TopBar = memo(function TopBar({ onRoznamcha, onUdhaar, onTajzia }: TopBarProps) {
  const { t } = useTranslation()
  const { searchResults, searchClients, selectClient, setSearchQuery, searchQuery } =
    useClientStore()
  const [dateStr, setDateStr] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [receiptSearchQuery, setReceiptSearchQuery] = useState('')
  const [receiptResults, setReceiptResults] = useState<string[]>([])
  const [showReceiptResults, setShowReceiptResults] = useState(false)
  const receiptSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    setDateStr(`${day}/${month}/${year}`)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
      if (receiptSearchRef.current && !receiptSearchRef.current.contains(e.target as Node)) {
        setShowReceiptResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    searchClients(value)
    setShowDropdown(value.length > 0)
  }

  const handleSelect = (client: NonNullable<typeof searchResults[0]>) => {
    selectClient(client)
    setSearchQuery(client.naam)
    setShowDropdown(false)
  }

  const handleReceiptSearch = async () => {
    if (!receiptSearchQuery.trim()) return
    const q = receiptSearchQuery.toLowerCase()
    const qNum = parseInt(q, 10)
    const results: string[] = []

    const matchName = (naam: string) => naam.toLowerCase().includes(q)
    const matchNo = (no: number) => !isNaN(qNum) && no === qNum

    const naqad = await db.naqad_receipts.filter((r) => matchName(r.naam) || matchNo(r.raseed_no)).toArray()
    naqad.forEach((r) => results.push(`Naqad #${r.raseed_no}: ${r.naam} — ${r.date}`))

    const udhaar = await db.udhaar_receipts.filter((r) => matchName(r.naam) || matchNo(r.raseed_no)).toArray()
    udhaar.forEach((r) => results.push(`Udhaar #${r.raseed_no}: ${r.naam} — ${r.date}`))

    const laab = await db.laab_receipts.filter((r) => matchName(r.naam) || matchNo(r.raseed_no)).toArray()
    laab.forEach((r) => results.push(`Laab #${r.raseed_no}: ${r.naam} — ${r.date}`))

    const wasooli = await db.wasooli_receipts.filter((r) => matchName(r.naam) || matchNo(r.raseed_no)).toArray()
    wasooli.forEach((r) => results.push(`Wasooli #${r.raseed_no}: ${r.naam} — ${r.date_time}`))

    setReceiptResults(results.slice(0, 50))
    setShowReceiptResults(true)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-amber-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div className="relative flex items-center gap-1" ref={receiptSearchRef}>
        <Input
          className="h-9 w-48 text-xs"
          value={receiptSearchQuery}
          onChange={(e) => setReceiptSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleReceiptSearch()}
          placeholder={t('common.searchReceipts')}
          dir="auto"
        />
        <Button size="sm" variant="outline" className="h-9" onClick={handleReceiptSearch}>
          <Search className="h-4 w-4" />
        </Button>
        {showReceiptResults && receiptResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
            {receiptResults.map((r, i) => (
              <p key={i} className="text-[10px] text-muted-foreground px-2 py-1 hover:bg-amber-50 dark:hover:bg-zinc-800">{r}</p>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={onRoznamcha}>
        <BookOpen className="h-4 w-4 mr-1" />
        {t('common.roznamcha')}
      </Button>

      <Button variant="outline" size="sm" onClick={onUdhaar}>
        <Users className="h-4 w-4 mr-1" />
        {t('common.udhaar')}
      </Button>

      <Button variant="outline" size="sm" onClick={onTajzia}>
        <BarChart3 className="h-4 w-4 mr-1" />
        {t('common.tajzia')}
      </Button>

      <div className="relative flex-1 max-w-xs" ref={dropdownRef}>
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8 h-9"
          placeholder={t('common.search') + '...'}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery && setShowDropdown(true)}
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
            {searchResults.map((client) => (
              <button
                key={client.id}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                onClick={() => handleSelect(client)}
              >
                {client.naam} — {client.phone}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span dir="ltr">{dateStr}</span>
      </div>
    </div>
  )
})
