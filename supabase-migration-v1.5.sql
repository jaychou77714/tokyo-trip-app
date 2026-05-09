-- ========================================
-- 東京散策 v1.5 Migration
-- 自訂景點公共化 + 住宿分類支援
-- 安全執行：保留 v1.4 資料
-- ========================================

-- 1. custom_places 表加欄位（如果還沒有的話）
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS category int DEFAULT 5;       -- 分類 (1-6)
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS area text DEFAULT '其他';      -- 地區
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS type text DEFAULT '景點';      -- 類型
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS description text;             -- 簡介
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS price text;                   -- 價格
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS hours text;                   -- 營業時間
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS website text;                 -- 網站
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE custom_places ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 2. 既有資料：把 user_id 複製到 created_by（保留誰建立）
UPDATE custom_places
SET created_by = user_id
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- 3. RLS：讓所有人能讀寫（共享池）
ALTER TABLE custom_places ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "public_all_custom_places" ON custom_places FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. 加入 Realtime publication
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE custom_places; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. 索引（搜尋加速）
CREATE INDEX IF NOT EXISTS idx_custom_places_category ON custom_places(category);
CREATE INDEX IF NOT EXISTS idx_custom_places_created_by ON custom_places(created_by);

-- 完成 ✓
