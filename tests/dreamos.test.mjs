import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

// Sample TestDriver tests for Looscid — production environment.
//
// App under test: https://looscid.github.io/Looscid/ (GitHub Pages).
//
// Looscid describes itself as a free, open-source social platform + full
// web-OS experience. Auth is Nostr-based with a read-only "Guest Dreamor"
// mode, so no credentials/fixtures are needed for the public surface.
//
// NOTE on scope: the only surface actually deployed on the production
// GitHub Pages site is the marketing/landing page. The "LAUNCH LOOSCID"
// button points at the app surface; when the SPA is published these tests
// can be extended to drive the Feed / Discover / Cherry AI flows as a
// signed-in or guest Dreamor.

const LANDING_URL = "https://looscid.github.io/Looscid/";

describe("Looscid landing page (production)", () => {
  it("renders the hero with slogan and launch call-to-action", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: LANDING_URL });

    const heroVisible = await testdriver.assert(
      "the Looscid landing page is visible with the large 'Looscid' title and the 'DO IT ALL. ON LOOSCID' slogan"
    );
    expect(heroVisible).toBeTruthy();

    const ctaVisible = await testdriver.assert(
      "a prominent 'LAUNCH LOOSCID' call-to-action button is visible"
    );
    expect(ctaVisible).toBeTruthy();
  });

  it("shows the three product feature highlights", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: LANDING_URL });

    // Feature cards live below the fold on smaller viewports — scroll down.
    await testdriver.pressKeys(["End"]);
    await testdriver.wait(1500);

    const featuresVisible = await testdriver.assert(
      "the page shows product feature highlights including 'Full OS in Browser', 'Cherry AI Everywhere', and 'Accessibility First'"
    );
    expect(featuresVisible).toBeTruthy();
  });

  it("exposes the GitHub and social links in the footer", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: LANDING_URL });

    await testdriver.pressKeys(["End"]);
    await testdriver.wait(1500);

    const linksVisible = await testdriver.assert(
      "there are footer links to GitHub and to the @Looscid social account"
    );
    expect(linksVisible).toBeTruthy();
  });
});
