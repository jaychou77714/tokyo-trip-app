-- ========================================
-- 東京散策 v1.4 Migration
-- 表態 + 留言 + Realtime 訂閱
-- 安全執行：完全保留 v1.3 資料
-- ========================================

-- 1. reactions 表（表態 👍 💡）
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,            -- 'itinerary' | 'expense' | 'checklist'
  item_id uuid NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  emoji text NOT NULL,                 -- '👍' | '💡'
  created_at timestamptz DEFAULT now(),
  UNIQUE(item_type, item_id, user_id, emoji)
);
CREATE INDEX IF NOT EXISTS idx_reactions_item ON reactions(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_reactions_trip ON reactions(trip_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "public_all_reactions" ON reactions FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. comments 表（景點留言）
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL DEFAULT 'itinerary',  -- 目前只有景點
  item_id uuid NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_comments_trip ON comments(trip_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "public_all_comments" ON comments FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. 開啟 Realtime（讓所有 trip 相關的表能即時推送）
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE itinerary_items; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE expenses; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE tax_free_items; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE trip_members; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE trips; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE reactions; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE comments; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 完成 ✓
