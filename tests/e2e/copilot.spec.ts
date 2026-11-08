import { expect, test } from "@playwright/test";

test("copilot guide teaches the workflow and links back to learn", async ({ page }) => {
  await page.goto("/copilot");

  await expect(page.getByRole("heading", { level: 1, name: "GitHub Copilot, end to end" })).toBeVisible();
  for (const id of ["start", "connectors", "customize", "practice"]) {
    await expect(page.locator(`section#${id}`)).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Recommended skills and agents" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Newest Copilot updates" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Learn to build agents" })).toHaveAttribute("href", "/learn");
});

test("home page links to the copilot guide", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "GitHub Copilot guide" })).toHaveAttribute("href", "/copilot");
});
