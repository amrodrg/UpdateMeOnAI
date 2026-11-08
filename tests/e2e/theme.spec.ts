import { test, expect } from "@playwright/test";

test("theme toggle switches palette and persists across reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");

  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Light", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Dark", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
