async (page) => {
  const results = [];
  for (const url of [
    'http://127.0.0.1:3000/index.html?vscode-livepreview=true',
    'http://127.0.0.1:5173/',
    'http://127.0.0.1:4173/',
    'http://127.0.0.1:3000/dist/index.html',
  ]) {
    const errors = [];
    const failed = [];
    const onError = error => errors.push(error.message);
    const onResponse = response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); };
    page.on('pageerror', onError);
    page.on('response', onResponse);
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(url);
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach(image => image.loading = 'eager');
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    });
    await page.waitForTimeout(1200);
    const assets = await page.evaluate(() => ({
      images: [...document.images].map(image => ({url:image.currentSrc, loaded:image.naturalWidth > 0})),
      font: document.fonts.check('600 40px Archivo'),
      stylesheet: getComputedStyle(document.body).backgroundColor === 'rgb(242, 243, 238)',
      icon: getComputedStyle(document.querySelector('.ph-arrow-up-right')).maskImage.startsWith('url('),
    }));
    const slider = page.getByRole('slider');
    await slider.focus();
    await page.keyboard.press('End');
    const keyboard = await slider.getAttribute('aria-valuenow') === '4';
    await page.keyboard.press('Home');
    const box = await slider.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + 50);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + 218, {steps:24});
    const dragging = await slider.getAttribute('aria-valuenow') === '4';
    const clothMoved = await page.locator('.belt-wrap').evaluate(el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42) > .1);
    await page.mouse.up();
    await page.waitForTimeout(1100);
    const clothReturned = await page.locator('.belt-wrap').evaluate(el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42) < .5);
    await page.locator('[data-step="0"]').click();
    await page.locator('#play-technique').click();
    await page.waitForFunction(() => document.querySelector('[data-step="3"]').getAttribute('aria-pressed') === 'true', null, {timeout:12000});
    const technique = await page.locator('[data-step="3"]').getAttribute('aria-pressed') === 'true';
    if (url.includes('vscode-livepreview')) {
      await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
      await page.setViewportSize({width:390,height:844});
      await page.getByRole('button',{name:'Menu',exact:true}).click();
      const menu = await page.locator('#mobile-menu').evaluate(el=>el.open);
      await page.keyboard.press('Escape');
      results.push({url, mobileMenu:menu});
    }
    results.push({url, assets, keyboard, dragging, clothMoved, clothReturned, technique, errors, failed});
    page.off('pageerror', onError);
    page.off('response', onResponse);
  }
  return results;
}
