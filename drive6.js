const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2000, height: 1200 } });
  await page.goto("http://localhost:8934/?debug", { waitUntil: "load" });
  await page.waitForSelector("#scene-nav", { state: "visible" });
  await page.click('#scene-nav button[data-act="6"]');
  await page.waitForTimeout(800);
  for (let i = 0; i < 4; i++) {
    await page.mouse.click(1000, 600);
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "s6-01-grabprompt.png" });
  await browser.close();
})();
