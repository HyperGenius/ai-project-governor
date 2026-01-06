/* frontend/e2e/auth.spec.ts */
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {

    test('未ログイン状態でトップページにアクセスするとログイン画面にリダイレクトされる', async ({ page }) => {
        // 1. トップページにアクセス
        await page.goto('/');

        // 2. URLが /login に変わることを確認
        // ※ Supabaseの処理が入るため多少時間がかかる場合があるので waitForURL を推奨
        await page.waitForURL('**/login');

        // 3. ログイン画面の要素が表示されているか確認, ログインボタンの存在を確認
        await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    });

});