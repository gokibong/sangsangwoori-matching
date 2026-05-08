-- 매칭 점수 계산 시 지역·직종 정규화 적용
-- 원본 데이터(seniors.region, seniors.desired_job, jobs.region, jobs.job_type)는 수정하지 않고
-- 비교 시점에만 정규화된 값을 사용한다.
CREATE OR REPLACE FUNCTION rematch_senior(p_senior_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_senior      seniors%ROWTYPE;
  v_job         jobs%ROWTYPE;
  v_score       INTEGER;
  v_s_region    TEXT;
  v_s_job_type  TEXT;
  v_j_region    TEXT;
  v_j_job_type  TEXT;
BEGIN
  SELECT * INTO v_senior FROM seniors WHERE id = p_senior_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- 시니어 지역 정규화
  v_s_region := CASE v_senior.region
    WHEN '서울특별시' THEN '서울'
    WHEN '경기도'     THEN '경기'
    WHEN '인천광역시' THEN '인천'
    ELSE v_senior.region
  END;

  -- 시니어 희망 직종 정규화
  v_s_job_type := CASE v_senior.desired_job
    WHEN '경비직' THEN '경비'
    WHEN '청소직' THEN '청소'
    WHEN '조리직' THEN '조리'
    WHEN '돌봄직' THEN '돌봄'
    ELSE v_senior.desired_job
  END;

  FOR v_job IN SELECT * FROM jobs LOOP
    v_score := 0;

    -- 공고 지역 정규화
    v_j_region := CASE v_job.region
      WHEN '서울특별시' THEN '서울'
      WHEN '경기도'     THEN '경기'
      WHEN '인천광역시' THEN '인천'
      ELSE v_job.region
    END;

    -- 공고 직종 정규화
    v_j_job_type := CASE v_job.job_type
      WHEN '경비직' THEN '경비'
      WHEN '청소직' THEN '청소'
      WHEN '조리직' THEN '조리'
      WHEN '돌봄직' THEN '돌봄'
      ELSE v_job.job_type
    END;

    IF v_s_region   = v_j_region   THEN v_score := v_score + 3; END IF;
    IF v_s_job_type = v_j_job_type THEN v_score := v_score + 2; END IF;
    IF v_senior.career_years >= v_job.required_career THEN v_score := v_score + 1; END IF;

    INSERT INTO matches (senior_id, job_id, score, status)
      VALUES (p_senior_id, v_job.id, v_score, 'pending')
    ON CONFLICT (senior_id, job_id)
      DO UPDATE SET score = EXCLUDED.score;
  END LOOP;
END;
$$;
