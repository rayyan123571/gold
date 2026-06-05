import { useState, useEffect } from 'react'

interface GoldRateResponse {
  price: number
  currency: string
  timestamp: number
  error?: string
}

const FALLBACK_RATE = 285000

export function useGoldRate() {
  const [rate, setRate] = useState<number>(FALLBACK_RATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualRate, setManualRate] = useState<number | null>(null)

  const fetchRate = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('https://api.gold-api.com/price/XAU/PKR', {
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: GoldRateResponse = await res.json()
      if (data.price > 0) {
        setRate(data.price)
        localStorage.setItem('lastGoldRate', String(data.price))
        localStorage.setItem('lastGoldRateTime', String(Date.now()))
      }
    } catch (e) {
      const cached = localStorage.getItem('lastGoldRate')
      if (cached) {
        setRate(Number(cached))
        setError('Using cached rate')
      } else {
        setError('Could not fetch rate')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cached = localStorage.getItem('lastGoldRate')
    const cachedTime = localStorage.getItem('lastGoldRateTime')
    const oneHour = 3600000

    if (cached && cachedTime && Date.now() - Number(cachedTime) < oneHour) {
      setRate(Number(cached))
    } else {
      fetchRate()
    }
  }, [])

  const effectiveRate = manualRate ?? rate

  return {
    rate: effectiveRate,
    liveRate: rate,
    loading,
    error,
    manualRate,
    setManualRate,
    refresh: fetchRate,
  }
}
