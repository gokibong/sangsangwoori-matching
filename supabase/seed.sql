-- =============================================================
-- 상상우리 매칭 시스템 시드 데이터
-- 실행 방법: Supabase SQL 에디터 또는 MCP execute_sql 에 전체 붙여넣기
-- 주의: 기존 matches / seniors / jobs 데이터를 모두 초기화한 뒤 재삽입합니다.
-- =============================================================

-- 1. 기존 데이터 초기화 (FK 순서 준수)
TRUNCATE TABLE matches  RESTART IDENTITY CASCADE;
TRUNCATE TABLE seniors  RESTART IDENTITY CASCADE;
TRUNCATE TABLE jobs     RESTART IDENTITY CASCADE;

-- 2. seniors (10건)
INSERT INTO seniors (name, region, desired_job, career_years) VALUES
  ('김영수', '서울',      '경비', 10),
  ('박미경', '경기',      '청소',  5),
  ('이정호', '서울',      '조리', 15),
  ('최순자', '인천',      '돌봄',  8),
  ('정대현', '서울',      '경비',  3),
  ('강옥분', '경기',      '돌봄', 12),
  ('윤기석', '서울',      '조리',  7),
  ('장미자', '인천',      '청소',  4),
  ('오상훈', '기타',      '기타', 20),
  ('임복순', '서울특별시', '경비직',  6);

-- 3. jobs (15건)
INSERT INTO jobs (title, region, job_type, required_career) VALUES
  ('아파트 경비원 A동',      '서울',      '경비',  5),
  ('오피스 미화 주간반',     '경기',      '청소',  2),
  ('어린이집 조리사',        '서울',      '조리', 10),
  ('방문 요양보호사 서구',   '인천',      '돌봄',  5),
  ('상가 야간 경비원',       '서울',      '경비',  3),
  ('주간 돌봄 보조',         '경기',      '돌봄',  4),
  ('단체급식 보조 조리',     '서울',      '조리',  3),
  ('호텔 객실 미화',         '인천',      '청소',  2),
  ('공원 환경 관리',         '서울',      '기타',  1),
  ('동주민센터 안내 도우미', '경기',      '기타',  0),
  ('학교 경비원',            '서울특별시', '경비',  2),
  ('병원 청소',              '인천',      '청소',  3),
  ('주간 조리 보조',         '서울',      '조리',  5),
  ('방문 돌봄 도우미',       '경기',      '돌봄',  6),
  ('주차 관리원',            '서울',      '경비',  1);

-- 4. 전체 시니어 매칭 점수 재계산
DO $$
DECLARE
  s RECORD;
BEGIN
  FOR s IN SELECT id FROM seniors LOOP
    PERFORM rematch_senior(s.id);
  END LOOP;
END;
$$;
