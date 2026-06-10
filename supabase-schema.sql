-- ============================================================
-- ParkingMate - Supabase DB 스키마 정의
-- Supabase 대시보드의 SQL Editor에서 실행하세요
-- URL: https://supabase.com/dashboard/project/vdinvpuamgfpygyotjts/sql
-- ============================================================

-- 1. 공유 주차장 테이블
CREATE TABLE IF NOT EXISTS community_parkings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  address      TEXT NOT NULL,
  description  TEXT DEFAULT '',
  available_time TEXT DEFAULT '',
  hourly_rate  INTEGER DEFAULT 0,
  monthly_rate INTEGER DEFAULT 0,
  capacity     INTEGER DEFAULT 1,
  contact_method TEXT DEFAULT '',
  image_url    TEXT,
  author       TEXT DEFAULT '익명',
  likes        INTEGER DEFAULT 0,
  dislikes     INTEGER DEFAULT 0,
  promoted     BOOLEAN DEFAULT FALSE,
  lat          DOUBLE PRECISION DEFAULT 37.5559,
  lng          DOUBLE PRECISION DEFAULT 126.9723,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 커뮤니티 게시글 테이블
--    category: 'parking' = 주차장 등록 시 자동 생성
--              'review'  = 사용자가 직접 작성하는 후기 게시판
CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL DEFAULT 'review',   -- 'parking' | 'review'
  parking_id  UUID REFERENCES community_parkings(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  author      TEXT DEFAULT '익명',
  views       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author     TEXT DEFAULT '익명',
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 별점 후기 테이블 (공유 주차장 전용)
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_id UUID NOT NULL REFERENCES community_parkings(id) ON DELETE CASCADE,
  author     TEXT DEFAULT '익명',
  rating     INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 추천/비추천 중복 방지 테이블
CREATE TABLE IF NOT EXISTS votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_id  UUID NOT NULL REFERENCES community_parkings(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  vote_type   TEXT NOT NULL,   -- 'like' | 'dislike'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parking_id, session_key)
);

-- ============================================================
-- Row Level Security (RLS) 설정 - 공개 읽기, 공개 쓰기 허용
-- ============================================================

-- community_parkings
ALTER TABLE community_parkings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community_parkings"  ON community_parkings FOR SELECT USING (true);
CREATE POLICY "Public insert community_parkings" ON community_parkings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update community_parkings" ON community_parkings FOR UPDATE USING (true);
CREATE POLICY "Public delete community_parkings" ON community_parkings FOR DELETE USING (true);

-- community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community_posts"   ON community_posts FOR SELECT USING (true);
CREATE POLICY "Public insert community_posts" ON community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update community_posts" ON community_posts FOR UPDATE USING (true);
CREATE POLICY "Public delete community_posts" ON community_posts FOR DELETE USING (true);

-- comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments"   ON comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete comments" ON comments FOR DELETE USING (true);

-- reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews"   ON reviews FOR SELECT USING (true);
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read votes"   ON votes FOR SELECT USING (true);
CREATE POLICY "Public insert votes" ON votes FOR INSERT WITH CHECK (true);
