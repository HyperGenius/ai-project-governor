/* frontend/e2e/pages/ReportCreatePage.ts */
import { Page, expect } from '@playwright/test';

export class ReportCreatePage {
    constructor(private page: Page) { }

    // 新規作成画面へ移動
    async goto() {
        const BUTTON_NAME = '日報を作成する';
        // 既にダッシュボードにいる前提でボタンを押す、または直接URLを開くなど
        // ここでは安全のためダッシュボードから遷移するフローにします
        await this.page.goto('/');
        await this.page.getByRole('button', { name: BUTTON_NAME }).click();
        await this.page.waitForURL('**/reports/new');
    }

    // 日報を作成し、生成されたIDを返す
    async submitReport(content: string): Promise<string> {
        const BUTTON_NAME = '日報を作成する';
        await this.page.getByRole('textbox').fill(content);

        // APIレスポンスの待機設定
        const responsePromise = this.page.waitForResponse(response =>
            response.url().includes('/reports') &&
            response.request().method() === 'POST' &&
            response.status() === 200 // 必要に応じてステータスコードもチェック
        );

        // 作成ボタン押下
        await this.page.getByRole('button', { name: BUTTON_NAME }).click();

        // レスポンスからIDを取得して返す
        const response = await responsePromise;
        const json = await response.json();
        return json.id;
    }

    // ダッシュボードに戻り、指定されたIDの日報があるか確認
    async verifyReportExists(reportId: string) {
        await this.page.waitForURL('**/');

        // WebKit/Firefox対策のリロード処理をここに隠蔽
        await this.page.reload();

        // IDに基づくリンクの存在確認
        await expect(this.page.locator(`a[href*="${reportId}"]`)).toBeVisible();
    }
}
