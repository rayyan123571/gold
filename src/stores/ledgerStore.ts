import { create } from 'zustand'
import { db, type NaqadEntry, type UdhaarEntry } from '@/db/db'
import { calcKhaalisSona, calcQeemat } from '@/utils/goldUtils'

interface NaqadRow {
  wazan: number
  point: number
  khaalis: number
  rate: number
  qeemat: number
}

interface UdhaarRow {
  wazan: number
  point: number
  khaalis: number
  rate: number
  qeemat: number
  cash_lia: number
  cash_dia: number
}

interface LedgerState {
  naqad: {
    naqad: NaqadRow
    farokht: NaqadRow
    khareed: NaqadRow
  }
  udhaar: {
    farokht: UdhaarRow
    khareed: UdhaarRow
  }
  sonaTotal: number
  cashTotal: number
  loading: boolean
  loadNaqad: (clientId: number) => Promise<void>
  loadUdhaar: (clientId: number) => Promise<void>
  updateNaqadRow: (row: keyof LedgerState['naqad'], field: keyof NaqadRow, value: number) => void
  updateUdhaarRow: (row: keyof LedgerState['udhaar'], field: keyof UdhaarRow, value: number) => void
  saveNaqad: (clientId: number, date: string) => Promise<void>
  saveUdhaar: (clientId: number, date: string) => Promise<void>
  recalcTotals: () => void
}

const defaultNaqadRow = (): NaqadRow => ({
  wazan: 0,
  point: 100,
  khaalis: 0,
  rate: 0,
  qeemat: 0,
})

const defaultUdhaarRow = (): UdhaarRow => ({
  wazan: 0,
  point: 100,
  khaalis: 0,
  rate: 0,
  qeemat: 0,
  cash_lia: 0,
  cash_dia: 0,
})

export const useLedgerStore = create<LedgerState>((set, get) => ({
  naqad: {
    naqad: defaultNaqadRow(),
    farokht: defaultNaqadRow(),
    khareed: defaultNaqadRow(),
  },
  udhaar: {
    farokht: defaultUdhaarRow(),
    khareed: defaultUdhaarRow(),
  },
  sonaTotal: 0,
  cashTotal: 0,
  loading: false,

  loadNaqad: async (clientId) => {
    set({ loading: true })
    const entries = await db.naqad_entries
      .where('client_id')
      .equals(clientId)
      .toArray()

    const naqad: LedgerState['naqad'] = {
      naqad: defaultNaqadRow(),
      farokht: defaultNaqadRow(),
      khareed: defaultNaqadRow(),
    }

    for (const entry of entries) {
      if (entry.row_type === 'naqad') {
        naqad.naqad = { wazan: entry.wazan, point: entry.point, khaalis: entry.khaalis, rate: entry.rate, qeemat: entry.qeemat }
      } else if (entry.row_type === 'farokht') {
        naqad.farokht = { wazan: entry.wazan, point: entry.point, khaalis: entry.khaalis, rate: entry.rate, qeemat: entry.qeemat }
      } else if (entry.row_type === 'khareed') {
        naqad.khareed = { wazan: entry.wazan, point: entry.point, khaalis: entry.khaalis, rate: entry.rate, qeemat: entry.qeemat }
      }
    }

    set({ naqad, loading: false })
  },

  loadUdhaar: async (clientId) => {
    set({ loading: true })
    const entries = await db.udhaar_entries
      .where('client_id')
      .equals(clientId)
      .toArray()

    const udhaar: LedgerState['udhaar'] = {
      farokht: defaultUdhaarRow(),
      khareed: defaultUdhaarRow(),
    }

    for (const entry of entries) {
      if (entry.row_type === 'farokht') {
        udhaar.farokht = { wazan: entry.wazan, point: entry.point, khaalis: entry.khaalis, rate: entry.rate, qeemat: entry.qeemat, cash_lia: entry.cash_lia, cash_dia: entry.cash_dia }
      } else if (entry.row_type === 'khareed') {
        udhaar.khareed = { wazan: entry.wazan, point: entry.point, khaalis: entry.khaalis, rate: entry.rate, qeemat: entry.qeemat, cash_lia: entry.cash_lia, cash_dia: entry.cash_dia }
      }
    }

    set({ udhaar, loading: false })
  },

  updateNaqadRow: (row, field, value) => {
    set((state) => {
      const updated = { ...state.naqad[row], [field]: value }

      if (field === 'wazan' || field === 'point') {
        updated.khaalis = calcKhaalisSona(
          field === 'wazan' ? value : state.naqad[row].wazan,
          field === 'point' ? value : state.naqad[row].point
        )
        updated.qeemat = calcQeemat(updated.khaalis, updated.rate)
      }

      if (field === 'rate') {
        updated.qeemat = calcQeemat(updated.khaalis, value)
      }

      if (field === 'khaalis') {
        updated.qeemat = calcQeemat(value, updated.rate)
      }

      const naqad = { ...state.naqad, [row]: updated }
      const sonaTotal = (naqad.farokht.khaalis - naqad.khareed.khaalis) + (state.udhaar.farokht.khaalis - state.udhaar.khareed.khaalis)
      const cashTotal = (state.udhaar.farokht.cash_lia - state.udhaar.farokht.cash_dia) + (state.udhaar.khareed.cash_lia - state.udhaar.khareed.cash_dia)

      return { naqad, sonaTotal, cashTotal }
    })
  },

  updateUdhaarRow: (row, field, value) => {
    set((state) => {
      const updated = { ...state.udhaar[row], [field]: value }

      if (field === 'wazan' || field === 'point') {
        updated.khaalis = calcKhaalisSona(
          field === 'wazan' ? value : state.udhaar[row].wazan,
          field === 'point' ? value : state.udhaar[row].point
        )
        updated.qeemat = calcQeemat(updated.khaalis, updated.rate)
      }

      if (field === 'rate') {
        updated.qeemat = calcQeemat(updated.khaalis, value)
      }

      if (field === 'khaalis') {
        updated.qeemat = calcQeemat(value, updated.rate)
      }

      const udhaar = { ...state.udhaar, [row]: updated }
      const sonaTotal = (state.naqad.farokht.khaalis - state.naqad.khareed.khaalis) + (udhaar.farokht.khaalis - udhaar.khareed.khaalis)
      const cashTotal = (udhaar.farokht.cash_lia - udhaar.farokht.cash_dia) + (udhaar.khareed.cash_lia - udhaar.khareed.cash_dia)

      return { udhaar, sonaTotal, cashTotal }
    })
  },

  recalcTotals: () => {
    const { naqad, udhaar } = get()
    const sonaTotal =
      (naqad.farokht.khaalis - naqad.khareed.khaalis) +
      (udhaar.farokht.khaalis - udhaar.khareed.khaalis)
    const cashTotal =
      (udhaar.farokht.cash_lia - udhaar.farokht.cash_dia) +
      (udhaar.khareed.cash_lia - udhaar.khareed.cash_dia)
    set({ sonaTotal, cashTotal })
  },

  saveNaqad: async (clientId, date) => {
    const { naqad } = get()
    await db.naqad_entries.where('client_id').equals(clientId).delete()

    const rows: Array<{ row_type: NaqadEntry['row_type']; data: NaqadRow }> = [
      { row_type: 'naqad', data: naqad.naqad },
      { row_type: 'farokht', data: naqad.farokht },
      { row_type: 'khareed', data: naqad.khareed },
    ]

    for (const { row_type, data } of rows) {
      await db.naqad_entries.add({
        date,
        client_id: clientId,
        row_type,
        wazan: data.wazan,
        point: data.point,
        khaalis: data.khaalis,
        rate: data.rate,
        qeemat: data.qeemat,
      })
    }
  },

  saveUdhaar: async (clientId, date) => {
    const { udhaar } = get()
    await db.udhaar_entries.where('client_id').equals(clientId).delete()

    const rows: Array<{ row_type: UdhaarEntry['row_type']; data: UdhaarRow }> = [
      { row_type: 'farokht', data: udhaar.farokht },
      { row_type: 'khareed', data: udhaar.khareed },
    ]

    for (const { row_type, data } of rows) {
      await db.udhaar_entries.add({
        date,
        client_id: clientId,
        row_type,
        wazan: data.wazan,
        point: data.point,
        khaalis: data.khaalis,
        rate: data.rate,
        qeemat: data.qeemat,
        cash_lia: data.cash_lia,
        cash_dia: data.cash_dia,
      })
    }
  },
}))
