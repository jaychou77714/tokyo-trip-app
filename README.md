# 東京散策 · Tokyo Trip Companion v1.1

> ✨ **v1.1 更新**：UI 風格改為「日系手帳貼紙」風（Notebook Sticker Style）

一個給東京自助行旅人使用的網頁 App。
行程規劃、交通查詢、110 個精選景點美食、預算分帳，全部一站搞定。

---

## ✨ v1.1 設計改造

採用 **日系手帳・スタンプ** 風格：

- **色彩**：紙張米白 #FAF6EC、深咖啡 #3D2817、紙膠帶橘 #FF8B5A、印章紅 #E84E4E、淡藍 #A8C5D9
- **字體**：Klee One（手寫感）+ Noto Serif JP + JetBrains Mono
- **元素**：
  - 紙膠帶 washi tape 標題
  - 圓形紅印章（承認済）
  - 雙層紙片按鈕（錯位投影）
  - 虛線邊框（dashed border）
  - 紙張橫線格紋背景
  - 便利貼風格的卡片（角落貼紙膠帶）
  - 手寫感 ✎ 圖示
  - 紙片陰影（offset shadow）

跟 v1.0 比起來，更有「翻開旅遊手帳」的感覺。

---

## 🔄 從 v1.0 升級

如果你已經部署過 v1.0：

1. **下載這個 v1.1 zip 解壓**
2. **GitHub 網頁** → 進到你的 `tokyo-trip-app` repo
3. **覆蓋上傳檔案**：
   - 點 `Add file` → `Upload files`
   - 把解壓後資料夾**裡面所有檔案**拖進去
   - GitHub 會自動偵測有變動的檔案並覆蓋
   - 沒變動的檔案（places.js / stations.js / lib/* / supabase-schema.sql 等）會保持原樣
4. **commit 訊息**：填 `v1.1 · 改為日系手帳風 UI`
5. **Vercel 自動偵測 push** → 自動重新部署，1-2 分鐘後新版上線

✅ **資料完全不會掉**：Supabase 裡的行程、收藏、花費紀錄都會保留，因為資料庫架構沒動。

---

## 📦 v1.1 變動的檔案清單

只有 UI / 樣式相關的檔案改了：

| 檔案 | 變動內容 |
|---|---|
| `tailwind.config.js` | 新色票（手帳系顏色 + Klee One 手寫字體）|
| `index.html` | 加 Google Fonts: Klee One |
| `src/index.css` | 全新樣式：紙張紋理、紙膠帶、印章、雙層按鈕等 |
| `src/components/Common.jsx` | Button、Modal、Input 等元件升級 |
| `src/App.jsx` | TabBar 換成米白底 + 紙膠帶 active 標示 |
| `src/components/screens/*.jsx` | 7 個畫面全部套用新風格 |

✅ **不變的檔案**：
- `src/data/places.js` - 110 個景點資料
- `src/data/stations.js` - 站點資料
- `src/data/categories.js` - 分類定義
- `src/lib/*` - Supabase / storage / 匯率邏輯
- `supabase-schema.sql` - 資料庫結構
- `package.json` - 依賴項（沒變）

---

## 📋 完整功能（同 v1.0）

### 一、行程規劃（地圖優先）
- 多日行程建立、地圖編號路線
- 從 110 個精選地點加入 / 自訂地點

### 二、交通導航
- ~70 個東京主要車站
- 站名/路線搜尋、站點附近景點

### 三、景點美食精選（110 個）
- 5 大分類、雙分類切換、收藏

### 四、預算 & 分帳
- 6 大類別記帳、JPY ↔ TWD 匯率
- 退稅累計、最少轉帳分帳演算法

---

## 🚀 全新部署（如果你還沒部署 v1.0）

1. **GitHub**：建 repo、上傳整個資料夾
2. **Supabase**：新專案 → 跑 `supabase-schema.sql`
3. **Vercel**：連 repo → 加環境變數：
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   ```

詳細步驟參考之前的部署 SOP。

---

## 📋 資料準確性聲明（同 v1.0）

110 個精選地點為 v1 整理，營業時間 / 門票 / 座標可能變動，**出發前請查證官網**。

---

## 🐛 已知限制

- 無拖曳排序行程
- 無多人即時共編
- 無離線地圖

—— 旅の安全を祈ります 🗼
