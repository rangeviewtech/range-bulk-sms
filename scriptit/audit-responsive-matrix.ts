import { chromium } from '@playwright/test';

interface ViewportSpec {
  width: number;
  height: number;
  name: string;
}

const VIEWPORTS: ViewportSpec[] = [
  { width: 320, height: 667, name: 'Small mobile (iPhone SE)' },
  { width: 360, height: 800, name: 'Android standard (Galaxy S20)' },
  { width: 375, height: 667, name: 'Mobile standard (iPhone 8)' },
  { width: 390, height: 844, name: 'Modern mobile (iPhone 12/13/14)' },
  { width: 414, height: 896, name: 'Large mobile (iPhone XR/11)' },
  { width: 430, height: 932, name: 'Max mobile (iPhone 14/15 Pro Max)' },
  { width: 480, height: 800, name: 'Phablet / Wide mobile' },
  { width: 600, height: 960, name: 'Foldable / Small tablet' },
  { width: 768, height: 1024, name: 'Tablet portrait (iPad)' },
  { width: 820, height: 1180, name: 'Tablet portrait (iPad Air)' },
  { width: 834, height: 1194, name: 'Tablet portrait (iPad Pro 11)' },
  { width: 912, height: 1368, name: 'Tablet portrait (Surface Pro 7)' },
  { width: 1024, height: 768, name: 'Tablet landscape / Small desktop' },
  { width: 1180, height: 820, name: 'Tablet landscape (iPad Air)' },
  { width: 1280, height: 800, name: 'Compact laptop (WXGA)' },
  { width: 1366, height: 768, name: 'Standard laptop (HD)' },
  { width: 1440, height: 900, name: 'Desktop reference (Original)' },
  { width: 1600, height: 900, name: 'Large display (HD+)' },
  { width: 1920, height: 1080, name: 'Full HD desktop (1080p)' },
  { width: 2560, height: 1440, name: 'QHD / 2K ultrawide desktop' },
];

async function main() {
  console.log('========================================================================');
  console.log('   RANGE BULK SMS DEVELOPER PORTAL — 20-VIEWPORT RESPONSIVE AUDIT       ');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let allPassed = true;

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/api/docs', { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => {
      const root = document.documentElement;
      const innerWidth = window.innerWidth;
      const scrollWidth = root.scrollWidth;
      const clientWidth = root.clientWidth;

      // Try scrolling right to test for physical horizontal scroll
      window.scrollTo(1000, 0);
      const actualScrollX = window.scrollX;
      window.scrollTo(0, 0);

      return {
        innerWidth,
        scrollWidth,
        clientWidth,
        actualScrollX,
        hasPageOverflow: scrollWidth > clientWidth + 1 || actualScrollX > 0,
      };
    });

    const passed = !metrics.hasPageOverflow;
    if (!passed) {
      allPassed = false;
    }

    const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
    console.log(
      `${statusIcon} | ${String(vp.width).padStart(4)}px | ${vp.name.padEnd(36)} | scrollWidth: ${metrics.scrollWidth}px | clientWidth: ${metrics.clientWidth}px | scrollX: ${metrics.actualScrollX}px`
    );
  }

  await browser.close();

  console.log('\n========================================================================');
  console.log(`AUDIT RESULT: ${allPassed ? 'ALL 20 VIEWPORTS PASSED (0 OVERFLOW)' : 'FAILURES DETECTED'}`);
  console.log('========================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
