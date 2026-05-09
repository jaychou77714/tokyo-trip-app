import React, { useState, useEffect } from 'react'
import { Sun, Moon, Clock, ArrowRight } from 'lucide-react'

/**
 * 日本時間小卡 + 時差換算器
 */
export default function JapanClock() {
  const [tick, setTick] = useState(0)
  const [showConverter, setShowConverter] = useState(false)
  const [twTime, setTwTime] = useState('')

  useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // 取得日本時間（UTC+9）
  const now = new Date()
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000)
  const jpTime = new Date(utcMs + 9 * 60 * 60000)
  const twTimeNow = new Date(utcMs + 8 * 60 * 60000)

  const fmt = (d) => {
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const fmtDate = (d) => {
    const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
    return `${d.getMonth() + 1}/${d.getDate()} (${week})`
  }

  // 簡易日出日落（東京緯度 35.65°，使用近似公式）
  const sunTimes = calcSunTimes(jpTime)

  // 時差換算
  function tw2jp(twStr) {
    if (!twStr) return ''
    const [h, m] = twStr.split(':').map(n => parseInt(n))
    if (isNaN(h) || isNaN(m)) return ''
    let jpH = h + 1
    if (jpH >= 24) jpH -= 24
    return `${String(jpH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  return (
    <div className="paper-plain p-3 mb-3"
      style={{ border: '1.5px solid #3D2817', boxShadow: '2px 2px 0 #A8C5D9' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-widest uppercase text-usuzumi font-mono">★ 東京時間 · TOKYO TIME</span>
        <button
          onClick={() => setShowConverter(!showConverter)}
          className="text-[10px] text-shu underline font-display"
        >
          {showConverter ? '收起' : '時差換算'}
        </button>
      </div>

      <div className="flex items-baseline gap-2">
        <Clock size={14} className="text-shu" />
        <span className="font-mono font-bold text-2xl">{fmt(jpTime)}</span>
        <span className="text-xs text-usuzumi font-mono">{fmtDate(jpTime)}</span>
      </div>

      <div className="mt-2 text-[11px] text-usuzumi font-display flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Sun size={11} className="text-kohaku" /> 日出 {sunTimes.sunrise}
        </span>
        <span className="flex items-center gap-1">
          <Moon size={11} className="text-sora" /> 日落 {sunTimes.sunset}
        </span>
        <span className="ml-auto text-[10px]">與台灣 +1 小時</span>
      </div>

      {/* 時差換算器 */}
      {showConverter && (
        <div className="mt-3 pt-3 border-t border-dashed border-gold">
          <div className="text-[10px] text-usuzumi font-mono mb-2">★ 台灣 → 日本</div>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={twTime}
              onChange={(e) => setTwTime(e.target.value)}
              placeholder="台灣時間"
              className="form-input text-sm flex-1"
            />
            <ArrowRight size={14} className="text-usuzumi" />
            <div className="font-mono font-bold text-sm text-shu" style={{ minWidth: '60px' }}>
              {twTime ? tw2jp(twTime) : '--:--'}
            </div>
          </div>
          <p className="text-[10px] text-usuzumi mt-1 font-display italic">
            台灣 {fmt(twTimeNow).slice(0, 5)} = 日本 {fmt(jpTime).slice(0, 5)}（差 +1）
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * 計算東京日出日落（近似算法，誤差約 5 分鐘內）
 * 緯度：35.65°N，經度：139.65°E
 */
function calcSunTimes(date) {
  const lat = 35.65
  const lng = 139.65

  // 一年中的日序
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - start) / (24 * 60 * 60 * 1000))

  // 太陽赤緯
  const decl = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))

  // 時角
  const latRad = lat * Math.PI / 180
  const declRad = decl * Math.PI / 180
  const cosH = -Math.tan(latRad) * Math.tan(declRad)

  if (cosH < -1 || cosH > 1) return { sunrise: '--:--', sunset: '--:--' }

  const H = Math.acos(cosH) * 180 / Math.PI / 15  // 轉小時

  // 標準時間（日本是 UTC+9，標準經度 135°E）
  const offset = (135 - lng) / 15  // 經度修正（小時）
  const sunriseHour = 12 - H + offset
  const sunsetHour = 12 + H + offset

  const fmt = (h) => {
    const hh = Math.floor(h)
    const mm = Math.floor((h - hh) * 60)
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  return {
    sunrise: fmt(sunriseHour),
    sunset: fmt(sunsetHour),
  }
}
