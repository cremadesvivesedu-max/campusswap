import { expect, test } from "@playwright/test";

// Key flows in demo mode. Demo data: the visitor is Omar; Lina sells a "Gazelle city bike with lock".

test("public home and Maastricht pages load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("search")).toBeVisible();
  await page.goto("/maastricht/second-hand-bikes");
  await expect(page.getByRole("heading", { level: 1, name: "Second-hand bikes in Maastricht" })).toBeVisible();
  // One from the root layout (site name and logo), one from the landing page.
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
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

test("chat: safety notice is always there, warning only on payment talk from the other person", async ({ page }) => {
  await page.goto("/app/listings/listing-bike-1");
  await page.getByRole("button", { name: /message seller/i }).first().click();
  await expect(page).toHaveURL(/\/app\/messages\//);
  await expect(page.getByText(/Stay safe: meet somewhere public/)).toBeVisible();
  // Your own messages never get the warning.
  const box = page.getByPlaceholder(/message/i);
  await box.fill("Shall I send a Tikkie?");
  await box.press("Enter");
  await expect(page.getByText("Shall I send a Tikkie?")).toBeVisible();
  await expect(page.getByText(/this message mentions a payment/)).toHaveCount(0);
});

test("chat: quick replies suit the person's role", async ({ page }) => {
  // Demo visitor Omar is the buyer here.
  await page.goto("/app/messages/conv-bike");
  await expect(page.getByRole("button", { name: "Is this available?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yes, it's still available" })).toHaveCount(0);
});

test("sell form: giving an item away swaps the price field for a note", async ({ page }) => {
  await page.goto("/app/sell");
  const price = page.locator('input[name="price"]:not([type="hidden"])');
  await expect(price).toBeVisible();
  await page.getByLabel("Give it away for free").check();
  await expect(price).toBeHidden();
  await expect(page.locator('input[type="hidden"][name="price"]')).toHaveValue("0");
  await expect(page.getByText(/Free items are collected in person/)).toBeVisible();
});

test("free stuff: home link opens search with the free filter on", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("link", { name: /Free stuff/ }).click();
  await expect(page).toHaveURL(/\/app\/search\?max=0/);
  await expect(page.getByLabel("Free only")).toBeChecked();
  // The demo data has nothing free, and paid items must not slip through.
  await expect(page.getByText("Gazelle city bike with lock")).toHaveCount(0);
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

test("bundle: the seller's discount is applied and their absence is shown", async ({ page }) => {
  // Demo seller Lina gives 15% off bundles and is away.
  await page.goto("/app/bundle/user-lina");
  await expect(page.getByText(/gives 15% off bundles/)).toBeVisible();
  await page.goto("/app/listings/listing-bike-1");
  await expect(page.getByText(/Lina is away until .+ and may reply late/)).toBeVisible();
  await page.getByRole("button", { name: /message seller/i }).first().click();
  await expect(page).toHaveURL(/\/app\/messages\//);
  await expect(page.getByText(/Lina is away until .+ and may reply late/)).toBeVisible();
});

test("moving out page and the bike check tip", async ({ page }) => {
  await page.goto("/moving-out");
  await expect(page.getByRole("heading", { name: /Sell your room in one go/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Publish my things" })).toHaveAttribute("href", "/app/sell/bulk");
  await page.goto("/app/listings/listing-bike-1");
  await expect(page.getByRole("link", { name: "Check it on Stop Heling" })).toBeVisible();
});

test("admin: weekly metrics and moderation queue", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Métricas del lunes" })).toBeVisible();
  await page.goto("/admin/listings");
  await expect(page.getByRole("heading", { name: /Pendientes de revisar/ })).toBeVisible();
});

test("partners: confirmed shop is listed with its code", async ({ page }) => {
  await page.goto("/partners");
  await expect(page.getByRole("heading", { name: "ThePhoneLab Maastricht" })).toBeVisible();
  await page.locator('a[href="/partners/thephonelab"]').first().click();
  await expect(page).toHaveURL(/\/partners\/thephonelab/);
  await expect(page.getByText("CAMPUSLAB")).toBeVisible();
});
