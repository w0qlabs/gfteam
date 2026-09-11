async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const results = [];
  const check = (name, pass, detail) => { results.push({ name, pass: Boolean(pass), detail }); };
  for (const [name, width, height] of [['desktop',1440,1000],['laptop',1280,900],['tablet',768,1024],['mobile',390,844],['small-mobile',320,800]]) {
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach(img => img.loading = 'eager');
      await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    });
    await page.waitForTimeout(1300);
    const layout = await page.evaluate(() => ({
      width:innerWidth, scrollWidth:document.documentElement.scrollWidth,
      images:[...document.images].every(image => image.complete && image.naturalWidth > 0),
      title:getComputedStyle(document.querySelector('h1')).fontSize,
      overflow:[...document.querySelectorAll('main *')].filter(el => { const r=el.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth+1); }).map(el=>el.className).slice(0,12)
    }));
    check(`${name}: no horizontal overflow`, layout.width === layout.scrollWidth, layout);
    check(`${name}: all images loaded`, layout.images);
    await page.screenshot({path:`output/playwright/${name}-hero.png`});
    await page.screenshot({path:`output/playwright/${name}-full.png`,fullPage:true});
    if (name === 'desktop' || name === 'mobile') {
      for (const selector of ['#professores','#academia','#filosofia','#treinos','#contato']) {
        await page.locator(selector).evaluate(el => el.scrollIntoView({behavior:'instant',block:'start'}));
        await page.waitForTimeout(550);
        await page.screenshot({path:`output/playwright/${name}-${selector.slice(1)}.png`});
      }
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForTimeout(1000);
  const handle=page.getByRole('slider');
  await handle.focus();
  await page.keyboard.press('Home');
  for(let i=0;i<5;i++) {
    if(i) await page.keyboard.press('ArrowDown');
    check(`keyboard rank ${i}`,await handle.getAttribute('aria-valuenow') === String(i));
  }
  await page.keyboard.press('Home');
  const box=await handle.boundingBox();
  const x=box.x+box.width/2, y=box.y+70;
  await page.mouse.move(x,y);
  await page.mouse.down();
  for(let i=1;i<5;i++) {
    await page.mouse.move(x,y+i*42,{steps:8});
    check(`drag rank ${i}`, await handle.getAttribute('aria-valuenow')===String(i));
  }
  await page.mouse.up();
  await page.waitForTimeout(1000);
  check('belt springs back', await page.locator('.belt-wrap').evaluate(el=>Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)<.5));
  await page.screenshot({path:'output/playwright/desktop-belt-black.png'});
  await page.getByRole('button',{name:'Faixa branca',exact:true}).click();
  check('rank selection resets',await handle.getAttribute('aria-valuenow')==='0');
  for(let i=0;i<4;i++) {
    await page.locator(`[data-step="${i}"]`).click();
    await page.waitForTimeout(450);
    check(`technique stage ${i}`,await page.locator(`[data-step="${i}"]`).getAttribute('aria-pressed')==='true');
    await page.locator('.technique-sticky').screenshot({path:`output/playwright/technique-${i}.png`});
  }
  await page.locator('#play-technique').click();
  await page.waitForTimeout(5400);
  check('technique replay finishes',await page.locator('[data-step="3"]').getAttribute('aria-pressed')==='true');
  await page.locator('.faq summary').first().click();
  check('FAQ opens',await page.locator('.faq details').first().getAttribute('open') !== null);
  check('WhatsApp links preserve contact',await page.locator('[data-whatsapp]').evaluateAll(links=>links.every(link=>link.href.startsWith('https://wa.me/5514996924473?text='))));
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  check('mobile menu opens',await page.locator('#mobile-menu').evaluate(el=>el.open));
  await page.screenshot({path:'output/playwright/mobile-menu.png'});
  await page.keyboard.press('Escape');
  check('Escape restores menu focus',await page.locator('.menu-toggle').evaluate(el=>el===document.activeElement));
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.getByRole('navigation',{name:'Navegação mobile'}).getByRole('link',{name:'Professores',exact:true}).click();
  await page.waitForTimeout(900);
  check('menu navigation closes dialog',!(await page.locator('#mobile-menu').evaluate(el=>el.open)));
  check('menu navigates to professors',page.url().endsWith('#professores'));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('slider').focus();
  await page.keyboard.press('End');
  check('reduced-motion belt works',await page.getByRole('slider').getAttribute('aria-valuenow')==='4');
  await page.locator('#play-technique').click();
  check('reduced-motion technique advances without autoplay',await page.locator('[data-step="1"]').getAttribute('aria-pressed')==='true');
  await page.screenshot({path:'output/playwright/mobile-reduced-motion.png'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  check('no page errors',errors.length===0,errors);
  return results;
}
