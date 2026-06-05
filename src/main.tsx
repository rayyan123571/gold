import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App'
import { seedTestAccount } from '@/setup/seedAccounts'

const theme = localStorage.getItem('theme')
if (theme === 'dark') {
  document.documentElement.classList.add('dark')
}

const lang = localStorage.getItem('lang')
if (lang === 'ur') {
  document.documentElement.dir = 'rtl'
}

// Memory diagnostics in dev
let memInterval: ReturnType<typeof setInterval> | null = null
if (import.meta.env.DEV) {
  memInterval = setInterval(() => {
    const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
    if (mem) {
      console.log(
        `[MEMORY renderer] Used: ${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB | ` +
        `Total: ${Math.round(mem.totalJSHeapSize / 1024 / 1024)}MB | ` +
        `Limit: ${Math.round(mem.jsHeapSizeLimit / 1024 / 1024)}MB`
      )
    }
    const count = document.getElementsByTagName('*').length
    console.log(`[MEMORY renderer] DOM nodes: ${count}`)
  }, 5000)
}

if (memInterval && import.meta.env.PROD) {
  clearInterval(memInterval)
}

// Seed a test account if none exists, then render app
seedTestAccount().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})