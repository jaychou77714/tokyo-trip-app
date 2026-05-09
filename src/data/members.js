// 8 色給共編成員自動分配
export const MEMBER_COLORS = [
  '#FF8B5A', // 橘 (擁有者預設)
  '#A8C5D9', // 藍
  '#7FA468', // 綠
  '#F0B450', // 黃
  '#C794D9', // 紫
  '#E84E4E', // 紅
  '#5DC9C9', // 青
  '#F5A4C4', // 粉
]

export const MEMBER_COLOR_NAMES = {
  '#FF8B5A': '橘',
  '#A8C5D9': '藍',
  '#7FA468': '綠',
  '#F0B450': '黃',
  '#C794D9': '紫',
  '#E84E4E': '紅',
  '#5DC9C9': '青',
  '#F5A4C4': '粉',
}

// 從現有成員取得未使用的顏色
export function getNextColor(usedColors) {
  for (const c of MEMBER_COLORS) {
    if (!usedColors.includes(c)) return c
  }
  return MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]
}

// 產生分享碼（8 字元）
export function generateShareCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // 排除易混淆字
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// 取得相對時間
export function getRelativeTime(timestamp) {
  if (!timestamp) return ''
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now - past
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return '剛剛'
  if (diffMin < 60) return `${diffMin}分鐘前`
  if (diffHour < 24) return `${diffHour}小時前`
  if (diffDay < 7) return `${diffDay}天前`

  return past.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
}
