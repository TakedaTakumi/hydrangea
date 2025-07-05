import { test, expect } from "@playwright/test";

// MVP: index.htmlが表示されることを確認するE2Eテスト

test("index.html loads and displays base content", async ({ page }) => {
  await page.goto("http://localhost:5173");
  // まだindex.htmlが未作成のため、タイトル要素の有無のみ仮チェック
  await expect(page).toHaveTitle(/mindmap|マインドマップ/i);
});
