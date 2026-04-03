import { expect, test } from "@playwright/test";

test("public landing and app routes render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Buy and sell student essentials in Maastricht without the chaos.")).toBeVisible();
  await page.goto("/app");
  await expect(page.getByText("Welcome back, Omar.")).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByText("CampusSwap Admin")).toBeVisible();
});
