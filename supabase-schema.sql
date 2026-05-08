-- ========================================
-- 東京散策 Tokyo Trip App v1.0
-- Supabase Schema
-- ========================================
-- 在 Supabase Dashboard → SQL Editor 執行此檔
-- 建議建立完成後再啟用 RLS（本檔已預設啟用 + Public Policy 可讀寫）
-- 因為設計為「知道網址才能進入」的小群組共用 App

-- 1. 使用者（暱稱）
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- 2. 行程
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  start_date date,
  end_date date,
  days int DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);

-- 3. 行程項目
CREATE TABLE IF NOT EXISTS itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  day_number int NOT NULL DEFAULT 1,
  order_index int DEFAULT 0,
  place_id text,                  -- 對應 src/data/places.js 的 id
  custom_name text,               -- 自訂景點名稱
  custom_address text,
  custom_lat numeric,
  custom_lng numeric,
  start_time text,                -- "09:30"
  duration_min int,               -- 停留分鐘數
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_itinerary_trip ON itinerary_items(trip_id);

-- 4. 收藏
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  place_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, place_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- 5. 自訂景點
CREATE TABLE IF NOT EXISTS custom_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  lat numeric,
  lng numeric,
  category int,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 6. 花費紀錄
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  date date,
  category text,                  -- transport / food / shopping / ticket / hotel / other
  amount_jpy numeric NOT NULL DEFAULT 0,
  description text,
  paid_by text,                   -- 付款人暱稱
  split_among text[],             -- 分擔成員暱稱陣列（用於分帳）
  split_ratio jsonb,              -- 預留：自訂比例（v1 暫用平均分）
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 7. 退稅紀錄
CREATE TABLE IF NOT EXISTS tax_free_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  date date,
  store_name text,
  amount_jpy numeric DEFAULT 0,
  notes text,                     -- 消耗品 / 一般物品
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_taxfree_trip ON tax_free_items(trip_id);

-- ========================================
-- Row Level Security (RLS)
-- ========================================
-- 因為本 App 採「無密碼+網址私密」設計，且 anon key 公開於前端，
-- 此處政策設為「任何人都能讀寫」。
-- 如果你的場景需更嚴格安全，可改為基於 user_id 的政策。

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_free_items ENABLE ROW LEVEL SECURITY;

-- 開放讀寫政策（簡單版）
DO $$ BEGIN
  CREATE POLICY "public_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_all_trips" ON trips FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_all_itinerary" ON itinerary_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_all_favorites" ON favorites FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_all_custom" ON custom_places FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_all_expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_all_taxfree" ON tax_free_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 完成 ✓
-- 接下來：到 Project Settings → API 拿到 URL 與 anon key，
-- 填入專案根目錄的 .env 檔即可。
