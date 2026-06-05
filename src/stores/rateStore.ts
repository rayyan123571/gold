import { create } from 'zustand'
import { TOLA_IN_GRAMS } from '@/utils/goldUtils'

const STORAGE_KEY = 'goldRates'

interface RateData {
  fiGramCharges: number
  parchiCharges: number
  rateTezabiFiGram: number
  rateTezabiFiTola: number
}

interface RateState extends RateData {
  setFiGramCharges: (v: number) => void
  setParchiCharges: (v: number) => void
  setRateTezabiFiGram: (v: number) => void
  setRateTezabiFiTola: (v: number) => void
}

function loadData(): RateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        fiGramCharges: parsed.fiGramCharges ?? 0,
        parchiCharges: parsed.parchiCharges ?? 0,
        rateTezabiFiGram: parsed.rateTezabiFiGram ?? 0,
        rateTezabiFiTola: parsed.rateTezabiFiTola ?? 0,
      }
    }
  } catch { /* ignore */ }
  return { fiGramCharges: 0, parchiCharges: 0, rateTezabiFiGram: 0, rateTezabiFiTola: 0 }
}

function saveData(data: Partial<RateData>) {
  const current = loadData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }))
}

const saved = loadData()

export const useRateStore = create<RateState>((set) => ({
  ...saved,

  setFiGramCharges: (v) => {
    set({ fiGramCharges: v })
    saveData({ fiGramCharges: v })
  },

  setParchiCharges: (v) => {
    set({ parchiCharges: v })
    saveData({ parchiCharges: v })
  },

  setRateTezabiFiGram: (v) => {
    const tola = Math.round(v * TOLA_IN_GRAMS * 100) / 100
    set({ rateTezabiFiGram: v, rateTezabiFiTola: tola })
    saveData({ rateTezabiFiGram: v, rateTezabiFiTola: tola })
  },

  setRateTezabiFiTola: (v) => {
    const gram = Math.round((v / TOLA_IN_GRAMS) * 100) / 100
    set({ rateTezabiFiTola: v, rateTezabiFiGram: gram })
    saveData({ rateTezabiFiTola: v, rateTezabiFiGram: gram })
  },
}))
