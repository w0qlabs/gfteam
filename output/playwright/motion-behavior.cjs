async (page) => {
  const checks = [], errors = [];
  const check = (name, ok) => { checks.push({name, ok}); if (!ok) throw new Error(name); };
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({width:1440, height:1000});
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-step="0"]').click();
  const seen = new Set(), played = [];
  for (let i = 0; seen.size < 3 && i < 6; i++) {
    await page.locator('#play-technique').click();
    await page.waitForTimeout(600);
    const id = await page.locator('#grappling').getAttribute('data-finish');
    await page.locator('#play-technique').click();
    const head = await page.locator('#fighter-a .head').getAttribute('cx');
    await page.waitForTimeout(250);
    check(`${id}: pause freezes geometry`, head === await page.locator('#fighter-a .head').getAttribute('cx'));
    check(`${id}: pause offers continuation`, (await page.locator('#play-technique').innerText()).includes('Continuar'));
    await page.locator('#play-technique').click();
    check(`${id}: resume keeps technique`, id === await page.locator('#grappling').getAttribute('data-finish'));
    await page.waitForFunction(() => document.querySelector('#play-technique').textContent.includes('Ver outra'), null, {timeout:14000});
    check(`${id}: real playback completes`, await page.locator('[data-step="3"]').getAttribute('aria-pressed') === 'true');
    check(`${id}: actual joint movement`, head !== await page.locator('#fighter-a .head').getAttribute('cx'));
    seen.add(id); played.push(id);
  }
  check('All three finishes play', seen.size === 3);
  check('No consecutive repeats', played.every((id,i) => !i || id !== played[i-1]));
  for (const step of [0, 2, 1, 3]) {
    await page.locator(`[data-step="${step}"]`).focus();
    await page.keyboard.press('Enter');
    check(`Keyboard stage ${step}`, await page.locator(`[data-step="${step}"]`).getAttribute('aria-pressed') === 'true');
  }
  await page.locator('[data-step="1"]').click();
  await page.setViewportSize({width:768, height:1000});
  await page.waitForTimeout(450);
  check('Resize preserves manual selection', await page.locator('[data-step="1"]').getAttribute('aria-pressed') === 'true');
  await page.evaluate(() => document.querySelector('.principles').scrollIntoView({behavior:'instant'}));
  await page.waitForTimeout(450);
  check('Programmatic scroll preserves manual selection', await page.locator('[data-step="1"]').getAttribute('aria-pressed') === 'true');
  await page.mouse.wheel(0, 1900);
  await page.waitForTimeout(650);
  check('Intentional scroll reaches final pose', await page.locator('[data-step="3"]').getAttribute('aria-pressed') === 'true');
  await page.mouse.wheel(0, -1500);
  await page.waitForTimeout(650);
  check('Reverse scroll reverses sequence', await page.locator('[data-step="3"]').getAttribute('aria-pressed') !== 'true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  const reducedSeen = new Set();
  for (let i = 0; reducedSeen.size < 3 && i < 6; i++) {
    const id = await page.locator('#grappling').getAttribute('data-finish');
    reducedSeen.add(id);
    await page.locator('[data-step="0"]').click();
    for (let step = 1; step <= 3; step++) {
      await page.locator('#play-technique').click();
      check(`${id}: reduced step ${step}`, await page.locator(`[data-step="${step}"]`).getAttribute('aria-pressed') === 'true');
    }
    const head = await page.locator('#fighter-a .head').getAttribute('cx');
    await page.waitForTimeout(200);
    check(`${id}: reduced pose is static`, head === await page.locator('#fighter-a .head').getAttribute('cx'));
    await page.locator('#play-technique').click();
    check(`${id}: reduced replay resets`, await page.locator('[data-step="0"]').getAttribute('aria-pressed') === 'true');
    check(`${id}: reduced replay changes finish`, id !== await page.locator('#grappling').getAttribute('data-finish'));
  }
  check('Reduced motion retains all three finishes', reducedSeen.size === 3);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('#play-technique').click();
  await page.waitForTimeout(700);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(() => !document.querySelector('#play-technique').textContent.includes('Pausar'));
  const stopped = await page.locator('#fighter-a .head').getAttribute('cx');
  await page.waitForTimeout(300);
  check('Changing motion preference stops playback', stopped === await page.locator('#fighter-a .head').getAttribute('cx'));
  const touch = await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const mobile = await touch.newPage();
  await mobile.goto('http://127.0.0.1:4173/');
  await mobile.locator('[data-step="2"]').tap();
  check('Touch stage selection', await mobile.locator('[data-step="2"]').getAttribute('aria-pressed') === 'true');
  await mobile.locator('#play-technique').tap();
  check('Touch advances to final', await mobile.locator('[data-step="3"]').getAttribute('aria-pressed') === 'true');
  await touch.close();
  check('No browser errors', errors.length === 0);
  return {played, checks, errors};
}
