import { create } from 'zustand'
import { db, type ShopTotal } from '@/db/db'

interface ShopState {
  totals: ShopTotal | null
  loading: boolean
  loadTotals: () => Promise<void>
  recalcTotals: () => Promise<void>
}

export const useShopStore = create<ShopState>((set) => ({
  totals: null,
  loading: false,

  loadTotals: async () => {
    set({ loading: true })
    let totals = await db.shop_totals.toCollection().first()
    if (!totals) {
      const id = await db.shop_totals.add({
        cash: 0,
        tezabi_sona: 0,
        parchun: 0,
        piece: 0,
      })
      totals = await db.shop_totals.get(id!)
    }
    set({ totals: totals!, loading: false })
  },

  recalcTotals: async () => {
    const naqadReceipts = await db.naqad_receipts.toArray()
    const udhaarReceipts = await db.udhaar_receipts.toArray()
    const laabReceipts = await db.laab_receipts.toArray()
    const wasooliReceipts = await db.wasooli_receipts.toArray()

    const cash = naqadReceipts.reduce((s, r) => s + r.raqam_li, 0) +
      udhaarReceipts.reduce((s, r) => s + r.cash_lia - r.cash_dia, 0)
    const tezabi_sona = laabReceipts.reduce((s, r) => s + r.khaalis_wazan, 0)
    const parchun = wasooliReceipts.reduce((s, r) => s + r.parchun_wazan, 0)
    const piece = wasooliReceipts.length

    const existing = await db.shop_totals.toCollection().first()
    if (existing) {
      await db.shop_totals.update(existing.id!, { cash, tezabi_sona, parchun, piece })
    } else {
      await db.shop_totals.add({ cash, tezabi_sona, parchun, piece })
    }

    const updated = await db.shop_totals.toCollection().first()
    set({ totals: updated ?? { cash, tezabi_sona, parchun, piece } })
  },
}))
