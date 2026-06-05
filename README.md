# Gold Ledger — Sona Hisaab

A bilingual (Urdu/English) gold shop management system for Pakistani gold shops. Fully offline, built with Vite + React + TypeScript + TailwindCSS + shadcn/ui + Zustand + Dexie.js (IndexedDB).

## Features

- **Bilingual UI** — Urdu (RTL) and English (LTR) with live language switching
- **Offline-first** — all data stored in IndexedDB via Dexie.js, no backend required
- **Light/Dark mode** — persisted preference
- **Naqad Ledger** — cash gold buy/sell tracking with auto-calculations
- **Udhaar Ledger** — credit gold tracking with cash rows and running totals
- **Naqad Receipt** — print, WhatsApp, save, view receipts
- **Udhaar Receipt** — gold + cash sections, updates client balances
- **Client Management** — add, edit, delete, search clients with balance display
- **Archimedes Purity** — density-based gold purity calculations (5 metal types)
- **Laab Receipt** — profit receipt with weight conversion and caret calculation
- **Wasooli Receipt** — collection receipt with side column
- **Roznamcha** — daily ledger with date filtering
- **Udhaar Window** — client-wise credit tracking with expandable history
- **Keyboard Buttons** — A–Z trigger buttons with extensible action registry
- **Real-time footer** — live shop totals (cash, tezabi sona, parchun, piece)

## Tech Stack

| Layer | Technology |
|---|---|
| Core | Vite 8 + React 19 + TypeScript 6 |
| Styling | TailwindCSS v4 + shadcn/ui (Base UI) |
| State | Zustand 5 |
| Storage | Dexie.js 4 (IndexedDB) |
| i18n | i18next + react-i18next |
| Print | react-to-print |
| PDF | jsPDF |
| Icons | lucide-react |

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/        # TopBar, Footer, MainLayout, KeyboardHints
│   ├── ledger/        # NaqadLedger, UdhaarLedger, EditableCell, AutoCalcField
│   ├── receipts/      # NaqadReceipt, UdhaarReceipt, LaabReceipt, WasooliReceipt, ReceiptModal
│   ├── blocks/        # ClientBlock, ArchimedesBlock
│   ├── windows/       # RoznamchaWindow, UdhaarWindow
│   ├── keyboard/      # KeyboardButtons
│   └── ui/            # shadcn components (button, card, input, dialog, etc.)
├── stores/            # Zustand stores (auth, client, ledger, receipt, shop)
├── db/                # Dexie database schema (10 tables)
├── utils/             # goldUtils (formulas), printUtils, whatsapp
├── i18n/              # en.json, ur.json, i18n config
├── hooks/             # Custom hooks
├── lib/               # cn() utility
├── App.tsx
└── main.tsx
```

## Gold Constants

| Unit | Grams |
|---|---|
| 1 Tola | 11.6638 g |
| 1 Masha | 0.9720 g |
| 1 Rati | 0.1215 g |
| 1 Tola | 12 Masha |
| 1 Masha | 8 Rati |
