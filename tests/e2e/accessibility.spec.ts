import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Automatic accessibility check (axe-core, WCAG 2.1 A + AA) on the pages most people see.
// Only "serious" and "critical" problems fail the build; the rest are printed as a to-do.
const pages = [
  { name: "public home", path: "/" },
  { name: "Maastricht bikes page", path: "/maastricht/second-hand-bikes" },
  { name: "login", path: "/login" },
  { name: "app home", path: "/app" },
  { name: "search", path: "/app/search?q=bike" },
  { name: "listing", path: "/app/listings/listing-bike-1" },
  { name: "sell", path: "/app/sell" },
  { name: "wanted board", path: "/app/wanted" }
];

for (const target of pages) {
  test(`accessibility: ${target.name}`, async ({ page }) => {
    await page.goto(target.path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Next.js dev overlay and the dev-only route announcer are not part of the site.
      .exclude("nextjs-portal")
      .analyze();

    const blocking = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    );
    const minor = results.violations.filter((violation) => !blocking.includes(violation));

    for (const violation of minor) {
      console.log(`[a11y minor] ${target.path} · ${violation.id}: ${violation.help} (${violation.nodes.length})`);
    }

    const summary = blocking.map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes
          .slice(0, 5)
          .map((node) => `    ${node.target.join(" ")}`)
          .join("\n")
    );
    expect(summary, `Accessibility problems on ${target.path}`).toEqual([]);
  });
}
