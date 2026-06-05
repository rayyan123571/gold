import { create } from 'zustand'

export interface ArchimedesSelection {
  khaalis: number
  milawatFiGram: number
  milawatFiTola: number
  goldRate: number
  laabCharges: number
  total: number
  baqi: number
}

interface ArchimedesState {
  selected: ArchimedesSelection | null
  selectRow: (data: ArchimedesSelection | null) => void
}

export const useArchimedesStore = create<ArchimedesState>((set) => ({
  selected: null,
  selectRow: (data) => set({ selected: data }),
}))
