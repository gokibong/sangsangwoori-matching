import { test, expect } from '@playwright/test';
import { resetDb, countSeniors } from './helpers/db';

test.describe('실패 시나리오 – 이름 미입력 유효성 검사', () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test('이름 없이 제출 → 빨간 안내 박스 + DB 미삽입', async ({ page }) => {
    await page.goto('/register');

    // 이름은 비워둔 채 나머지 항목 입력
    await page.selectOption('#region', '서울');
    await page.selectOption('#desired_job', '경비');
    await page.fill('#career_years', '3');
    await page.click('button[type="submit"]');

    // 이름 필드 위 빨간 에러 박스 확인
    await expect(page.locator('text=이름을 입력해 주세요.')).toBeVisible();

    // 성공 메시지는 표시되지 않아야 함
    await expect(page.locator('text=등록이 완료되었습니다')).not.toBeVisible();

    // DB에 새 레코드가 없어야 함
    const count = await countSeniors();
    expect(count).toBe(0);
  });
});
