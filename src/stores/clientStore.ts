import { create } from 'zustand'
import { db, type Client } from '@/db/db'

interface ClientState {
  clients: Client[]
  selectedClient: Client | null
  searchQuery: string
  searchResults: Client[]
  loading: boolean
  fetchClients: () => Promise<void>
  searchClients: (query: string) => Promise<void>
  selectClient: (client: Client | null) => void
  addClient: (naam: string, phone: string) => Promise<Client>
  updateClient: (id: number, data: Partial<Client>) => Promise<void>
  deleteClient: (id: number) => Promise<void>
  setSearchQuery: (query: string) => void
  navigateClient: (direction: 'prev' | 'next') => Promise<void>
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  selectedClient: null,
  searchQuery: '',
  searchResults: [],
  loading: false,

  fetchClients: async () => {
    try {
      set({ loading: true })
      const clients = await db.clients.toArray()
      set({ clients, loading: false })
    } catch (err) {
      console.error('fetchClients failed', err)
      set({ loading: false })
    }
  },

  searchClients: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], searchQuery: query })
      return
    }
    try {
      set({ loading: true, searchQuery: query })
      const results = await db.clients
        .filter(
          (c) =>
            c.naam.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query) ||
            c.code.includes(query)
        )
        .toArray()
      set({ searchResults: results, loading: false })
    } catch (err) {
      console.error('searchClients failed', err)
      set({ loading: false })
    }
  },

  selectClient: (client) => {
    set({ selectedClient: client })
  },

  addClient: async (naam, phone) => {
    try {
      const last = await db.clients.orderBy('code').last()
      const nextCode = String((parseInt(last?.code ?? '0', 10) + 1)).padStart(3, '0')
      const id = await db.clients.add({
        code: nextCode,
        naam,
        phone,
        balance_sona: 0,
        balance_cash: 0,
        created_at: new Date(),
      })
      const client = await db.clients.get(id!)
      await get().fetchClients()
      return client!
    } catch (err) {
      console.error('addClient failed', err)
      throw err
    }
  },

  updateClient: async (id, data) => {
    try {
      await db.clients.update(id, data)
      await get().fetchClients()
    } catch (err) {
      console.error('updateClient failed', err)
      throw err
    }
  },

  deleteClient: async (id) => {
    try {
      await db.clients.delete(id)
      set({ selectedClient: null })
      await get().fetchClients()
    } catch (err) {
      console.error('deleteClient failed', err)
      throw err
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  navigateClient: async (direction: 'prev' | 'next') => {
    try {
      const { selectedClient } = get()
      const all = await db.clients.orderBy('code').toArray()
      if (all.length === 0) return

      let idx = all.findIndex((c) => c.id === selectedClient?.id)
      if (idx === -1) {
        idx = direction === 'next' ? -1 : all.length
      }

      const nextIdx = direction === 'next'
        ? Math.min(idx + 1, all.length - 1)
        : Math.max(idx - 1, 0)

      const client = all[nextIdx]
      set({ selectedClient: client, searchQuery: client.naam })
    } catch (err) {
      console.error('navigateClient failed', err)
    }
  },
}))
