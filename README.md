# 東京散策 · Tokyo Trip Companion v1.3

> ✨ **v1.3 重大更新**：共編行程 + 成員管理 + 修改暱稱

---

## 🆕 v1.3 新功能

### 1️⃣ 共編行程
- 行程詳情頁頂部有**邀請成員**按鈕
- 點擊產生**分享連結** `https://你的網址/?join=XXXXXXXX`
- 朋友點連結 → 輸入暱稱 → 自動加入
- **全員都能編輯**（自由度最大化）

### 2️⃣ 成員管理
- 行程詳情頁頂部顯示成員列表（**彩色圓點 + 名字**）
- 8 種顏色自動分配（橘藍綠黃紫紅青粉）
- 邀請彈窗顯示「目前成員」+ 建立者標記

### 3️⃣ 「by XX · 5 分鐘前」標示
出現在 3 個地方：
- 行程內景點（誰加的 / 改的）
- 花費紀錄（誰記的）
- Checklist 項目（誰勾的）

每個 by 前面有一個小圓點（用該成員的顏色），一眼看出誰在做什麼。

### 4️⃣ 修改暱稱
- 「我的」頁面新增 ✏️ **改暱稱** 按鈕
- 唯一檢查（不能跟別人重複）
- 改名後**自動追溯**所有「by XX」紀錄

### 5️⃣ 首頁分區
- 「★ 我建立的」+ 「★ 共編中」兩區
- 每張卡片顯示成員人數（如「2 人」「4 人」）
- 共編行程**只能編輯不能刪除**（避免誤刪別人的）

---

## ⚠️ 部署順序（重要！）

### Step 1：先到 Supabase 跑 SQL Migration

⚠️ **這步必須先做**，不然新功能會報錯：

1. 打開 Supabase Dashboard → 你的 `tokyo-trip` 專案
2. 左側 **SQL Editor** → **+ New query**
3. 把 `supabase-migration-v1.3.sql` 整檔貼上
4. 按 **Run** → 看到 **Success. No rows returned** ✅

> ✅ 這個 migration 會：
> - 新增 `trip_members` 表（成員關係）
> - 加分享碼 / owner_id 欄位到 trips
> - 加 added_by / updated_by / updated_at 到 4 張表
> - **自動把你現有的行程都標為「擁有者 = 你」**（資料不會掉）

### Step 2：上傳新檔案到 GitHub

下載 v1.3 zip → 解壓 → **進到 tokyo-trip 資料夾裡面** → 全選所有項目 → 拖進 GitHub。

⚠️ **建議先砍 src 資料夾再傳**（避免舊檔殘留）：
1. 進 `src/` → 右上角 ⋯ → **Delete this directory**
2. 回首頁 → Add file → Upload files
3. 把解壓後的 `src/` 整個拖進去
4. 同時其他根目錄檔案也拖進去（會自動覆蓋）

### Step 3：等 Vercel 自動部署 1-2 分鐘

### Step 4：手機強制重整

---

## 🆕 / ✏️ v1.3 變動的檔案

```
🆕 新增：
├── src/data/members.js                    （成員顏色 + 分享碼產生器 + 相對時間）
└── supabase-migration-v1.3.sql            （增量 SQL）

✏️ 修改：
├── src/App.jsx                            （URL ?join 處理 + JoinModal）
├── src/lib/storage.js                     （成員 API + 改暱稱 + by 標記）
├── src/components/screens/HomeScreen.jsx  （我建立 / 共編中 分區）
├── src/components/screens/TripDetailScreen.jsx  （成員列表 + 邀請 Modal）
├── src/components/screens/BudgetScreen.jsx      （by XX 標示）
├── src/components/screens/ChecklistScreen.jsx   （by XX 標示）
└── src/components/screens/ProfileScreen.jsx     （改暱稱 Modal）
```

✅ **不變**：places.js / stations.js / categories.js / 其他 4 個 screen

---

## 💡 使用情境範例

### 情境 1：你和太太一起規劃
1. 你建立「2026 春櫻 5 日」行程
2. 行程詳情頁點 **邀請** → 複製連結
3. LINE 給太太
4. 太太點連結 → 輸入「太太」 → 加入
5. 兩人都能改行程 / 加景點 / 記花費
6. 每筆紀錄都看得到「by 哈利」「by 太太」+ 顏色

### 情境 2：四人團體
- 大家都加入後，分帳功能可選擇「全部加入分帳」一鍵填入
- 花費按下「分擔成員」可以快速勾選

### 情境 3：暱稱衝突
- 太太想用「太太」，但你也用過 → 系統會擋
- 太太可以改成「太太🌸」之類

---

## 🐛 已知限制

- **無即時通知**：對方改了，要重新整理才看得到
- **無衝突保護**：兩人同時改同一筆 → 後存的覆蓋前面的
- **無退出 / 踢人**：只能整個刪除行程
- **本地模式不支援共編**：必須有 Supabase

---

## 🔒 安全性提醒

- 邀請連結傳到 LINE / 訊息 → **任何拿到連結的人都能加入**
- 知道分享碼也能加入（碼是 8 位英數，難猜但不是密碼）
- 不要在行程備註裡放敏感資訊（信用卡號、護照號等）

---

## 📊 完整功能列表

| 模組 | 狀態 |
|---|---|
| 行程規劃（地圖優先） | v1.0 ✓ |
| 110 個精選景點 | v1.0 ✓ |
| 70+ 站點查詢 | v1.0 ✓ |
| 預算 + 分帳結算 | v1.0 ✓ |
| 退稅追蹤 | v1.0 ✓ |
| 暱稱識別 + 雲端同步 | v1.0 ✓ |
| 日系手帳風 UI | v1.1 ✓ |
| 行前 Checklist + 倒數 | v1.2 ✓ |
| JR Pass 計算機 | v1.2 ✓ |
| 字體放大 | v1.2.1 ✓ |
| **共編行程 + 邀請連結** | v1.3 🆕 |
| **成員管理 + 顏色標記** | v1.3 🆕 |
| **by XX 標示** | v1.3 🆕 |
| **修改暱稱** | v1.3 🆕 |

—— 旅の安全を祈ります 🗼
