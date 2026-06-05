import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as XLSX from 'xlsx'
import { exportToCSV, exportAllToJSON, importFromJSON } from '@/utils/exportUtils'
import { useGoldRate } from '@/hooks/useGoldRate'
import { db } from '@/db/db'
import { Download, Upload, RefreshCw, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react'

export function ToolsPanel() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { rate, loading: rateLoading, manualRate, setManualRate, refresh: refreshRate } = useGoldRate()
  const [importMsg, setImportMsg] = useState('')

  const handleExportCSV = async () => {
    const data = await db.naqad_receipts.toArray()
    await exportToCSV('naqad-receipts', data as unknown as Record<string, unknown>[])
  }

  const handleExportExcel = async () => {
    const data = await db.naqad_receipts.toArray()
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data as unknown as Record<string, unknown>[])
    XLSX.utils.book_append_sheet(wb, ws, 'Naqad')
    XLSX.writeFile(wb, `naqad-receipts-${Date.now()}.xlsx`)
  }

  const handleBackup = async () => {
    await exportAllToJSON()
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const msg = await importFromJSON(file)
    setImportMsg(msg)
    setTimeout(() => setImportMsg(''), 3000)
  }

  return (
    <Card className="border-amber-200 dark:border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400">
          {isUrdu ? 'ٹولز' : 'Tools'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Gold Rate */}
        <div className="flex items-center gap-2 p-2 bg-amber-50/50 dark:bg-zinc-800/50 rounded">
          <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-muted-foreground">
            {isUrdu ? 'سونے کا ریٹ' : 'Gold Rate'}:
          </span>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
            ₨{rate.toLocaleString()}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refreshRate} disabled={rateLoading}>
            <RefreshCw className={`h-3 w-3 ${rateLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Input
            className="h-6 w-20 text-[10px] ml-auto"
            type="number"
            value={manualRate ?? ''}
            onChange={(e) => setManualRate(e.target.value ? Number(e.target.value) : null)}
            placeholder={isUrdu ? 'دستی' : 'Manual'}
          />
        </div>

        {/* Export */}
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={handleExportCSV}>
            <FileText className="h-3 w-3 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-3 w-3 mr-1" /> Excel
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={handleBackup}>
            <Download className="h-3 w-3 mr-1" /> {isUrdu ? 'بیک اپ' : 'Backup'}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3 mr-1" /> {isUrdu ? 'بحال' : 'Restore'}
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
        </div>
        {importMsg && <p className="text-[10px] text-green-600 dark:text-green-400">{importMsg}</p>}
      </CardContent>
    </Card>
  )
}
