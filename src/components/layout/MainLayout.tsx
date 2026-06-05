import { useState } from 'react'
import { TopBar } from './TopBar'
import { Footer } from './Footer'
import { NaqadLedger } from '@/components/ledger/NaqadLedger'
import { UdhaarLedger } from '@/components/ledger/UdhaarLedger'
import { NaqadReceipt } from '@/components/receipts/NaqadReceipt'
import { UdhaarReceipt } from '@/components/receipts/UdhaarReceipt'
import { ClientBlock } from '@/components/blocks/ClientBlock'
import { ArchimedesBlock } from '@/components/blocks/ArchimedesBlock'
import { LaabReceipt } from '@/components/receipts/LaabReceipt'
import { WasooliReceipt } from '@/components/receipts/WasooliReceipt'
import { WasooliSideColumn } from '@/components/receipts/WasooliSideColumn'
import { KeyboardButtons } from '@/components/keyboard/KeyboardButtons'
import { RoznamchaWindow } from '@/components/windows/RoznamchaWindow'
import { UdhaarWindow } from '@/components/windows/UdhaarWindow'
import { TajziaWindow } from '@/components/windows/TajziaWindow'
import { ToolsPanel } from '@/components/analytics/ToolsPanel'
import { KeyboardHints } from './KeyboardHints'
import { useTranslation } from 'react-i18next'

export function MainLayout() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const [roznamchaOpen, setRoznamchaOpen] = useState(false)
  const [udhaarOpen, setUdhaarOpen] = useState(false)
  const [tajziaOpen, setTajziaOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-amber-50 dark:bg-zinc-950 transition-colors">
      <TopBar
        onRoznamcha={() => setRoznamchaOpen(true)}
        onUdhaar={() => setUdhaarOpen(true)}
        onTajzia={() => setTajziaOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        <section className="flex-1 border-r border-amber-200 dark:border-zinc-700 p-4">
          <div className="space-y-4">
            <NaqadLedger />
            <NaqadReceipt />
            <UdhaarLedger />
            <UdhaarReceipt />
            <ToolsPanel />
          </div>
        </section>

        <section className="flex-1 p-4 space-y-4">
          <ClientBlock />
          <ArchimedesBlock />
          <LaabReceipt />
          <div className="flex flex-col lg:flex-row gap-3 items-start">
            <div className="flex-1">
              <WasooliReceipt />
            </div>
            <div className="w-full lg:w-48 shrink-0">
              <WasooliSideColumn />
            </div>
          </div>
          <KeyboardButtons />
        </section>
      </div>

      <div className="fixed bottom-2 right-2 z-40">
        <KeyboardHints />
      </div>

      <RoznamchaWindow open={roznamchaOpen} onClose={() => setRoznamchaOpen(false)} />
      <UdhaarWindow open={udhaarOpen} onClose={() => setUdhaarOpen(false)} />
      <TajziaWindow open={tajziaOpen} onClose={() => setTajziaOpen(false)} />

      <Footer />
    </div>
  )
}
