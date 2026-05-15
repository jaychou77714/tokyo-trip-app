import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { Plane } from 'lucide-react'

/**
 * 首頁倒數 Banner（顯示最近的行程）
 * Props:
 * - trips: 所有行程
 */
export default function CountdownBanner({ trips }) {
  const [, force] = useState(0)

  // 每秒更新（讓秒數跑動）
  useEffect(() => {
    const id = setInterval(() => force(x => x + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // 找最近的行程（出發日尚未過 + 最接近今天）
  const nextTrip = (() => {
    const today = dayjs().startOf('day')
    const upcoming = trips
      .filter(t => t.start_date)
      .map(t => ({ ...t, start: dayjs(t.start_date) }))
      .filter(t => t.start.isAfter(today) || t.start.isSame(today))
      .sort((a, b) => a.start.diff(b.start))
    return upcoming[0] || null
  })()

  if (!nextTrip) return null

  const now = dayjs()
  const target = dayjs(nextTrip.start_date).startOf('day')
  const days = target.diff(now, 'day')
  const hours = target.diff(now, 'hour') % 24
  const mins = target.diff(now, 'minute') % 60
  const secs = target.diff(now, 'second') % 60

  // 計算「幾個週末」「幾次發薪日」幽默備註
  const weekends = Math.floor(days / 7)
  const paydays = Math.floor(days / 30)

  let funny = ''
  if (days > 14) funny = `約 ${weekends} 個週末 · ${paydays > 0 ? `${paydays} 次發薪日後 😆` : '快了快了'}`
  else if (days > 7) funny = `🎒 行李可以開始準備了`
  else if (days > 3) funny = `🛂 護照、機票準備好了嗎？`
  else if (days > 0) funny = `✈️ 即將起飛！今晚整理一下吧`
  else if (days === 0) funny = `🎉 出發就在今天！`
  else funny = `🌸 旅行中，慢慢享受`

  return (
    <div
      className="paper-plain p-4 mb-5 relative overflow-hidden"
      style={{
        border: '2px solid #3D2817',
        boxShadow: '4px 4px 0 #FF8B5A',
      }}
    >
      {/* 紙膠帶裝飾 */}
      <div className="absolute -top-2 left-6 w-20 h-4"
        style={{
          background: '#FF8B5A',
          backgroundImage: 'linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.4) 47%, rgba(255,255,255,0.4) 53%, transparent 53%)',
          transform: 'rotate(-3deg)',
        }} />

      <div className="flex items-start gap-3">
        <Plane size={20} className="text-shu mt-1" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-usuzumi tracking-widest uppercase font-mono">
            ✈️ NEXT TRIP COUNTDOWN
          </div>
          <h3 className="editorial-title text-base mb-2 truncate">{nextTrip.title}</h3>

          {days > 0 ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-display font-bold text-shu" style={{ fontSize: '32px', lineHeight: 1 }}>
                {days}
              </span>
              <span className="text-xs text-usuzumi font-display">天</span>
              <span className="text-base text-sumi font-mono ml-2">
                {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          ) : days === 0 ? (
            <div className="font-display font-bold text-2xl text-shu animate-pulse">今天出發！</div>
          ) : (
            <div className="font-display text-base text-wakaba">🌸 旅行中，{Math.abs(days)} 天前出發</div>
          )}

          <div className="text-[11px] text-usuzumi font-display mt-1 italic">{funny}</div>
        </div>
      </div>
    </div>
  )
}
