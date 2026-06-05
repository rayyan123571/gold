import { create } from 'zustand'
import { db } from '@/db/db'
import bcrypt from 'bcryptjs'

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
    try {
      const account = await db.accounts
        .where('username')
        .equals(username)
        .first()

      if (!account) {
        set({ error: 'Invalid username or password' })
        return false
      }

      if (account.password_hash) {
        const match = await bcrypt.compare(password, account.password_hash)
        if (!match) {
          set({ error: 'Invalid username or password' })
          return false
        }
      } else if ((account as any).password !== undefined) {
        // legacy plaintext password: verify and migrate
        if ((account as any).password !== password) {
          set({ error: 'Invalid username or password' })
          return false
        }
        const hashed = await bcrypt.hash(password, 10)
        if (account.id) {
          await db.accounts.update(account.id, { password_hash: hashed })
        }
      } else {
        set({ error: 'Invalid username or password' })
        return false
      }

      set({ isAuthenticated: true, currentUser: username, error: null })
      return true
    } catch (err) {
      set({ error: 'Login failed' })
      return false
    }
  },

  register: async (username, password) => {
    try {
      const existing = await db.accounts
        .where('username')
        .equals(username)
        .first()

      if (existing) {
        set({ error: 'Username already taken' })
        return false
      }

      const hashed = await bcrypt.hash(password, 10)

      await db.accounts.add({
        username,
        password_hash: hashed,
        created_at: new Date(),
      })

      set({ isAuthenticated: true, currentUser: username, error: null })
      return true
    } catch (err) {
      set({ error: 'Registration failed' })
      return false
    }
  },

  logout: () => {
    set({ isAuthenticated: false, currentUser: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
