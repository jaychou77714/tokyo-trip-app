-- ========================================
-- 東京散策 v1.7 Migration
-- 景點間移動時間
-- 安全執行：保留 v1.6 資料
-- ========================================

-- itinerary_items 加移動時間欄位
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS transit_min int DEFAULT 0;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS transit_mode text DEFAULT 'walk';
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS time_locked boolean DEFAULT false;

-- 完成 ✓
