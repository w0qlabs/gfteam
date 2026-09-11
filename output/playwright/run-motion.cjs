// Use an installed Playwright package or pass its absolute path as argument 3.
const { chromium } = require(process.argv[3] || 'playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({channel:'chrome', headless:true});
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => console.error(error.message));
    const check = eval(`(${fs.readFileSync(process.argv[2], 'utf8')})`);
    const result = await check(page);
    const report = JSON.stringify(result, null, 2);
    fs.writeFileSync(process.argv[2].replace(/\.cjs$/, '.json'), report);
    console.log(report);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
