-- ========================================
-- 東京散策 v1.6 Migration
-- 共筆便條紙
-- 安全執行：保留 v1.5 資料
-- ========================================

CREATE TABLE IF NOT EXISTS trip_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trip_notes_trip ON trip_notes(trip_id);

ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "public_all_trip_notes" ON trip_notes FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 便條紙也加入 reactions（重用既有 reactions 表，item_type='note'）
-- reactions 已存在不需再建

-- 加入 Realtime
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE trip_notes; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 完成 ✓
