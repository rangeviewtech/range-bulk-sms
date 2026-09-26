import { describe, it, expect } from "vitest";
import { 
  RANGE_NAVIGATION, 
  SCREEN_KEYWORDS, 
  SearchableScreen 
} from "@/components/layout/range-sidebar";
import { computeFlyoutPosition } from "@/lib/flyout-position";

describe("Sidebar Navigation Hierarchy & Coverage", () => {
  it("includes all essential top-level modules", () => {
    const moduleTitles = RANGE_NAVIGATION.map((m) => m.title);
    expect(moduleTitles).toContain("Dashboard");
    expect(moduleTitles).toContain("SMS");
    expect(moduleTitles).toContain("Contacts");
    expect(moduleTitles).toContain("Sender IDs");
    expect(moduleTitles).toContain("Billing");
    expect(moduleTitles).toContain("Developer");
    expect(moduleTitles).toContain("Agent");
    expect(moduleTitles).toContain("Reports");
    expect(moduleTitles).toContain("Admin");
    expect(moduleTitles).toContain("Settings");
  });

  it("includes Android Gateways under Developer", () => {
    const devMod = RANGE_NAVIGATION.find((m) => m.title === "Developer");
    expect(devMod).toBeDefined();
    const gatewaysCat = devMod?.categories?.find((c) => c.title === "Gateways");
    expect(gatewaysCat).toBeDefined();
    const hrefs = gatewaysCat?.items.map((i) => i.href);
    expect(hrefs).toContain("/gateways");
    expect(hrefs).toContain("/gateways/add");
  });

  it("includes Billing & Invoices overview under Billing", () => {
    const billingMod = RANGE_NAVIGATION.find((m) => m.title === "Billing");
    expect(billingMod).toBeDefined();
    const overviewCat = billingMod?.categories?.find((c) => c.title === "Overview");
    expect(overviewCat).toBeDefined();
    const hrefs = overviewCat?.items.map((i) => i.href);
    expect(hrefs).toContain("/billing");
  });

  it("includes Profile and System Alerts under Settings", () => {
    const settingsMod = RANGE_NAVIGATION.find((m) => m.title === "Settings");
    expect(settingsMod).toBeDefined();
    const allHrefs = settingsMod?.categories?.flatMap((c) => c.items.map((i) => i.href)) || [];
    expect(allHrefs).toContain("/profile");
    expect(allHrefs).toContain("/notifications");
  });

  it("includes Communication Providers under Admin Configuration", () => {
    const adminMod = RANGE_NAVIGATION.find((m) => m.title === "Admin");
    expect(adminMod).toBeDefined();
    const configCat = adminMod?.categories?.find((c) => c.title === "Configuration");
    expect(configCat).toBeDefined();
    const hrefs = configCat?.items.map((i) => i.href);
    expect(hrefs).toContain("/admin/communications/providers");
  });
});

describe("SCREEN_KEYWORDS and Universal Screen Matching Engine", () => {
  it("indexes keywords for all registered routes", () => {
    expect(SCREEN_KEYWORDS["/sms/send"]).toContain("quick send");
    expect(SCREEN_KEYWORDS["/sms/send"]).toContain("broadcast");
    expect(SCREEN_KEYWORDS["/sms/delivery-reports"]).toContain("dlr");
    expect(SCREEN_KEYWORDS["/billing"]).toContain("invoices");
    expect(SCREEN_KEYWORDS["/gateways"]).toContain("android phone");
    expect(SCREEN_KEYWORDS["/wallet"]).toContain("top up");
    expect(SCREEN_KEYWORDS["/settings/security"]).toContain("2fa");
    expect(SCREEN_KEYWORDS["/support"]).toContain("ticket");
  });

  // Simulated search ranking function matching the component's implementation
  function searchScreens(query: string, screens: SearchableScreen[]): SearchableScreen[] {
    if (!query.trim()) return screens.slice(0, 18);
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);

    interface ScoredScreen {
      screen: SearchableScreen;
      score: number;
    }

    const scored: ScoredScreen[] = [];

    for (const s of screens) {
      const titleLower = s.title.toLowerCase();
      const catLower = (s.category || "").toLowerCase();
      const modLower = s.module.toLowerCase();
      const hrefLower = s.href.toLowerCase();
      const kwString = s.keywords.join(" ").toLowerCase();

      let score = 0;

      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 80;
      else if (titleLower.includes(q)) score += 60;

      for (const kw of s.keywords) {
        if (kw === q) {
          score += 55;
          break;
        } else if (kw.startsWith(q)) {
          score += 40;
          break;
        } else if (kw.includes(q)) {
          score += 25;
          break;
        }
      }

      if (catLower.includes(q)) score += 35;
      if (modLower.includes(q)) score += 30;
      if (hrefLower.includes(q)) score += 25;

      if (tokens.length > 1) {
        const fullCorpus = `${titleLower} ${catLower} ${modLower} ${hrefLower} ${kwString}`;
        const allTokensMatch = tokens.every((t) => fullCorpus.includes(t));
        if (allTokensMatch) {
          score += 45;
        }
      }

      if (score > 0) {
        scored.push({ screen: s, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((item) => item.screen);
  }

  const allIndexedScreens: SearchableScreen[] = [];
  RANGE_NAVIGATION.forEach((mod) => {
    if (mod.href) {
      allIndexedScreens.push({
        module: mod.title,
        title: mod.title,
        href: mod.href,
        keywords: SCREEN_KEYWORDS[mod.href] || [],
      });
    }
    if (mod.categories) {
      mod.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          allIndexedScreens.push({
            module: mod.title,
            category: cat.title,
            title: item.title,
            href: item.href,
            keywords: SCREEN_KEYWORDS[item.href] || [],
          });
        });
      });
    }
  });

  it("matches 'invoice' to Billing & Invoices and Transactions", () => {
    const results = searchScreens("invoice", allIndexedScreens);
    expect(results.length).toBeGreaterThan(0);
    const hrefs = results.map((r) => r.href);
    expect(hrefs).toContain("/billing");
    expect(hrefs).toContain("/wallet/transactions");
  });

  it("matches 'dlr' to Delivery Reports as top result", () => {
    const results = searchScreens("dlr", allIndexedScreens);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].href).toBe("/sms/delivery-reports");
  });

  it("matches 'android' or 'phone' to Android Gateways", () => {
    const resultsAndroid = searchScreens("android", allIndexedScreens);
    expect(resultsAndroid.length).toBeGreaterThan(0);
    expect(resultsAndroid[0].href).toBe("/gateways");

    const resultsPhone = searchScreens("phone", allIndexedScreens);
    expect(resultsPhone.length).toBeGreaterThan(0);
    expect(resultsPhone.some((r) => r.href === "/gateways")).toBe(true);
  });

  it("matches 'top up' or 'deposit' to Wallet Dashboard", () => {
    const resultsTopup = searchScreens("top up", allIndexedScreens);
    expect(resultsTopup.length).toBeGreaterThan(0);
    expect(resultsTopup[0].href).toBe("/wallet");

    const resultsDeposit = searchScreens("deposit", allIndexedScreens);
    expect(resultsDeposit.length).toBeGreaterThan(0);
    expect(resultsDeposit[0].href).toBe("/wallet");
  });

  it("matches multi-token queries like 'send sms' or 'sms send'", () => {
    const res1 = searchScreens("send sms", allIndexedScreens);
    expect(res1[0].href).toBe("/sms/send");

    const res2 = searchScreens("sms send", allIndexedScreens);
    expect(res2[0].href).toBe("/sms/send");
  });
});

describe("Flyout Positioning, Zero-Lag, & Boundary Cropping Calculations", () => {
  it("aligns submenu top with parent for upper items", () => {
    const pos = computeFlyoutPosition({
      parentRect: { top: 120, bottom: 210, left: 0, right: 90, height: 90 },
      sidebarRect: { top: 0, bottom: 900, left: 0, right: 90, width: 90 },
      submenuHeight: 180,
      isLastItem: false,
      viewportHeight: 900,
    });
    expect(pos.top).toBe(120);
    expect(pos.left).toBe(90);
    expect(pos.overflowsViewport).toBe(false);
  });

  it("bottom-aligns submenu for the last item", () => {
    const pos = computeFlyoutPosition({
      parentRect: { top: 700, bottom: 790, left: 0, right: 90, height: 90 },
      sidebarRect: { top: 0, bottom: 900, left: 0, right: 90, width: 90 },
      submenuHeight: 200,
      isLastItem: true,
      viewportHeight: 900,
    });
    // bottom = 790, submenuHeight = 200 -> top = 790 - 200 = 590
    expect(pos.top).toBe(590);
    expect(pos.left).toBe(90);
  });

  it("clamps submenu upward when it would extend past viewport bottom", () => {
    const pos = computeFlyoutPosition({
      parentRect: { top: 820, bottom: 910, left: 0, right: 90, height: 90 },
      sidebarRect: { top: 0, bottom: 900, left: 0, right: 90, width: 90 },
      submenuHeight: 200,
      isLastItem: false,
      viewportHeight: 900,
    });
    // maxBottom = 900 - 8 = 892. top = 892 - 200 = 692
    expect(pos.top).toBe(692);
    expect(pos.overflowsViewport).toBe(true);
  });

  it("instant crop logic correctly detects out-of-bounds scrolling", () => {
    const treeRect = { top: 100, bottom: 800 };

    // Parent item scrolled above visible treeModule
    const parentScrolledAbove = { top: -20, bottom: 70 };
    const isOutAbove = parentScrolledAbove.bottom <= treeRect.top + 4; // 70 <= 104 -> true
    expect(isOutAbove).toBe(true);

    // Parent item visible in middle
    const parentVisible = { top: 200, bottom: 290 };
    const isVisibleOut = parentVisible.bottom <= treeRect.top + 4 || parentVisible.top >= treeRect.bottom - 4;
    expect(isVisibleOut).toBe(false);

    // Parent item scrolled below visible treeModule
    const parentScrolledBelow = { top: 810, bottom: 900 };
    const isOutBelow = parentScrolledBelow.top >= treeRect.bottom - 4; // 810 >= 796 -> true
    expect(isOutBelow).toBe(true);
  });

  it("calculates deepMenu relative alignment and clamps to viewport bottom", () => {
    const flyoutTop = 200;
    const catRect = { top: 231, bottom: 269 };
    const catRelativeTop = catRect.top - flyoutTop; // 31px
    expect(catRelativeTop).toBe(31);

    const deepHeight = 152; // 4 items * 38px
    const viewportHeight = 800;
    const maxBottom = viewportHeight - 8; // 792px
    const deepBottom = catRect.top + deepHeight; // 231 + 152 = 383 <= 792
    expect(deepBottom <= maxBottom).toBe(true);

    // Near bottom case
    const catNearBottom = { top: 750, bottom: 788 };
    const catNearBottomRel = catNearBottom.top - flyoutTop; // 550px
    const deepBottomOverflow = catNearBottom.top + deepHeight; // 750 + 152 = 902 > 792
    const overflow = deepBottomOverflow - maxBottom; // 110px
    const shiftedTop = Math.max(0, catNearBottomRel - overflow); // 550 - 110 = 440px
    expect(shiftedTop).toBe(440);
  });
});
