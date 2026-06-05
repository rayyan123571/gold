import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/db/db'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

interface DailyData {
  date: string
  buy: number
  sell: number
  profit: number
}

export function AnalyticsDashboard() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const [data, setData] = useState<DailyData[]>([])

  useEffect(() => {
    const load = async () => {
      const naqad = await db.naqad_receipts.toArray()
      const laab = await db.laab_receipts.toArray()

      const dailyMap = new Map<string, DailyData>()

      for (const r of naqad) {
        if (!dailyMap.has(r.date)) {
          dailyMap.set(r.date, { date: r.date, buy: 0, sell: 0, profit: 0 })
        }
        const entry = dailyMap.get(r.date)!
        if (r.type === 'buy') entry.buy += r.qeemat
        else entry.sell += r.qeemat
      }

      for (const r of laab) {
        if (!dailyMap.has(r.date)) {
          dailyMap.set(r.date, { date: r.date, buy: 0, sell: 0, profit: 0 })
        }
        const entry = dailyMap.get(r.date)!
        entry.profit += r.total - r.charges
      }

      setData(Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)))
    }

    load()
  }, [])

  return (
    <Card className="border-amber-200 dark:border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400">
          {isUrdu ? 'تجزیہ' : 'Analytics'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {isUrdu ? 'کافی ڈیٹا نہیں' : 'Not enough data'}
          </p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-amber-200/50" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="buy" fill="#c9a84c" name={isUrdu ? 'خرید' : 'Buy'} radius={[2, 2, 0, 0]} />
                <Bar dataKey="sell" fill="#22c55e" name={isUrdu ? 'فروخت' : 'Sell'} radius={[2, 2, 0, 0]} />
                <Bar dataKey="profit" fill="#3b82f6" name={isUrdu ? 'منافع' : 'Profit'} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
