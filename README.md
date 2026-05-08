# 東京散策 · Tokyo Trip Companion v1.2

> ✨ **v1.2 更新**：新增「道具」工具箱頁，包含**行前 Checklist** + **JR Pass 計算機**

---

## ✨ v1.2 新增功能

### 🛠 工具箱（新 Tab：道具）
TabBar 從 5 格擴充為 6 格，新增「道具」分頁。

### 1️⃣ 行前 Checklist
- **35 項預設範本**，分 8 大類（證件/金錢/交通/3C/衣物/藥品/行李/出發前確認）
- **出發倒數**：自動算「距出發 X 天」
- **完成度進度條**：visual 跑動的綠色條
- 分類篩選（每類有自己的計數）
- 自訂新增 / 刪除 / 勾選
- 一鍵載入預設範本 / 清空
- 與 Supabase 雲端同步（換裝置不掉資料）

### 2️⃣ JR Pass 計算機
- **7 種票券**內建：
  - Tokyo Subway 24/48/72h、東京一日券
  - JR Tokyo Wide Pass、Greater Tokyo Pass、JR Pass 全國版 7 天
- **連動行程**自動估算：行程內地點數 × 平均單程票價
- **5 種票價情境**選擇（市內 ¥220 / JR ¥180 / 跨區 ¥800 / 新幹線 ¥1500...）
- **手動模式**：直接輸入估計總票價
- **划算度判斷**：每張 Pass 顯示「比單買省 ¥X」或「貴 ¥X」，划算的會貼綠色「划算」紙膠帶
- 點 Pass 看詳細資訊（涵蓋範圍 / 購買地點 / 注意事項）

---

## 🔄 從 v1.1 升級（重要：要跑 SQL）

### Step 1：跑 Supabase Migration

⚠️ v1.2 新增了一張 `checklist_items` 表，需要跑 SQL：

1. 打開 Supabase Dashboard → 你的 `tokyo-trip` 專案
2. 左側 **SQL Editor** → **+ New query**
3. 把專案根目錄的 **`supabase-migration-v1.2.sql`** 整個複製貼上
4. 按 **Run** → 應該看到 **Success. No rows returned** ✅

> 💡 這個 migration 只會新增一張表，**不會動到你現有的資料**（行程、收藏、花費全部保留）

### Step 2：上傳新檔案到 GitHub

下載這個 v1.2 zip → 解壓 → GitHub 上傳所有檔案（覆蓋）。

新增 / 變動的檔案：
- 🆕 `src/data/checklist-template.js`
- 🆕 `src/data/jrpass.js`
- 🆕 `src/components/screens/ToolsScreen.jsx`
- 🆕 `src/components/screens/ChecklistScreen.jsx`
- 🆕 `src/components/screens/JrPassScreen.jsx`
- 🆕 `supabase-migration-v1.2.sql`
- ✏️ `src/App.jsx`（加路由 + TabBar 改 6 格）
- ✏️ `src/lib/storage.js`（加 checklist 雲端同步）

✅ **不變的檔案**：places.js / stations.js / categories.js / 其他 7 個 screen

### Step 3：等 Vercel 自動部署
1-2 分鐘後新版上線。

---

## 📐 v1.2 完整檔案結構

```
tokyo-trip/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── supabase-schema.sql              ← 完整建表（v1.0 用）
├── supabase-migration-v1.2.sql      🆕 v1.2 增量
├── README.md
├── public/
│   ├── torii.svg
│   ├── favicon-16x16.png            ← (你之前加的 icon)
│   ├── apple-touch-icon.png
│   └── ...
└── src/
    ├── main.jsx
    ├── App.jsx                       ✏️ 6 個 Tab + 工具路由
    ├── index.css
    ├── lib/
    │   ├── supabase.js
    │   ├── storage.js                ✏️ 加 checklist 同步
    │   └── exchange.js
    ├── data/
    │   ├── categories.js
    │   ├── places.js
    │   ├── stations.js
    │   ├── checklist-template.js     🆕 35 項預設清單
    │   └── jrpass.js                 🆕 7 種 Pass + 票價估算
    └── components/
        ├── Common.jsx
        ├── MapView.jsx
        └── screens/
            ├── LoginScreen.jsx
            ├── HomeScreen.jsx
            ├── TripDetailScreen.jsx
            ├── PlacesScreen.jsx
            ├── StationsScreen.jsx
            ├── BudgetScreen.jsx
            ├── ProfileScreen.jsx
            ├── PlaceDetailModal.jsx
            ├── ToolsScreen.jsx       🆕 工具總覽
            ├── ChecklistScreen.jsx   🆕 行前清單
            └── JrPassScreen.jsx      🆕 Pass 計算機
```

---

## ⚠️ 使用提醒

### Checklist
- 第一次進去會看到「清單還是空的」 → 點「載入預設範本」一次載入 35 項
- 每個行程有獨立的清單（不同行程不互通）
- 預設項目可刪除，自訂項目會顯示「+自訂」標記

### JR Pass 計算機
- 估算為**粗略參考**（誤差約 ±15%）
- 實際票價依路線距離計算（每兩站價格不同）
- Pass 價格為 2026 年參考價，**出發前請確認官網**
- 「划算」標示僅供參考，實際使用率還要看當天時間、目的地分布

---

## 📋 完整功能（v1.0 + v1.1 + v1.2）

| 模組 | 狀態 |
|---|---|
| 行程規劃（地圖優先） | v1.0 ✓ |
| 110 個精選景點 | v1.0 ✓ |
| 70+ 站點查詢 | v1.0 ✓ |
| 預算 + 分帳結算 | v1.0 ✓ |
| 退稅追蹤 | v1.0 ✓ |
| 暱稱識別 + 雲端同步 | v1.0 ✓ |
| 日系手帳風 UI | v1.1 ✓ |
| **行前 Checklist** | v1.2 🆕 |
| **JR Pass 計算機** | v1.2 🆕 |

---

## 🐛 已知限制

- 無拖曳排序行程 / Checklist
- 無多人即時共編
- 無離線地圖
- JR Pass 票價估算僅供參考

—— 旅の安全を祈ります 🗼
