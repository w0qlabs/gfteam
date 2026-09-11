async (page) => {
  const results = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('http://127.0.0.1:4174/');
    await page.locator('[data-step="3"]').click();
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const result = await page.evaluate(async () => {
      const {violations} = await axe.run('#filosofia', {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});
      const bounds = [...document.querySelectorAll('.technique-sticky, .technique-controls button')].map(el=>el.getBoundingClientRect());
      return {width:innerWidth,violations:violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),fits:bounds.every(b=>b.left >= 0 && b.right <= innerWidth)};
    });
    results.push(result);
  }
  await page.locator('#play-technique').click();
  await page.waitForFunction(() => document.querySelector('#play-technique').textContent.includes('Ver outra'), null, {timeout:14000});
  results.push({productionPlayback:await page.locator('[data-step="3"]').getAttribute('aria-pressed') === 'true'});
  if (results.some(r=>r.violations?.length || r.fits === false) || errors.length) throw new Error(JSON.stringify({results,errors}));
  return {results,errors};
}
