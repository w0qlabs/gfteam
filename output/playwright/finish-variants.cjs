async (page) => {
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4173/');
  const variants=[];
  for(let i=0;i<6;i++) {
    await page.locator('#play-technique').click();
    const id=await page.locator('#grappling').getAttribute('data-finish');
    const before=await page.locator('#fighter-a .head').getAttribute('cx');
    await page.waitForTimeout(1500);
    const animated=before!==await page.locator('#fighter-a .head').getAttribute('cx');
    await page.waitForFunction(()=>document.querySelector('#play-technique').textContent.includes('Ver outra'),null,{timeout:12000});
    const caption=await page.locator('#technique-caption').innerText();
    variants.push({id,animated,caption});
    await page.locator('.technique-sticky').screenshot({path:`output/playwright/finish-${id}.png`});
  }
  const layouts=[];
  for(const width of [1440,390,320]) {
    await page.setViewportSize({width,height:900});
    await page.locator('#contato').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
    await page.screenshot({path:`output/playwright/footer-updated-${width}.png`});
    layouts.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,logoSize:getComputedStyle(document.querySelector('.footer-word')).fontSize,icons:[...document.querySelectorAll('[aria-label="Redes sociais"] .ph')].map(el=>({class:el.className,mask:getComputedStyle(el).maskImage.startsWith('url(')}))})));
    if(width===390)await page.locator('.technique-sticky').screenshot({path:'output/playwright/finish-mobile.png'});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  const first=await page.locator('#grappling').getAttribute('data-finish');
  await page.locator('[data-step="3"]').click();
  await page.locator('#play-technique').click();
  const reduced={newFinish:await page.locator('#grappling').getAttribute('data-finish')!==first,reset:await page.locator('[data-step="0"]').getAttribute('aria-pressed')==='true'};
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('http://127.0.0.1:3000/index.html?vscode-livepreview=true');
  await page.locator('#play-technique').click();
  await page.waitForFunction(()=>document.querySelector('#play-technique').textContent.includes('Ver outra'),null,{timeout:12000});
  const livePreview=await page.locator('[data-step="3"]').getAttribute('aria-pressed')==='true';
  return {variants,allThree:new Set(variants.map(v=>v.id)).size===3,noConsecutiveRepeat:variants.every((v,i)=>!i||v.id!==variants[i-1].id),layouts,reduced,livePreview,errors};
}
