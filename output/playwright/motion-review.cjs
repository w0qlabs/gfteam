async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({width:1440, height:1000});
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-step="0"]').click();
  await page.evaluate(async () => {
    const source = await (await fetch('/src/scripts/technique.js')).text();
    window.motionGsap = (await import(source.match(/from "([^"]*deps\/gsap.js[^\"]*)"/)[1])).gsap;
  });
  const seen = new Set();
  const results = [];
  for (let attempt = 0; seen.size < 3 && attempt < 6; attempt++) {
    await page.locator('[data-step="0"]').click();
    await page.locator('#play-technique').click();
    await page.waitForTimeout(350);
    const id = await page.locator('#grappling').getAttribute('data-finish');
    await page.locator('#play-technique').click();
    if (seen.has(id)) continue;
    seen.add(id);
    const data = await page.evaluate(() => {
      const tl = window.motionGsap.getById('grappling-sequence');
      return { labels: Object.entries(tl.labels), duration: tl.duration() };
    });
    results.push({id, ...data});
    let serial = 0;
    const samples = data.labels.flatMap(([name, t], i) => i ? [[`${name}-mid`, (data.labels[i-1][1] + t)/2], [name, t]] : [[name, t]]);
    for (const [name, t] of samples) {
      await page.evaluate(time => { window.motionGsap.getById('grappling-sequence').pause(time, false); }, t);
      await page.locator('#grappling').screenshot({timeout:5000,path:`output/playwright/final-${id}-${String(serial++).padStart(2, '0')}-${name}.png`});
    }
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({width, height:1000});
      // Inspect the start, every transition midpoint and the final pose at
      // each size, not only the final silhouette of one representative move.
      if (width !== 1440) {
        for (const [name, t] of samples.filter(([name]) => name === 'base' || name.endsWith('-mid') || name === data.labels.at(-1)[0])) {
          await page.evaluate(time => { window.motionGsap.getById('grappling-sequence').pause(time, false); }, t);
          await page.locator('#grappling').screenshot({path:`output/playwright/final-${width}-${id}-${name}.png`});
        }
      }
      await page.locator('[data-step="3"]').click();
      await page.locator('.technique-sticky').screenshot({path:`output/playwright/responsive-${id}-${width}.png`});
      results.push(await page.evaluate(() => ({width:innerWidth, finish:document.querySelector('#grappling').dataset.finish, overflow:document.documentElement.scrollWidth > innerWidth, outliers:[...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && el.namespaceURI !== 'http://www.w3.org/2000/svg').map(el=>el.className).slice(0,8)})));
    }
    await page.setViewportSize({width:1440,height:1000});
  }
  console.log('All technique frames captured');
  return {results, errors};
}
