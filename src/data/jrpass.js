// 7 種 JR Pass / 交通票券資料
// 註：價格為 2026 年參考價，可能調整，建議出發前確認官網

export const JR_PASSES = [
  {
    id: 'tokyo-subway-24',
    name_zh: '東京地鐵 24 小時券',
    name_jp: 'Tokyo Subway 24-hour Ticket',
    price: 800,
    days: 1,
    duration_hours: 24,
    coverage: '東京 Metro 全線（9 線）+ 都營地下鐵全線（4 線）',
    notes: '從第一次刷卡起 24 小時內無限次搭乘。不含 JR、私鐵',
    target: '單日密集逛市區、轉乘多',
    color: '#3D2817',
    avg_trips_breakeven: 4, // 大概 4 趟以上划算
    sale_locations: '機場、Bic Camera、東京 Metro 服務台',
  },
  {
    id: 'tokyo-subway-48',
    name_zh: '東京地鐵 48 小時券',
    name_jp: 'Tokyo Subway 48-hour Ticket',
    price: 1200,
    days: 2,
    duration_hours: 48,
    coverage: '東京 Metro 全線 + 都營地下鐵全線',
    notes: '2 天無限搭，不含 JR、私鐵',
    target: '2 天市區行程',
    color: '#FF8B5A',
    avg_trips_breakeven: 6,
    sale_locations: '機場、Bic Camera、東京 Metro 服務台',
  },
  {
    id: 'tokyo-subway-72',
    name_zh: '東京地鐵 72 小時券',
    name_jp: 'Tokyo Subway 72-hour Ticket',
    price: 1500,
    days: 3,
    duration_hours: 72,
    coverage: '東京 Metro 全線 + 都營地下鐵全線',
    notes: '最熱門！3 天無限搭，平均 ¥500/天',
    target: '3 天市區行程，CP 值最高',
    color: '#E84E4E',
    avg_trips_breakeven: 7,
    sale_locations: '機場、Bic Camera、東京 Metro 服務台',
  },
  {
    id: 'tokyo-1day',
    name_zh: '東京一日券（都區內）',
    name_jp: '東京フリーきっぷ',
    price: 760,
    days: 1,
    duration_hours: 24,
    coverage: 'JR 山手線 + 中央/總武線（東京都區內）一日無限',
    notes: '只含 JR，不含 Metro/都營',
    target: '只搭 JR 山手線繞市區',
    color: '#7FA468',
    avg_trips_breakeven: 4,
    sale_locations: 'JR 各車站售票機',
  },
  {
    id: 'greater-tokyo',
    name_zh: 'Greater Tokyo Pass',
    name_jp: 'Greater Tokyo Pass',
    price: 7200,
    days: 5,
    duration_hours: 120,
    coverage: '關東 13 都縣 JR + 私鐵（東武、京成、京急、相模等 12 條）',
    notes: '不含新幹線、特急。可去鎌倉、橫濱、日光、輕井澤等',
    target: '關東近郊 5 天深度遊',
    color: '#A8C5D9',
    avg_trips_breakeven: 0,
    sale_locations: '機場、JR 服務台',
  },
  {
    id: 'jr-tokyo-wide',
    name_zh: 'JR Tokyo Wide Pass',
    name_jp: 'JR TOKYO Wide Pass',
    price: 15000,
    days: 3,
    duration_hours: 72,
    coverage: 'JR 東日本（首都圈+日光、輕井澤、富士山、伊豆、GALA 滑雪場）',
    notes: '含新幹線、特急！跨城市 CP 值高',
    target: '3 天去日光/輕井澤/富士急等',
    color: '#F0B450',
    avg_trips_breakeven: 0,
    sale_locations: '機場、JR EAST 訂位處（外國人專用）',
  },
  {
    id: 'jr-pass-7',
    name_zh: 'JR Pass 全國版 7 天',
    name_jp: 'Japan Rail Pass 7 days',
    price: 50000,
    days: 7,
    duration_hours: 168,
    coverage: '全日本 JR 線（含新幹線，但不含 NOZOMI / MIZUHO）',
    notes: '7 天 ¥50,000（2023/10 漲價後）。建議跨城市才划算',
    target: '東京+大阪+京都+廣島跨城市',
    color: '#6B4423',
    avg_trips_breakeven: 0,
    sale_locations: '在台代理商買兌換券，到日本換實體 Pass',
  },
]

// 平均單程票價（東京 Metro 估算用）
export const AVG_FARE_TOKYO_METRO = 220 // 東京 Metro 全線平均
export const AVG_FARE_JR_YAMANOTE = 180 // JR 山手線平均
export const AVG_FARE_LONG_DISTANCE = 800 // 跨城市/特急平均

// 工具：估算行程內所需票價
// trips_count = 行程內地點移動次數
export function estimateTripFare(tripsCount, avgFare = AVG_FARE_TOKYO_METRO) {
  return tripsCount * avgFare
}

// 工具：判斷某 Pass 是否划算
export function evaluatePass(pass, estimatedFare, tripDays) {
  const passDailyAvg = pass.price / pass.days
  const fareDailyAvg = tripDays > 0 ? estimatedFare / tripDays : 0
  const savings = estimatedFare - pass.price
  const isWorthIt = savings > 0
  return {
    passDailyAvg: Math.round(passDailyAvg),
    fareDailyAvg: Math.round(fareDailyAvg),
    savings: Math.round(savings),
    isWorthIt,
    coverageMatch: tripDays >= pass.days, // 天數是否覆蓋
  }
}

export const FARE_OPTIONS = [
  { value: 220, label: '東京市內 Metro（¥220）', desc: '都心地鐵移動為主' },
  { value: 180, label: 'JR 山手線（¥180）', desc: '只搭 JR 環狀線' },
  { value: 350, label: '混合 Metro + JR（¥350）', desc: '兩者都搭' },
  { value: 800, label: '跨區/特急（¥800）', desc: '日光、橫濱等近郊' },
  { value: 1500, label: '長距離/新幹線（¥1500+）', desc: '東京-大阪等城市間' },
]
