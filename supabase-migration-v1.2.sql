-- ========================================
-- 東京散策 v1.2 Migration
-- 只新增 checklist_items 表，不影響現有資料
-- ========================================

-- 行前 Checklist 項目
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  category text,                  -- docs/money/transport/tech/clothes/health/luggage/predeparture
  item_name text NOT NULL,
  item_desc text,
  is_done boolean DEFAULT false,
  is_custom boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_checklist_trip ON checklist_items(trip_id);

-- RLS 開啟 + 政策
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public_all_checklist" ON checklist_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 完成 ✓
