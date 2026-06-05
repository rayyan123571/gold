import { create } from 'zustand'
import { db } from '@/db/db'

interface AuthState {
  isAuthenticated: boolean
  currentUser: string | null
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  error: null,

  login: async (username, password) => {
    const account = await db.accounts
      .where('username')
      .equals(username)
      .first()

    if (!account || account.password !== password) {
      set({ error: 'Invalid username or password' })
      return false
    }

    set({ isAuthenticated: true, currentUser: username, error: null })
    return true
  },

  register: async (username, password) => {
    const existing = await db.accounts
      .where('username')
      .equals(username)
      .first()

    if (existing) {
      set({ error: 'Username already taken' })
      return false
    }

    await db.accounts.add({
      username,
      password,
      created_at: new Date(),
    })

    set({ isAuthenticated: true, currentUser: username, error: null })
    return true
  },

  logout: () => {
    set({ isAuthenticated: false, currentUser: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
