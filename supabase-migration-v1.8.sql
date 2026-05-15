-- ========================================
-- 東京散策 v1.8 Migration
-- 1) 移動時間欄位（原 v1.7）
-- 2) 管理員模式 is_admin
-- 安全執行：保留 v1.6 資料
-- 若已跑過 v1.7 也安全（ADD COLUMN IF NOT EXISTS 不會重複）
-- ========================================

-- ===== Part 1: 移動時間（原 v1.7）=====
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS transit_min int DEFAULT 0;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS transit_mode text DEFAULT 'walk';
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS time_locked boolean DEFAULT false;

-- ===== Part 2: 管理員旗標 =====
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 把暱稱「管理員」設成 admin
UPDATE users SET is_admin = true WHERE nickname = '管理員';

-- 確認
SELECT nickname, is_admin FROM users WHERE is_admin = true;

-- 完成 ✓
