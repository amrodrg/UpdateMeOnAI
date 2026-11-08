import { expect, test } from "@playwright/test";

test("learn map lets the learner select a lesson and mark it learned", async ({ page }) => {
  await page.goto("/learn");

  await expect(page.getByRole("heading", { name: "Learning map" })).toBeVisible();
  const firstNode = page.locator("#learn-node-prompts");
  await firstNode.click();
  await expect(firstNode).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Mark as learned" }).click();
  await expect(page.getByText("1 of ")).toBeVisible();
  await expect(page.getByRole("button", { name: /Prompts & context, learned/ })).toBeVisible();

  await page.reload();
  await expect(page.getByText("1 of ")).toBeVisible();
});

test("home page links to the learn page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Learn to build agents →" }).click();
  await expect(page).toHaveURL(/\/learn\/?$/);
});
