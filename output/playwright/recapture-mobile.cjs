async (page) => {
  for (const [name,width] of [['mobile',390],['small-mobile',320]]) {
    await page.setViewportSize({width,height:844});
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(img=>img.loading='eager');await Promise.all([...document.images].map(img=>img.decode()));});
    await page.waitForTimeout(1200);
    await page.screenshot({path:`output/playwright/${name}-hero.png`});
    await page.screenshot({path:`output/playwright/${name}-full.png`,fullPage:true});
    await page.locator('[data-rank="4"]').click();
    await page.waitForTimeout(400);
    await page.locator('.belt-bay').screenshot({path:`output/playwright/${name}-belt.png`});
  }
  return 'Mobile captures settled and refreshed at 390 and 320px.';
}
