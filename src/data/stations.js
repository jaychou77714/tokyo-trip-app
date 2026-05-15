// 東京主要車站資料（JR 山手線 + Metro + 重要轉乘站）
// 註：座標為車站大致位置

export const STATIONS = [
  // ===== JR 山手線（順時針從東京站起）=====
  { id: 'tokyo', name_zh: '東京', name_jp: '東京', kana: 'Tokyo', lat: 35.6812, lng: 139.7671, lines: ['JR山手線','JR京葉線','JR中央線','JR東海道線','JR東北新幹線','東京Metro丸之內線'], area: '東京・丸之內' },
  { id: 'kanda', name_zh: '神田', name_jp: '神田', kana: 'Kanda', lat: 35.6918, lng: 139.7708, lines: ['JR山手線','JR京濱東北線','JR中央線','東京Metro銀座線'], area: '東京・丸之內' },
  { id: 'akihabara', name_zh: '秋葉原', name_jp: '秋葉原', kana: 'Akihabara', lat: 35.6985, lng: 139.7731, lines: ['JR山手線','JR京濱東北線','JR總武線','つくばエクスプレス','東京Metro日比谷線'], area: '東京・丸之內' },
  { id: 'okachimachi', name_zh: '御徒町', name_jp: '御徒町', kana: 'Okachimachi', lat: 35.7077, lng: 139.7748, lines: ['JR山手線','JR京濱東北線'], area: '淺草・上野' },
  { id: 'ueno', name_zh: '上野', name_jp: '上野', kana: 'Ueno', lat: 35.7138, lng: 139.7773, lines: ['JR山手線','JR京濱東北線','JR宇都宮線','JR常磐線','JR東北新幹線','東京Metro銀座線','東京Metro日比谷線'], area: '淺草・上野' },
  { id: 'uguisudani', name_zh: '鶯谷', name_jp: '鶯谷', kana: 'Uguisudani', lat: 35.7204, lng: 139.7785, lines: ['JR山手線','JR京濱東北線'], area: '淺草・上野' },
  { id: 'nippori', name_zh: '日暮里', name_jp: '日暮里', kana: 'Nippori', lat: 35.7281, lng: 139.7707, lines: ['JR山手線','JR京濱東北線','JR常磐線','京成本線','日暮里・舍人ライナー'], area: '谷根千・藏前' },
  { id: 'nishi-nippori', name_zh: '西日暮里', name_jp: '西日暮里', kana: 'Nishi-Nippori', lat: 35.7320, lng: 139.7669, lines: ['JR山手線','JR京濱東北線','東京Metro千代田線','日暮里・舍人ライナー'], area: '谷根千・藏前' },
  { id: 'tabata', name_zh: '田端', name_jp: '田端', kana: 'Tabata', lat: 35.7378, lng: 139.7610, lines: ['JR山手線','JR京濱東北線'], area: '其他' },
  { id: 'komagome', name_zh: '駒込', name_jp: '駒込', kana: 'Komagome', lat: 35.7363, lng: 139.7464, lines: ['JR山手線','東京Metro南北線'], area: '池袋' },
  { id: 'sugamo', name_zh: '巢鴨', name_jp: '巣鴨', kana: 'Sugamo', lat: 35.7335, lng: 139.7395, lines: ['JR山手線','都營三田線'], area: '池袋' },
  { id: 'otsuka', name_zh: '大塚', name_jp: '大塚', kana: 'Otsuka', lat: 35.7314, lng: 139.7286, lines: ['JR山手線','都電荒川線'], area: '池袋' },
  { id: 'ikebukuro', name_zh: '池袋', name_jp: '池袋', kana: 'Ikebukuro', lat: 35.7295, lng: 139.7109, lines: ['JR山手線','JR埼京線','JR湘南新宿線','東京Metro丸之內線','東京Metro有樂町線','東京Metro副都心線','西武池袋線','東武東上線'], area: '池袋' },
  { id: 'mejiro', name_zh: '目白', name_jp: '目白', kana: 'Mejiro', lat: 35.7212, lng: 139.7062, lines: ['JR山手線'], area: '池袋' },
  { id: 'takadanobaba', name_zh: '高田馬場', name_jp: '高田馬場', kana: 'Takadanobaba', lat: 35.7126, lng: 139.7038, lines: ['JR山手線','東京Metro東西線','西武新宿線'], area: '其他' },
  { id: 'shin-okubo', name_zh: '新大久保', name_jp: '新大久保', kana: 'Shin-Okubo', lat: 35.7012, lng: 139.7000, lines: ['JR山手線'], area: '新宿' },
  { id: 'shinjuku', name_zh: '新宿', name_jp: '新宿', kana: 'Shinjuku', lat: 35.6896, lng: 139.7006, lines: ['JR山手線','JR中央線','JR總武線','JR埼京線','JR湘南新宿線','東京Metro丸之內線','都營新宿線','都營大江戶線','京王線','小田急線'], area: '新宿' },
  { id: 'yoyogi', name_zh: '代代木', name_jp: '代々木', kana: 'Yoyogi', lat: 35.6831, lng: 139.7022, lines: ['JR山手線','JR總武線','都營大江戶線'], area: '新宿' },
  { id: 'harajuku', name_zh: '原宿', name_jp: '原宿', kana: 'Harajuku', lat: 35.6702, lng: 139.7026, lines: ['JR山手線','東京Metro千代田線','東京Metro副都心線（明治神宮前）'], area: '澀谷・原宿・表參道' },
  { id: 'shibuya', name_zh: '澀谷', name_jp: '渋谷', kana: 'Shibuya', lat: 35.6580, lng: 139.7016, lines: ['JR山手線','JR埼京線','JR湘南新宿線','東京Metro銀座線','東京Metro半藏門線','東京Metro副都心線','東急東橫線','東急田園都市線','京王井之頭線'], area: '澀谷・原宿・表參道' },
  { id: 'ebisu', name_zh: '惠比壽', name_jp: '恵比寿', kana: 'Ebisu', lat: 35.6464, lng: 139.7100, lines: ['JR山手線','JR埼京線','JR湘南新宿線','東京Metro日比谷線'], area: '澀谷・原宿・表參道' },
  { id: 'meguro', name_zh: '目黑', name_jp: '目黒', kana: 'Meguro', lat: 35.6334, lng: 139.7158, lines: ['JR山手線','東京Metro南北線','都營三田線','東急目黑線'], area: '中目黑・自由之丘' },
  { id: 'gotanda', name_zh: '五反田', name_jp: '五反田', kana: 'Gotanda', lat: 35.6258, lng: 139.7237, lines: ['JR山手線','都營淺草線','東急池上線'], area: '其他' },
  { id: 'osaki', name_zh: '大崎', name_jp: '大崎', kana: 'Osaki', lat: 35.6197, lng: 139.7286, lines: ['JR山手線','JR埼京線','JR湘南新宿線','りんかい線'], area: '其他' },
  { id: 'shinagawa', name_zh: '品川', name_jp: '品川', kana: 'Shinagawa', lat: 35.6285, lng: 139.7387, lines: ['JR山手線','JR京濱東北線','JR東海道線','JR橫須賀線','JR東海道新幹線','京急本線'], area: '其他' },
  { id: 'tamachi', name_zh: '田町', name_jp: '田町', kana: 'Tamachi', lat: 35.6457, lng: 139.7475, lines: ['JR山手線','JR京濱東北線'], area: '六本木・麻布' },
  { id: 'hamamatsucho', name_zh: '濱松町', name_jp: '浜松町', kana: 'Hamamatsucho', lat: 35.6553, lng: 139.7570, lines: ['JR山手線','JR京濱東北線','東京モノレール（往羽田）'], area: '六本木・麻布' },
  { id: 'shimbashi', name_zh: '新橋', name_jp: '新橋', kana: 'Shimbashi', lat: 35.6660, lng: 139.7585, lines: ['JR山手線','JR京濱東北線','JR東海道線','東京Metro銀座線','都營淺草線','百合海鷗線'], area: '銀座・日本橋' },
  { id: 'yurakucho', name_zh: '有樂町', name_jp: '有楽町', kana: 'Yurakucho', lat: 35.6749, lng: 139.7634, lines: ['JR山手線','JR京濱東北線','東京Metro有樂町線'], area: '銀座・日本橋' },

  // ===== 東京 Metro 重要站 =====
  { id: 'ginza', name_zh: '銀座', name_jp: '銀座', kana: 'Ginza', lat: 35.6720, lng: 139.7649, lines: ['東京Metro銀座線','東京Metro丸之內線','東京Metro日比谷線'], area: '銀座・日本橋' },
  { id: 'omotesando', name_zh: '表參道', name_jp: '表参道', kana: 'Omotesando', lat: 35.6657, lng: 139.7124, lines: ['東京Metro銀座線','東京Metro千代田線','東京Metro半藏門線'], area: '澀谷・原宿・表參道' },
  { id: 'roppongi', name_zh: '六本木', name_jp: '六本木', kana: 'Roppongi', lat: 35.6628, lng: 139.7314, lines: ['東京Metro日比谷線','都營大江戶線'], area: '六本木・麻布' },
  { id: 'azabujuban', name_zh: '麻布十番', name_jp: '麻布十番', kana: 'Azabu-juban', lat: 35.6562, lng: 139.7361, lines: ['東京Metro南北線','都營大江戶線'], area: '六本木・麻布' },
  { id: 'asakusa', name_zh: '淺草', name_jp: '浅草', kana: 'Asakusa', lat: 35.7110, lng: 139.7965, lines: ['東京Metro銀座線','都營淺草線','東武伊勢崎線（晴空塔線）','つくばエクスプレス'], area: '淺草・上野' },
  { id: 'oshiage', name_zh: '押上（晴空塔前）', name_jp: '押上〈スカイツリー前〉', kana: 'Oshiage', lat: 35.7104, lng: 139.8133, lines: ['東京Metro半藏門線','都營淺草線','東武伊勢崎線（晴空塔線）','京成押上線'], area: '淺草・上野' },
  { id: 'kiyosumi', name_zh: '清澄白河', name_jp: '清澄白河', kana: 'Kiyosumi-Shirakawa', lat: 35.6818, lng: 139.7989, lines: ['東京Metro半藏門線','都營大江戶線'], area: '谷根千・藏前' },
  { id: 'tsukishima', name_zh: '月島', name_jp: '月島', kana: 'Tsukishima', lat: 35.6647, lng: 139.7820, lines: ['東京Metro有樂町線','都營大江戶線'], area: '銀座・日本橋' },
  { id: 'toyosu', name_zh: '豐洲', name_jp: '豊洲', kana: 'Toyosu', lat: 35.6553, lng: 139.7976, lines: ['東京Metro有樂町線','百合海鷗線'], area: '台場' },
  { id: 'koraku', name_zh: '後樂園', name_jp: '後楽園', kana: 'Korakuen', lat: 35.7068, lng: 139.7521, lines: ['東京Metro丸之內線','東京Metro南北線'], area: '池袋' },
  { id: 'jimbocho', name_zh: '神保町', name_jp: '神保町', kana: 'Jimbocho', lat: 35.6962, lng: 139.7574, lines: ['東京Metro半藏門線','都營三田線','都營新宿線'], area: '東京・丸之內' },
  { id: 'kudanshita', name_zh: '九段下', name_jp: '九段下', kana: 'Kudanshita', lat: 35.6960, lng: 139.7521, lines: ['東京Metro東西線','東京Metro半藏門線','都營新宿線'], area: '東京・丸之內' },
  { id: 'akasaka-mit', name_zh: '赤坂見附', name_jp: '赤坂見附', kana: 'Akasaka-Mitsuke', lat: 35.6766, lng: 139.7372, lines: ['東京Metro銀座線','東京Metro丸之內線'], area: '六本木・麻布' },
  { id: 'aoyama-1', name_zh: '青山一丁目', name_jp: '青山一丁目', kana: 'Aoyama-itchome', lat: 35.6727, lng: 139.7239, lines: ['東京Metro銀座線','東京Metro半藏門線','都營大江戶線'], area: '澀谷・原宿・表參道' },
  { id: 'meiji-jingumae', name_zh: '明治神宮前〈原宿〉', name_jp: '明治神宮前〈原宿〉', kana: 'Meiji-jingumae', lat: 35.6700, lng: 139.7062, lines: ['東京Metro千代田線','東京Metro副都心線'], area: '澀谷・原宿・表參道' },
  { id: 'kita-senju', name_zh: '北千住', name_jp: '北千住', kana: 'Kita-Senju', lat: 35.7491, lng: 139.8050, lines: ['JR常磐線','東京Metro千代田線','東京Metro日比谷線','東武伊勢崎線','つくばエクスプレス'], area: '其他' },
  { id: 'iidabashi', name_zh: '飯田橋', name_jp: '飯田橋', kana: 'Iidabashi', lat: 35.7019, lng: 139.7450, lines: ['JR總武線','東京Metro東西線','東京Metro有樂町線','東京Metro南北線','都營大江戶線'], area: '其他' },
  { id: 'nezu', name_zh: '根津', name_jp: '根津', kana: 'Nezu', lat: 35.7196, lng: 139.7651, lines: ['東京Metro千代田線'], area: '谷根千・藏前' },
  { id: 'sendagi-st', name_zh: '千駄木', name_jp: '千駄木', kana: 'Sendagi', lat: 35.7270, lng: 139.7626, lines: ['東京Metro千代田線'], area: '谷根千・藏前' },

  // ===== 都營線重要站 =====
  { id: 'daimon', name_zh: '大門', name_jp: '大門', kana: 'Daimon', lat: 35.6571, lng: 139.7553, lines: ['都營淺草線','都營大江戶線'], area: '六本木・麻布' },
  { id: 'shinjuku-3', name_zh: '新宿三丁目', name_jp: '新宿三丁目', kana: 'Shinjuku-sanchome', lat: 35.6914, lng: 139.7041, lines: ['東京Metro丸之內線','東京Metro副都心線','都營新宿線'], area: '新宿' },
  { id: 'ningyocho', name_zh: '人形町', name_jp: '人形町', kana: 'Ningyocho', lat: 35.6856, lng: 139.7838, lines: ['東京Metro日比谷線','都營淺草線'], area: '銀座・日本橋' },
  { id: 'kuramae', name_zh: '藏前', name_jp: '蔵前', kana: 'Kuramae', lat: 35.7062, lng: 139.7913, lines: ['都營淺草線','都營大江戶線'], area: '谷根千・藏前' },
  { id: 'tochomae', name_zh: '都廳前', name_jp: '都庁前', kana: 'Tochomae', lat: 35.6896, lng: 139.6929, lines: ['都營大江戶線'], area: '新宿' },

  // ===== 私鐵 / 其他重要站 =====
  { id: 'futako-tama', name_zh: '二子玉川', name_jp: '二子玉川', kana: 'Futakotamagawa', lat: 35.6122, lng: 139.6266, lines: ['東急田園都市線','東急大井町線'], area: '其他' },
  { id: 'jiyugaoka', name_zh: '自由之丘', name_jp: '自由が丘', kana: 'Jiyugaoka', lat: 35.6080, lng: 139.6688, lines: ['東急東橫線','東急大井町線'], area: '中目黑・自由之丘' },
  { id: 'nakameguro', name_zh: '中目黑', name_jp: '中目黒', kana: 'Nakameguro', lat: 35.6444, lng: 139.6982, lines: ['東急東橫線','東京Metro日比谷線'], area: '中目黑・自由之丘' },
  { id: 'shimokitazawa', name_zh: '下北澤', name_jp: '下北沢', kana: 'Shimokitazawa', lat: 35.6614, lng: 139.6677, lines: ['小田急小田原線','京王井之頭線'], area: '吉祥寺・下北澤' },
  { id: 'kichijoji-st', name_zh: '吉祥寺', name_jp: '吉祥寺', kana: 'Kichijoji', lat: 35.7033, lng: 139.5798, lines: ['JR中央線','JR總武線','京王井之頭線'], area: '吉祥寺・下北澤' },
  { id: 'maihama', name_zh: '舞濱（迪士尼）', name_jp: '舞浜', kana: 'Maihama', lat: 35.6328, lng: 139.8814, lines: ['JR京葉線','JR武藏野線'], area: '其他' },
  { id: 'odaiba-kaihin', name_zh: '台場海濱公園', name_jp: 'お台場海浜公園', kana: 'Odaiba-Kaihinkoen', lat: 35.6303, lng: 139.7732, lines: ['百合海鷗線'], area: '台場' },
  { id: 'odaiba', name_zh: '台場', name_jp: '台場', kana: 'Daiba', lat: 35.6263, lng: 139.7741, lines: ['百合海鷗線'], area: '台場' },
  { id: 'aomi', name_zh: '青海', name_jp: '青海', kana: 'Aomi', lat: 35.6191, lng: 139.7793, lines: ['百合海鷗線'], area: '台場' },
  { id: 'mitaka', name_zh: '三鷹', name_jp: '三鷹', kana: 'Mitaka', lat: 35.7027, lng: 139.5604, lines: ['JR中央線','JR總武線'], area: '吉祥寺・下北澤' },
  { id: 'takao-st', name_zh: '高尾山口', name_jp: '高尾山口', kana: 'Takaosanguchi', lat: 35.6253, lng: 139.2697, lines: ['京王高尾線'], area: '其他' },

  // ===== 機場 =====
  { id: 'narita', name_zh: '成田機場（成田空港）', name_jp: '成田空港', kana: 'Narita Airport', lat: 35.7720, lng: 140.3929, lines: ['JR成田Express','京成Skyliner','京成本線'], area: '其他' },
  { id: 'haneda', name_zh: '羽田機場（羽田空港）', name_jp: '羽田空港', kana: 'Haneda Airport', lat: 35.5494, lng: 139.7798, lines: ['東京Monorail','京急機場線'], area: '其他' },
]

// 工具：依名稱搜尋
export const searchStations = (keyword) => {
  if (!keyword) return STATIONS
  const k = keyword.toLowerCase()
  return STATIONS.filter(s =>
    s.name_zh.toLowerCase().includes(k) ||
    s.name_jp.toLowerCase().includes(k) ||
    s.kana.toLowerCase().includes(k) ||
    s.lines.some(l => l.toLowerCase().includes(k))
  )
}

// 工具：依路線
export const getStationsByLine = (lineName) =>
  STATIONS.filter(s => s.lines.some(l => l.includes(lineName)))

// 工具：依地區
export const getStationsByArea = (area) =>
  STATIONS.filter(s => s.area === area)

// 工具：依 id
export const getStationById = (id) => STATIONS.find(s => s.id === id)

// 主要路線清單
export const MAIN_LINES = [
  'JR山手線','JR中央線','JR京濱東北線','JR總武線','JR埼京線',
  '東京Metro銀座線','東京Metro丸之內線','東京Metro日比谷線','東京Metro千代田線',
  '東京Metro有樂町線','東京Metro半藏門線','東京Metro南北線','東京Metro副都心線','東京Metro東西線',
  '都營淺草線','都營三田線','都營新宿線','都營大江戶線',
  '百合海鷗線','東急東橫線','東急田園都市線','京王井之頭線','小田急小田原線',
]
