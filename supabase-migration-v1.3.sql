-- ========================================
-- 東京散策 v1.3 Migration
-- 共編行程、成員管理、by XX 標記
-- 安全執行：完全保留 v1.2 資料
-- ========================================

-- 1. trip_members 表（行程成員關係）
CREATE TABLE IF NOT EXISTS trip_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'editor',         -- 'owner' | 'editor'
  color text DEFAULT '#FF8B5A',       -- 成員顏色
  joined_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user ON trip_members(user_id);

-- 2. trips 表加分享碼（已存在的話不影響）
ALTER TABLE trips ADD COLUMN IF NOT EXISTS share_code text UNIQUE;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES users(id);

-- 3. 既有資料 migration：把現有 trips 都標 owner_id 並加進 trip_members
DO $$
DECLARE
  trip_record record;
  rand_code text;
  attempt int;
BEGIN
  FOR trip_record IN SELECT id, user_id FROM trips WHERE share_code IS NULL OR owner_id IS NULL
  LOOP
    -- 設置 owner
    UPDATE trips SET owner_id = trip_record.user_id WHERE id = trip_record.id AND owner_id IS NULL;

    -- 產生分享碼（重試最多 5 次避免衝突）
    attempt := 0;
    LOOP
      rand_code := upper(substring(md5(random()::text || trip_record.id::text || attempt::text) from 1 for 8));
      BEGIN
        UPDATE trips SET share_code = rand_code WHERE id = trip_record.id AND share_code IS NULL;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        attempt := attempt + 1;
        IF attempt > 5 THEN EXIT; END IF;
      END;
    END LOOP;

    -- 把擁有者加進 trip_members
    INSERT INTO trip_members (trip_id, user_id, role, color)
    VALUES (trip_record.id, trip_record.user_id, 'owner', '#FF8B5A')
    ON CONFLICT (trip_id, user_id) DO NOTHING;
  END LOOP;
END $$;

-- 4. 各表加 added_by / updated_by / updated_at 欄位
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS added_by uuid REFERENCES users(id);
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id);
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS added_by uuid REFERENCES users(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE tax_free_items ADD COLUMN IF NOT EXISTS added_by uuid REFERENCES users(id);
ALTER TABLE tax_free_items ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id);
ALTER TABLE tax_free_items ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS added_by uuid REFERENCES users(id);
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id);
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 5. RLS for trip_members
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "public_all_trip_members" ON trip_members FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 完成 ✓
