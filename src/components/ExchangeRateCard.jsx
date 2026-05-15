import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getJpyToTwdRate } from '../lib/exchange'

const RATE_HISTORY_KEY = 'tokyo_trip_rate_history'

/**
 * 即時匯率小卡 + 趨勢
 */
export default function ExchangeRateCard() {
  const [rate, setRate] = useState(null)
  const [trend, setTrend] = useState(null)  // 'up' | 'down' | 'flat' | null
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    loadRate()
  }, [])

  async function loadRate() {
    const current = await getJpyToTwdRate()
    setRate(current)

    // 讀歷史紀錄
    let history = []
    try {
      history = JSON.parse(localStorage.getItem(RATE_HISTORY_KEY) || '[]')
    } catch {}

    // 加入今天的紀錄（每天最多一筆）
    const today = new Date().toISOString().slice(0, 10)
    const todayIdx = history.findIndex(h => h.date === today)
    if (todayIdx >= 0) {
      history[todayIdx].rate = current
    } else {
      history.push({ date: today, rate: current })
    }
    // 保留最近 30 天
    history = history.slice(-30)
    localStorage.setItem(RATE_HISTORY_KEY, JSON.stringify(history))

    // 算趨勢（vs 7 天前）
    if (history.length >= 2) {
      const past = history[Math.max(0, history.length - 8)]  // 7 天前或最早的
      if (past && past.rate) {
        const d = current - past.rate
        const diffPct = (d / past.rate * 100)
        setDiff(diffPct)
        if (Math.abs(diffPct) < 0.1) setTrend('flat')
        else if (d > 0) setTrend('up')
        else setTrend('down')
      }
    }
  }

  if (rate === null) return null

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? '#7FA468' : trend === 'down' ? '#E84E4E' : '#6B4423'
  // 對台幣來說：rate 上升 = 日幣變貴（不利換）/ 下降 = 日幣便宜（適合換）
  const advice = trend === 'down' ? '日圓便宜，適合換錢' : trend === 'up' ? '日圓變貴' : '匯率穩定'

  return (
    <div className="paper-plain p-3 mb-3"
      style={{ border: '1.5px solid #3D2817', boxShadow: '2px 2px 0 #F0B450' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] tracking-widest uppercase text-usuzumi font-mono">
          ★ 即時匯率 · TWD ↔ JPY
        </span>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: trendColor }}>
            <TrendIcon size={10} />
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold text-xl">{rate.toFixed(4)}</span>
        <span className="text-xs text-usuzumi font-display">JPY/TWD</span>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono">
        <span className="text-sumi">換 ¥10,000 ≈ NT$ {Math.round(10000 * rate).toLocaleString()}</span>
        <span className="font-display italic" style={{ color: trendColor }}>{advice}</span>
      </div>

      <p className="text-[10px] text-usuzumi mt-1 font-display italic">
        ※ 趨勢 vs 7 天前 · 來源 Bank of Taiwan
      </p>
    </div>
  )
}
