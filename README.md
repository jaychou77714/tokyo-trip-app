# 東京散策 · Tokyo Trip Companion v1.0

一個給東京自助行旅人使用的網頁 App。  
行程規劃、交通查詢、110 個精選景點美食、預算分帳，全部一站搞定。

---

## ✨ 功能總覽

### 一、行程規劃（地圖優先）
- 多日行程建立（出發/返程日，自動計算天數）
- 每日地圖顯示路線（編號 marker + 虛線連接）
- 從 110 個精選地點一鍵加入或自訂地點
- 設定到達時間、停留分鐘、備註

### 二、交通導航
- ~70 個東京主要車站（JR 山手線、Metro、都營、私鐵、機場）
- 站名/路線/假名搜尋
- 點站點顯示 1.2 km 內的精選景點

### 三、景點美食精選（110 個）
- 5 大分類：必訪經典 30、美食拉麵 25、購物熱點 20、季節限定 15、在地文青 20
- 雙分類切換（地區 / 類型）
- 中文名 + 日文名（給司機看方便）
- 收藏、地圖視覺化
- 個人化標籤（適合親子、預約制、雨天備案⋯）

### 四、預算 & 分帳
- 6 大類別記帳（交通/餐飲/購物/門票/住宿/其他）
- JPY ↔ TWD 即時匯率（每 6 小時更新）
- 退稅商品累計 + ¥5,000 門檻提醒
- **完整分帳系統**：自動計算每人應收/應付，並用「最少轉帳次數」演算法給出清算建議

### 五、其他
- 暱稱進入，無密碼
- Supabase 雲端同步（換裝置也能用）
- 本地模式 fallback（沒設 Supabase 也能跑）

---

## 🚀 部署步驟

### 1. 把專案丟上 GitHub
```bash
cd tokyo-trip
git init
git add .
git commit -m "Initial commit · Tokyo Trip v1.0"
gh repo create tokyo-trip-app --public --source=. --push
# 或用 GitHub Desktop / 網頁手動建 repo
```

### 2. 建立 Supabase 專案
1. 到 https://supabase.com 註冊免費帳號
2. New Project → 隨便取名（例如 `tokyo-trip`）
3. 等 2 分鐘建立完成
4. 進去 → 左側選單 **SQL Editor** → 點 **+ New query**
5. 把專案根目錄的 `supabase-schema.sql` 全部複製貼上 → 點 **Run**
6. 完成後到 **Project Settings → API**，記下：
   - Project URL（`https://xxx.supabase.co`）
   - anon public key（很長一串 ey...）

### 3. 部署到 Vercel
1. 到 https://vercel.com 用 GitHub 登入
2. **Add New → Project** → 選你剛才推上去的 repo
3. **Environment Variables** 填入：
   - `VITE_SUPABASE_URL` = 剛才 Supabase 的 Project URL
   - `VITE_SUPABASE_ANON_KEY` = 剛才的 anon key
4. **Deploy** → 等 1 分鐘
5. 完成！會拿到一個 `https://xxx.vercel.app` 的網址，分享給朋友即可一起用

### 本地開發
```bash
npm install
cp .env.example .env
# 編輯 .env，填入 Supabase 的 URL 與 anon key
npm run dev
# 打開 http://localhost:5173
```

---

## 🛠 技術架構

| 項目 | 用途 |
|---|---|
| **React 18** + **Vite 5** | 前端框架 + 打包 |
| **Tailwind CSS 3** | 樣式 |
| **Supabase** | 雲端資料庫（PostgreSQL）|
| **Leaflet** + **react-leaflet** | 地圖（OpenStreetMap） |
| **lucide-react** | icon |
| **dayjs** | 日期處理 |
| **open.er-api.com** | 免費匯率 API |
| **Vercel** | 部署 |

完全免費棧，無 API 金鑰需求（除了你自己建立的 Supabase）。

---

## 📋 資料準確性聲明（重要）

本 App 內建的 **110 個精選地點** 與 **~70 個車站資料** 為 v1.0 初版整理，請注意：

- **座標是大致位置**，實際導航請用 Google Maps（每張卡片有「在 Google Maps 開啟」連結）
- **營業時間 / 門票價格 / 預約制** 可能變動，**出發前請務必查證該店家官網**
- **退稅門檻、稅率、分帳算法** 為一般情況，特殊情況請以實際店家公告為準
- 部分地點如「江戶東京博物館」目前處於整修狀態，App 內已標註

如發現嚴重錯誤，可直接編輯 `src/data/places.js` 的對應條目。

---

## 📁 檔案結構

```
tokyo-trip/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── supabase-schema.sql       ← Supabase 建表 SQL（重要）
├── .env.example              ← 複製成 .env 並填入金鑰
├── public/
│   └── torii.svg
└── src/
    ├── main.jsx
    ├── App.jsx                ← 主控（狀態管理 + TabBar）
    ├── index.css              ← 全局樣式（紙張紋理、印章效果）
    ├── lib/
    │   ├── supabase.js        ← Supabase 客戶端
    │   ├── storage.js         ← 雲端 + 本地儲存抽象層
    │   └── exchange.js        ← 匯率 API
    ├── data/
    │   ├── categories.js      ← 5 大分類、地區、花費類別
    │   ├── places.js          ← 110 個精選地點
    │   └── stations.js        ← ~70 個車站
    └── components/
        ├── Common.jsx         ← Modal/Button/Input/Toast 等共用
        ├── MapView.jsx        ← Leaflet 地圖元件
        └── screens/
            ├── LoginScreen.jsx
            ├── HomeScreen.jsx
            ├── TripDetailScreen.jsx
            ├── PlacesScreen.jsx
            ├── StationsScreen.jsx
            ├── BudgetScreen.jsx
            ├── ProfileScreen.jsx
            └── PlaceDetailModal.jsx
```

---

## 🎨 設計理念

採用 **日式編輯雜誌風（editorial / magazine）** 美學：

- **配色**：墨黑 (#1a1a1a) + 生成色 (#f5efe6) + 朱紅 (#c9302c) + 古金 (#b8945f)
- **字體**：Noto Serif JP（標題）+ Noto Sans JP（內文）+ JetBrains Mono（數字）
- **細節**：印章效果、紙張紋理、中日雙語標題（編輯感）

靈感來自 BRUTUS、POPEYE 等日本旅遊雜誌的版面感。

---

## 🐛 已知限制（v1 範圍）

- 無拖曳排序（行程項目順序需手動編輯）
- 無多人即時共編（兩人同時改同一筆會以後存的為準）
- 無離線地圖（需網路才能載入 OSM tile）
- 自訂景點僅支援「名稱+地址」，不支援自選座標（v1.1 預計加入）

---

## 📜 授權

MIT。地圖資料 © OpenStreetMap contributors。  
精選地點資料整理參考自網路公開資訊，如需引用商業用途請自行查證。

—— 旅の安全を祈ります 🗼
