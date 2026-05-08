import { test, expect } from '@playwright/test';
import { resetDb, insertJob, getSeniorByName } from './helpers/db';

test.describe('엣지 시나리오 – 매칭 일자리 없음', () => {
  test.beforeEach(async () => {
    await resetDb();
    // 지역·직종이 다르고 required_career=10으로 설정해 score=0 보장
    // (required_career=0이면 career 항목에서 +1이 붙어 score>0이 되므로 10으로 설정)
    await insertJob({ title: '기타 일자리', region: '기타', job_type: '기타', required_career: 10 });
  });

  test('서울/경비/3 시니어 등록 → 추천 없음 안내 박스', async ({ page }) => {
    await page.goto('/register');

    await page.fill('#name', '매칭없는시니어');
    await page.selectOption('#region', '서울');
    await page.selectOption('#desired_job', '경비');
    await page.fill('#career_years', '3');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 });

    // DB에서 senior_id 조회
    const senior = await getSeniorByName('매칭없는시니어');
    expect(senior).not.toBeNull();

    // 추천 목록 페이지에서 "매칭 없음" 안내 확인
    await page.goto(`/recommendations?senior_id=${senior!.id}`);
    await expect(
      page.locator('text=현재 매칭되는 일자리가 없습니다')
    ).toBeVisible({ timeout: 10_000 });
  });
});
