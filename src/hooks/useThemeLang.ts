import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useThemeLang() {
  const { i18n } = useTranslation()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  const toggleTheme = useCallback(() => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }, [dark])

  const toggleLang = useCallback(() => {
    const next = i18n.language === 'en' ? 'ur' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    document.documentElement.dir = next === 'ur' ? 'rtl' : 'ltr'
  }, [i18n])

  return { dark, toggleTheme, toggleLang }
}
