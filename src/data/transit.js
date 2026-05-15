// 景點間移動方式定義（v1.7）
export const TRANSIT_MODES = [
  { id: 'walk',  emoji: '🚶', name: '步行',   color: '#7FA468' },
  { id: 'train', emoji: '🚇', name: '電車',   color: '#A8C5D9' },
  { id: 'bus',   emoji: '🚌', name: '公車',   color: '#F0B450' },
  { id: 'taxi',  emoji: '🚕', name: '計程車', color: '#FF8B5A' },
]

export const TRANSIT_MAP = Object.fromEntries(TRANSIT_MODES.map(t => [t.id, t]))

export function getTransitMode(id) {
  return TRANSIT_MAP[id] || TRANSIT_MODES[0]
}

// 第一個景點時，表示「從飯店出發」
export const FROM_HOTEL_LABEL = '🏨 從住宿地點出發'
