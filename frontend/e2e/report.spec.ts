/* frontend/e2e/report.spec.ts */
import { test } from '@playwright/test';
import { ReportCreatePage } from './pages/ReportCreatePage';

// テスト用アカウント情報
// 実際の環境変数か、ハードコードした値を使用
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

test.describe('日報作成フロー', () => {

    test('ログインして新しい日報を作成できる', async ({ page }) => {
        if (!EMAIL || !PASSWORD) {
            throw new Error('テスト用環境変数 (TEST_EMAIL, TEST_PASSWORD) が設定されていません。');
        }
        // --- 1. ログイン処理 ---
        await page.goto('/login');
        await page.getByLabel('メールアドレス').fill(EMAIL);
        await page.getByLabel('パスワード').fill(PASSWORD);
        await page.getByRole('button', { name: 'ログイン' }).click();
        await page.waitForURL('**/');

        // --- 2. 新規作成画面へ移動 ---
        // Page Objectのインスタンス化, 画面遷移
        const reportPage = new ReportCreatePage(page);
        await reportPage.goto();

        // 作成処理（複雑なAPI待機ロジックはsubmitReport内に隠蔽）
        const content = `Playwrightによる自動テスト日報 ${new Date().getTime()}`;
        const newSubject = await reportPage.submitReport(content);

        // 検証処理（リロード対策などはverifyReportExists内に隠蔽）
        await reportPage.verifyReportExists(newSubject);

        // 追加: 詳細ページへ遷移できるか確認
        await reportPage.openReport(newSubject);
    });
});