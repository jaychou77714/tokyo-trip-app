// 匯率：JPY → TWD（使用免費 API + 快取）

const CACHE_KEY = 'tokyo_trip_rate_cache'
const CACHE_TTL = 1000 * 60 * 60 * 6 // 6 小時

// 預設匯率（API 失敗時使用，數字為 1 JPY = ? TWD）
const FALLBACK_RATE = 0.21

export async function getJpyToTwdRate() {
  // 讀快取
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const cache = JSON.parse(raw)
      if (Date.now() - cache.ts < CACHE_TTL) {
        return cache.rate
      }
    }
  } catch {}

  // 從 API 取（用 open.er-api.com，免費無需金鑰）
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/JPY')
    const data = await res.json()
    if (data && data.rates && data.rates.TWD) {
      const rate = data.rates.TWD
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, ts: Date.now() }))
      return rate
    }
  } catch (err) {
    console.warn('匯率 API 失敗，使用預設值', err)
  }

  return FALLBACK_RATE
}
