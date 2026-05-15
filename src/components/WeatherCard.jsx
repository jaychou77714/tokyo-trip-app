import React, { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Zap, CloudFog } from 'lucide-react'
import dayjs from 'dayjs'

const WEATHER_CACHE_KEY = 'tokyo_trip_weather_cache'
const CACHE_DURATION = 3 * 60 * 60 * 1000  // 3 小時

/**
 * 天氣預報元件 - 用 Open-Meteo 免費 API
 * Props:
 * - startDate: 開始日期 'YYYY-MM-DD'
 * - endDate: 結束日期 'YYYY-MM-DD'
 * - compact: 簡潔模式（只顯示幾天）
 */
export default function WeatherCard({ startDate, endDate, compact = false }) {
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (startDate) loadWeather()
  }, [startDate, endDate])

  async function loadWeather() {
    // 先看快取
    try {
      const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || 'null')
      if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
        setForecast(cached.data)
        return
      }
    } catch {}

    setLoading(true)
    setError(null)
    try {
      // 東京：35.6762, 139.6503
      const url = `https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=16`
      const r = await fetch(url)
      if (!r.ok) throw new Error('天氣 API 錯誤')
      const data = await r.json()

      const days = (data.daily?.time || []).map((date, i) => ({
        date,
        code: data.daily.weather_code[i],
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        rain: data.daily.precipitation_probability_max[i] || 0,
      }))

      setForecast(days)

      // 快取
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        fetchedAt: Date.now(),
        data: days,
      }))
    } catch (err) {
      console.error('Weather error:', err)
      setError('天氣資料暫時無法取得')
    }
    setLoading(false)
  }

  if (loading) return <div className="text-xs text-usuzumi font-display">⏳ 天氣資料載入中...</div>

  if (error) {
    return (
      <div className="text-[11px] text-usuzumi font-display italic paper-plain p-2"
        style={{ border: '1.5px dashed #D4B896' }}>
        🌥 {error}
      </div>
    )
  }

  if (!forecast) return null

  // 篩選範圍內的天氣
  let displayDays = forecast
  if (startDate) {
    const start = dayjs(startDate)
    const end = endDate ? dayjs(endDate) : start
    displayDays = forecast.filter(d => {
      const day = dayjs(d.date)
      return (day.isAfter(start) || day.isSame(start)) && (day.isBefore(end) || day.isSame(end))
    })
  }

  if (displayDays.length === 0) {
    return (
      <div className="text-[11px] text-usuzumi font-display italic paper-plain p-2"
        style={{ border: '1.5px dashed #D4B896' }}>
        🌥 出發日太遠（&gt; 16 天）天氣 API 暫時拿不到，記得出發前一週再來看
      </div>
    )
  }

  // 簡潔模式：只顯示前 3 天
  if (compact) displayDays = displayDays.slice(0, 5)

  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-usuzumi font-mono mb-1.5">
        🌤 東京天氣 · {displayDays.length} 天
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {displayDays.map((d, i) => (
          <DayWeatherCard key={d.date} day={d} />
        ))}
      </div>
    </div>
  )
}

function DayWeatherCard({ day }) {
  const date = dayjs(day.date)
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.day()]
  const { icon: Icon, label, color } = weatherCodeToIcon(day.code)
  const isRainy = day.rain >= 50

  return (
    <div
      className="flex-shrink-0 paper-plain p-2 text-center"
      style={{
        border: isRainy ? '1.5px solid #A8C5D9' : '1.5px dashed #D4B896',
        minWidth: '60px',
      }}
    >
      <div className="text-[10px] text-usuzumi font-mono">{date.format('M/D')}</div>
      <div className="text-[10px] font-display">週{weekDay}</div>
      <Icon size={20} className="mx-auto my-1" style={{ color }} />
      <div className="text-[10px] font-display">{label}</div>
      <div className="text-[11px] font-mono mt-0.5">
        <span className="text-stamp">{Math.round(day.max)}°</span>
        <span className="text-usuzumi">/{Math.round(day.min)}°</span>
      </div>
      {day.rain >= 30 && (
        <div className="text-[9px] text-sora font-mono mt-0.5">☂ {day.rain}%</div>
      )}
    </div>
  )
}

// WMO 天氣代碼對應
function weatherCodeToIcon(code) {
  if (code === 0) return { icon: Sun, label: '晴', color: '#F0B450' }
  if (code <= 3) return { icon: Cloud, label: '多雲', color: '#A8A8A8' }
  if (code <= 48) return { icon: CloudFog, label: '霧', color: '#C0C0C0' }
  if (code <= 57) return { icon: CloudDrizzle, label: '毛毛雨', color: '#A8C5D9' }
  if (code <= 67) return { icon: CloudRain, label: '雨', color: '#5DC9C9' }
  if (code <= 77) return { icon: CloudSnow, label: '雪', color: '#E0E0E0' }
  if (code <= 82) return { icon: CloudRain, label: '陣雨', color: '#5DC9C9' }
  if (code <= 86) return { icon: CloudSnow, label: '雪', color: '#E0E0E0' }
  if (code >= 95) return { icon: Zap, label: '雷雨', color: '#C794D9' }
  return { icon: Cloud, label: '陰', color: '#A8A8A8' }
}
