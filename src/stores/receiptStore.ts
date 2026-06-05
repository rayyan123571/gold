import { create } from 'zustand'

import { db, type NaqadReceipt, type UdhaarReceipt, type LaabReceipt, type WasooliReceipt } from '@/db/db'

interface ReceiptState {
  loading: boolean
  getNextRaseedNo: (table: string) => Promise<number>
  saveNaqadReceipt: (receipt: Omit<NaqadReceipt, 'id'>) => Promise<number | undefined>
  saveUdhaarReceipt: (receipt: Omit<UdhaarReceipt, 'id'>) => Promise<number | undefined>
  saveLaabReceipt: (receipt: Omit<LaabReceipt, 'id'>) => Promise<number | undefined>
  saveWasooliReceipt: (receipt: Omit<WasooliReceipt, 'id'>) => Promise<number | undefined>
  getNaqadReceipts: () => Promise<NaqadReceipt[]>
  getUdhaarReceipts: () => Promise<UdhaarReceipt[]>
}

export const useReceiptStore = create<ReceiptState>(() => ({
  loading: false,

  getNextRaseedNo: async (table: string) => {
    switch (table) {
      case 'naqad':
        return await db.transaction('r', db.naqad_receipts, async () => {
          const last = await db.naqad_receipts.orderBy('raseed_no').last()
          return (last?.raseed_no ?? 0) + 1
        })
      case 'udhaar':
        return await db.transaction('r', db.udhaar_receipts, async () => {
          const last = await db.udhaar_receipts.orderBy('raseed_no').last()
          return (last?.raseed_no ?? 0) + 1
        })
      case 'laab':
        return await db.transaction('r', db.laab_receipts, async () => {
          const last = await db.laab_receipts.orderBy('raseed_no').last()
          return (last?.raseed_no ?? 0) + 1
        })
      case 'wasooli':
        return await db.transaction('r', db.wasooli_receipts, async () => {
          const last = await db.wasooli_receipts.orderBy('raseed_no').last()
          return (last?.raseed_no ?? 0) + 1
        })
      default:
        return 1
    }
  },

  saveNaqadReceipt: async (receipt) => {
    return await db.transaction('rw', db.naqad_receipts, async () => {
      const last = await db.naqad_receipts.orderBy('raseed_no').last()
      receipt.raseed_no = (last?.raseed_no ?? 0) + 1
      return await db.naqad_receipts.add(receipt)
    })
  },

  saveUdhaarReceipt: async (receipt) => {
    return await db.transaction('rw', db.udhaar_receipts, async () => {
      const last = await db.udhaar_receipts.orderBy('raseed_no').last()
      receipt.raseed_no = (last?.raseed_no ?? 0) + 1
      return await db.udhaar_receipts.add(receipt)
    })
  },

  saveLaabReceipt: async (receipt) => {
    return await db.transaction('rw', db.laab_receipts, async () => {
      const last = await db.laab_receipts.orderBy('raseed_no').last()
      receipt.raseed_no = (last?.raseed_no ?? 0) + 1
      return await db.laab_receipts.add(receipt)
    })
  },

  saveWasooliReceipt: async (receipt) => {
    return await db.transaction('rw', db.wasooli_receipts, async () => {
      const last = await db.wasooli_receipts.orderBy('raseed_no').last()
      receipt.raseed_no = (last?.raseed_no ?? 0) + 1
      return await db.wasooli_receipts.add(receipt)
    })
  },

  getNaqadReceipts: async () => {
    return await db.naqad_receipts.toArray()
  },

  getUdhaarReceipts: async () => {
    return await db.udhaar_receipts.toArray()
  },
}))
