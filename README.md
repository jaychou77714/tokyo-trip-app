# 東京散策 · Tokyo Trip Companion v1.4

> ✨ **v1.4 重大更新**：即時同步 + 表態 + 留言 + 自動天數 + 版本通知

---

## 🆕 v1.4 五個新功能

### 1️⃣ 自動算天數
建立 / 編輯行程時：
- 只填**出發日 + 返程日**
- 下方自動顯示天數（綠框）
- 日期錯誤會警告（紅框 ⚠）
- 不需要手填天數

### 2️⃣ 即時同步（WebSocket / Realtime）
- 行程內**所有改動**會即時推送（景點、花費、Checklist、留言、表態）
- 別人改了東西時，左下角顯示 **「✦ N 個更新 · 點此載入」**
- **不會打斷你正在打字** — 你按了才會合併（非阻斷模式）
- 自己改的不會通知自己（避免噪音）

### 3️⃣ 表態功能 👍 💡
- 每個景點底部有 👍（好棒）+ 💡（建議）兩個按鈕
- 點數字看誰按了
- 自己按過再按一次 = 取消
- 顏色圓點顯示哪個成員按的

### 4️⃣ 景點留言串
- 每個景點底部有 💬 按鈕
- 點開像 chat 介面（你的訊息靠右、別人的靠左）
- 純文字留言、Enter 送出
- 自己的留言可以刪除
- 顯示成員顏色頭像 + 相對時間

### 5️⃣ 版本通知（像木島 App）
- 首頁顯示當前版本徽章 `v1.4`
- 後台每 **5 分鐘** 檢查 `version.json`
- 偵測到新版 → 頂部跳通知 **「✿ 新版本可用 v1.4.1 · 點此更新」**
- 點 **更新** 按鈕 → 自動 reload

---

## ⚠️ 部署順序（重要！）

### Step 1：先到 Supabase 跑 SQL Migration

⚠️ **這步必須先做**，不然 realtime / 表態 / 留言會報錯：

1. 打開 Supabase Dashboard → 你的 `tokyo-trip` 專案
2. 左側 **SQL Editor** → **+ New query**
3. 把 `supabase-migration-v1.4.sql` 整檔貼上
4. 按 **Run** → 看到 **Success. No rows returned** ✅

> ✅ 這個 migration 會：
> - 新增 `reactions` 表（表態 👍 💡）
> - 新增 `comments` 表（景點留言）
> - 將 7 張表加入 Realtime publication（即時推送）
> - 不影響任何 v1.3 既有資料

### Step 2：上傳新檔案到 GitHub

下載 v1.4 zip → 解壓 → **進到 tokyo-trip 資料夾裡面** → 全選所有項目 → 拖進 GitHub。

⚠️ **強烈建議先砍 src 資料夾再傳**（避免舊檔殘留）：
1. 進 `src/` → 右上角 **⋯** → **Delete this directory**
2. 回首頁 → **Add file → Upload files**
3. 把解壓後的 `src/` 整個拖進去
4. 同時根目錄和 `public/` 的檔案也拖進去（會自動覆蓋）

> 💡 別忘了 `public/version.json` — 這是版本檢查用的，沒上傳新版通知會壞掉

### Step 3：等 Vercel 自動部署 1-2 分鐘

### Step 4：強制重整瀏覽器（手機 + 電腦）

---

## 🆕 / ✏️ v1.4 變動的檔案

```
🆕 新增：
├── public/version.json                    （版本資訊，每次 build 要更新）
├── src/data/reactions.js                  （表態 emoji 定義）
├── src/lib/realtime.js                    （Supabase Realtime hooks）
├── src/components/ReactionBar.jsx         （表態 UI 元件）
├── src/components/CommentThread.jsx       （留言 UI 元件）
├── src/components/UpdateNotice.jsx        （新版通知 + 即時更新提示）
└── supabase-migration-v1.4.sql            （增量 SQL）

✏️ 修改：
├── src/App.jsx                            （版本檢查 + UpdateNotice）
├── src/lib/storage.js                     （表態 / 留言 / 版本 API）
├── src/components/screens/HomeScreen.jsx  （日期自動算天數）
├── src/components/screens/TripDetailScreen.jsx  （Realtime + 表態 + 留言）
├── src/components/screens/BudgetScreen.jsx      （Realtime）
├── src/components/screens/ChecklistScreen.jsx   （Realtime）
├── src/components/screens/ProfileScreen.jsx     （顯示完整版本）
└── package.json                           （version 1.4.0）

✅ 不變：places.js / stations.js / categories.js / Login / Places / Stations / Tools / JrPass
```

---

## 💡 即時同步使用情境

### 情境 A：兩個人同時規劃（電腦 + 手機）
1. 你在電腦加景點「淺草雷門」
2. 太太在手機上 1-2 秒內看到左下角跳出 **「✦ 1 個更新 · 點此載入」**
3. 太太點按鈕 → 即刻看到新景點 + 「by 哈利」標記

### 情境 B：表態討論
1. 你加了「築地市場」
2. 太太按 👍（推薦）
3. 1 秒內你看到通知，重新載入後看到 「👍 1」
4. 點數字 → 看到「太太 · 剛剛」

### 情境 C：留言討論
1. 你加了「東京鐵塔」
2. 太太點 💬 留言：「想晚上去看夜景！」
3. 你看到通知 → 重新載入 → 看到太太的留言（粉色頭像）
4. 你回：「OK！第二天晚上排這個」

---

## 🐛 已知限制

- **同時改同一筆**：v1.4 仍是「最後存的覆蓋」（沒做衝突 UI）
- **背景關閉時不會收到通知**：必須開著 App 才能收 realtime
- **版本檢查需要連網**：飛航模式偵測不到新版
- **無線上成員顯示**：不會顯示誰目前正在線上
- **無已讀標記**：留言不顯示「對方已讀」

---

## 🔒 安全性提醒

- **Realtime 不需要登入認證**（用 RLS public 模式）—> 知道 trip_id 的人能訂閱該行程
- 邀請連結傳到 LINE 等公開地方時 = 任何人能加入
- 留言內容不要放敏感資訊

---

## 📊 v1.4 完整功能列表

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
| 共編行程 + 邀請連結 | v1.3 ✓ |
| 成員管理 + 顏色標記 | v1.3 ✓ |
| by XX 標示 | v1.3 ✓ |
| 修改暱稱 | v1.3 ✓ |
| **自動算天數** | v1.4 🆕 |
| **即時同步（Realtime）** | v1.4 🆕 |
| **表態 👍 💡** | v1.4 🆕 |
| **景點留言串** | v1.4 🆕 |
| **版本通知 + 顯示** | v1.4 🆕 |

---

## 🔮 未來可能的 v1.5 規劃

- 線上成員顯示（綠點）
- 留言已讀標記
- 衝突偵測（兩人同時編輯時警告）
- 歷史紀錄（誰在何時改了什麼）
- 退出 / 踢除成員
- 識別碼登入（避免暱稱被冒用）

—— 旅の安全を祈ります 🗼
