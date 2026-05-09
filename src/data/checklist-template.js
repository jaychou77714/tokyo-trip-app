// 行前 Checklist 預設模板（35 項，分 7 類）

export const CHECKLIST_CATEGORIES = [
  { id: 'docs', name: '證件/文件', emoji: '📋', color: '#E84E4E' },
  { id: 'money', name: '金錢', emoji: '💰', color: '#F0B450' },
  { id: 'transport', name: '交通', emoji: '🚇', color: '#3D2817' },
  { id: 'tech', name: '3C', emoji: '📱', color: '#A8C5D9' },
  { id: 'clothes', name: '衣物', emoji: '👕', color: '#FF8B5A' },
  { id: 'health', name: '藥品/衛生', emoji: '💊', color: '#7FA468' },
  { id: 'luggage', name: '行李', emoji: '🎒', color: '#6B4423' },
  { id: 'predeparture', name: '出發前確認', emoji: '📝', color: '#D4B896' },
]

export const CHECKLIST_TEMPLATE = [
  // 證件/文件 (6)
  { category: 'docs', name: '護照（效期 6 個月以上）', desc: '入境日本須 6 個月以上效期' },
  { category: 'docs', name: '機票電子檔（往返）', desc: '截圖 + 雲端各備一份' },
  { category: 'docs', name: 'Visit Japan Web QR Code', desc: '入境時掃描，省排隊' },
  { category: 'docs', name: '旅遊保險投保單', desc: '建議投保含醫療' },
  { category: 'docs', name: '證件影本（紙本+雲端）', desc: '護照、簽證、信用卡備份' },
  { category: 'docs', name: '國際駕照（如需租車）', desc: '在台領，日本租車必備' },

  // 金錢 (4)
  { category: 'money', name: '日幣現金', desc: '建議 5000 円 × N 天' },
  { category: 'money', name: '信用卡（開通海外刷卡）', desc: '事先打 0800 開通' },
  { category: 'money', name: '金融卡（海外提款）', desc: '7-11 ATM 可領日幣' },
  { category: 'money', name: '退稅資訊備忘', desc: '消耗品/一般物品 ¥5,000 起' },

  // 交通 (4)
  { category: 'transport', name: '機場接送預訂', desc: 'Skyliner / NEX / 利木津巴士' },
  { category: 'transport', name: 'JR Pass 兌換券', desc: '需在台先買，到日本兌換' },
  { category: 'transport', name: 'Suica / Pasmo 卡', desc: '可手機 NFC 加入 Apple Wallet' },
  { category: 'transport', name: '地圖/乘換 App', desc: 'Google Maps / Yahoo 乘換案內' },

  // 3C (5)
  { category: 'tech', name: '手機 + 充電線', desc: '備用線一條' },
  { category: 'tech', name: '行動電源（必須手提）', desc: '不可托運' },
  { category: 'tech', name: '萬用轉接頭（日本 A 型 2 孔）', desc: '日本插座 100V' },
  { category: 'tech', name: '相機 + 記憶卡 + 備用電池', desc: '記憶卡可帶 2 張替換' },
  { category: 'tech', name: 'SIM 卡 / WiFi 機', desc: 'eSIM 最方便（如 Airalo）' },

  // 衣物 (4)
  { category: 'clothes', name: '季節衣物（依預報）', desc: '看出發前一週天氣' },
  { category: 'clothes', name: '舒適好走的鞋', desc: '日本一天走 1-2 萬步' },
  { category: 'clothes', name: '雨具（折傘/雨衣）', desc: '日本天氣多變' },
  { category: 'clothes', name: '內衣襪備份', desc: '至少 N+1 套' },

  // 藥品/衛生 (4)
  { category: 'health', name: '個人常備藥', desc: '感冒、止痛、過敏藥' },
  { category: 'health', name: '暈車/暈船藥', desc: '搭新幹線/船遊也可能用' },
  { category: 'health', name: 'OK 繃 / 痠痛貼布', desc: '走太多路必備' },
  { category: 'health', name: '個人衛浴用品（小瓶）', desc: '飯店有但用慣的可帶' },

  // 行李 (3)
  { category: 'luggage', name: '行李箱（檢查鎖頭）', desc: 'TSA 鎖最方便' },
  { category: 'luggage', name: '隨身包/後背包', desc: '裝重要證件、3C' },
  { category: 'luggage', name: '收納袋 / 真空袋', desc: '回程戰利品空間' },

  // 出發前確認 (5)
  { category: 'predeparture', name: '查目的地天氣預報', desc: '出發前 3 天再看一次' },
  { category: 'predeparture', name: '熱門餐廳 / 景點預訂', desc: 'teamLab、米其林等' },
  { category: 'predeparture', name: '通知銀行海外消費', desc: '免被當盜刷凍卡' },
  { category: 'predeparture', name: '家中安全（門窗、瓦斯、電器）', desc: '出門前再檢查一次' },
  { category: 'predeparture', name: '寵物/植物託付', desc: '長假需要安排' },
]

// 工具：從模板生成初始項目（給 trip 用）
export function generateInitialChecklist(tripId) {
  return CHECKLIST_TEMPLATE.map((item, idx) => ({
    trip_id: tripId,
    category: item.category,
    item_name: item.name,
    item_desc: item.desc || '',
    is_done: false,
    is_custom: false,
    sort_order: idx,
  }))
}
