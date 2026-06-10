-- ============================================================
-- ParkingMate - Supabase 전체 초기화 SQL
-- Supabase 대시보드 > SQL Editor에 그대로 붙여넣고 실행하세요
-- URL: https://supabase.com/dashboard/project/vdinvpuamgfpygyotjts/sql/new
-- ============================================================

-- ============================================================
-- 기존 테이블 초기화 (있으면 삭제 후 재생성)
-- ============================================================
DROP TABLE IF EXISTS votes               CASCADE;
DROP TABLE IF EXISTS reviews             CASCADE;
DROP TABLE IF EXISTS community_comments  CASCADE;
DROP TABLE IF EXISTS community_posts     CASCADE;
DROP TABLE IF EXISTS community_parkings  CASCADE;

-- ============================================================
-- 1. community_parkings: 동네 주차장 등록 테이블
-- ============================================================
CREATE TABLE community_parkings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  address         TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  available_time  TEXT        NOT NULL DEFAULT '',
  hourly_rate     INTEGER     NOT NULL DEFAULT 0,
  monthly_rate    INTEGER     NOT NULL DEFAULT 0,
  capacity        INTEGER     NOT NULL DEFAULT 1,
  contact_method  TEXT        NOT NULL DEFAULT '',
  image_url       TEXT,
  author          TEXT        NOT NULL DEFAULT '익명',
  likes           INTEGER     NOT NULL DEFAULT 0,
  dislikes        INTEGER     NOT NULL DEFAULT 0,
  promoted        BOOLEAN     NOT NULL DEFAULT FALSE,
  lat             FLOAT8      NOT NULL DEFAULT 37.5559,
  lng             FLOAT8      NOT NULL DEFAULT 126.9723,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. community_posts: 커뮤니티 게시글 (후기 게시판)
-- ============================================================
CREATE TABLE community_posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  author      TEXT        NOT NULL DEFAULT '익명',
  views       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. community_comments: 게시글 댓글
-- ============================================================
CREATE TABLE community_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author      TEXT        NOT NULL DEFAULT '익명',
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. reviews: 공유 주차장 별점 후기
-- ============================================================
CREATE TABLE reviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_id  UUID        NOT NULL REFERENCES community_parkings(id) ON DELETE CASCADE,
  author      TEXT        NOT NULL DEFAULT '익명',
  rating      INTEGER     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. votes: 추천/비추천 중복 방지
-- ============================================================
CREATE TABLE votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_id  UUID        NOT NULL REFERENCES community_parkings(id) ON DELETE CASCADE,
  session_key TEXT        NOT NULL,
  vote_type   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parking_id, session_key)
);

-- ============================================================
-- RLS (Row Level Security) 설정
-- ============================================================

-- community_parkings
ALTER TABLE community_parkings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_community_parkings" ON community_parkings FOR SELECT USING (true);
CREATE POLICY "anon_insert_community_parkings" ON community_parkings FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_community_parkings" ON community_parkings FOR UPDATE USING (true);
CREATE POLICY "anon_delete_community_parkings" ON community_parkings FOR DELETE USING (true);

-- community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_community_posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "anon_insert_community_posts" ON community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_community_posts" ON community_posts FOR UPDATE USING (true);
CREATE POLICY "anon_delete_community_posts" ON community_posts FOR DELETE USING (true);

-- community_comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_community_comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "anon_insert_community_comments" ON community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_delete_community_comments" ON community_comments FOR DELETE USING (true);

-- reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT WITH CHECK (true);

-- votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_votes" ON votes FOR SELECT USING (true);
CREATE POLICY "anon_insert_votes" ON votes FOR INSERT WITH CHECK (true);

-- ============================================================
-- 완료 메시지
-- ============================================================
SELECT 'ParkingMate DB 초기화 완료' AS status;
