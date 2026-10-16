import { expect, test } from "@playwright/test";

// Key flows in demo mode. Demo data: the visitor is Omar; Lina sells a "Gazelle city bike with lock".

test("public home and Maastricht pages load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("search")).toBeVisible();
  await page.goto("/maastricht/second-hand-bikes");
  await expect(page.getByRole("heading", { level: 1, name: "Second-hand bikes in Maastricht" })).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test("search understands Spanish, Dutch and typos", async ({ page }) => {
  for (const query of ["bici", "fiets", "bikke"]) {
    await page.goto(`/app/search?q=${query}`);
    await expect(page.getByText("Gazelle city bike with lock").first()).toBeVisible();
  }
});

test("listing page shows price, seller and buying options", async ({ page }) => {
  await page.goto("/app/listings/listing-bike-1");
  await expect(page.getByRole("heading", { name: "Gazelle city bike with lock" })).toBeVisible();
  await expect(page.getByText("Lina Vermeer").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /message seller/i }).first()).toBeVisible();
});

test("chat: open a conversation and send a message with Enter", async ({ page }) => {
  await page.goto("/app/listings/listing-bike-1");
  await page.getByRole("button", { name: /message seller/i }).first().click();
  await expect(page).toHaveURL(/\/app\/messages\//);
  const box = page.getByPlaceholder(/message/i);
  const text = `Is it still available? ${Date.now()}`;
  await box.fill(text);
  await box.press("Enter");
  await expect(page.getByText(text)).toBeVisible();
});

test("sell several items at once", async ({ page }) => {
  await page.goto("/app/sell/bulk");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  await page.locator('input[type="file"]').setInputFiles([
    { name: "lamp.png", mimeType: "image/png", buffer: png },
    { name: "bike.png", mimeType: "image/png", buffer: png }
  ]);
  const titles = page.getByPlaceholder("What is it?");
  await expect(titles).toHaveCount(2);
  await titles.nth(0).fill("Desk lamp");
  await titles.nth(1).fill("City bike");
  const prices = page.getByPlaceholder("€");
  await prices.nth(0).fill("8");
  await prices.nth(1).fill("70");
  await page.getByRole("button", { name: /publish 2 listings/i }).click();
  await expect(page.getByText("2 listings published")).toBeVisible();
});

test("post an 'I'm looking for' request", async ({ page }) => {
  await page.goto("/app/wanted");
  await page.getByPlaceholder(/women's bike/i).fill("Desk lamp");
  await page.getByRole("button", { name: "Post request" }).click();
  await expect(page.getByText(/request posted/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "I have one" }).first()).toBeVisible();
});

test("invite page shows a personal link", async ({ page }) => {
  await page.goto("/app/invite");
  await expect(page.getByText(/\/signup\?ref=[a-z0-9]{8}/)).toBeVisible();
});

test("bundle: pick two items from one seller", async ({ page }) => {
  await page.goto("/app/bundle/user-lina");
  const items = page.locator("main ul button[aria-pressed]");
  await items.nth(0).click();
  await items.nth(1).click();
  await expect(items.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /send bundle offer/i })).toBeEnabled();
});

test("admin: weekly metrics and moderation queue", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Métricas del lunes" })).toBeVisible();
  await page.goto("/admin/listings");
  await expect(page.getByRole("heading", { name: /Pendientes de revisar/ })).toBeVisible();
});
