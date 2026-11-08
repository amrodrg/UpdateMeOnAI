import { expect, test } from "@playwright/test";

test("shows news cards with category filter and original links", async ({ page }) => {
  await page.goto("/");

  const cards = page.locator("section[aria-label='AI news'] li");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);

  const firstLink = cards.first().getByRole("link", { name: /Read original/ });
  await expect(firstLink).toHaveAttribute("target", "_blank");
  await expect(firstLink).toHaveAttribute("rel", /noopener/);

  await page.getByRole("tab", { name: "Models" }).click();
  await expect(page.getByRole("tab", { name: "Models" })).toHaveAttribute("aria-selected", "true");
  expect(await cards.count()).toBeLessThanOrEqual(total);

  await page.getByRole("tab", { name: "All" }).click();
  await page.getByPlaceholder("Search titles and summaries…").fill("zzz-no-match-zzz");
  await expect(page.getByText("No news matches your filters yet.")).toBeVisible();
});
