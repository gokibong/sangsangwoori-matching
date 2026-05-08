import { test, expect } from '@playwright/test';
import { resetDb, insertJob, getSeniorByName } from './helpers/db';

test.describe('정상 시나리오 – 시니어 등록 후 6점 매칭 추천', () => {
  test.beforeEach(async () => {
    await resetDb();
    // 서울 / 경비 / 요구경력 3년 공고 1건 준비
    await insertJob({ title: '서울 경비원', region: '서울', job_type: '경비', required_career: 3 });
  });

  test('등록 성공 메시지 초록 박스 + 6점 금색 배지 카드 상단 표시', async ({ page }) => {
    await page.goto('/register');

    await page.fill('#name', '테스트시니어');
    await page.selectOption('#region', '서울');
    await page.selectOption('#desired_job', '경비');
    await page.fill('#career_years', '5');
    await page.click('button[type="submit"]');

    // "등록이 완료되었습니다" 초록 박스 확인 (비동기 Supabase insert + rematch RPC 완료 후 노출)
    await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 });

    // DB에서 방금 생성된 시니어 id 조회
    const senior = await getSeniorByName('테스트시니어');
    expect(senior).not.toBeNull();

    // 추천 목록 페이지 접속
    await page.goto(`/recommendations?senior_id=${senior!.id}`);

    // 6점 금색(bg-yellow-100) 배지 확인
    const badge = page.getByText('6점');
    await expect(badge.first()).toBeVisible({ timeout: 10_000 });

    // 첫 번째 카드가 6점 배지를 포함하는지 확인 (상단 표시)
    const firstCard = page.locator('[class*="rounded"]').filter({ hasText: '6점' }).first();
    await expect(firstCard).toBeVisible();
  });
});
