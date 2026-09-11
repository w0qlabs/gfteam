async (page) => {
  const checks = [];
  for (const [name,width,height] of [['desktop',1440,1000],['laptop',1280,900],['tablet',768,1024],['mobile',390,844],['small-mobile',320,800]]) {
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(img=>img.loading='eager');await Promise.all([...document.images].map(img=>img.decode()));});
    await page.waitForTimeout(1200);
    await page.screenshot({path:`output/playwright/${name}-full.png`,fullPage:true});
    if (width <= 390) {
      for (let rank=0;rank<5;rank++) {
        await page.locator(`[data-rank="${rank}"]`).click();
        const gap=await page.evaluate(()=>document.querySelector('.belt-caption').getBoundingClientRect().top-document.querySelector('.pull-hint').getBoundingClientRect().bottom);
        checks.push({name:`${width}px rank ${rank}: hint separated`,pass:gap>0,gap});
      }
      await page.waitForTimeout(350);
      await page.locator('.belt-bay').screenshot({path:`output/playwright/${name}-belt.png`});
    }
    await page.locator('#contato').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.screenshot({path:`output/playwright/${name}-contato.png`});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4173/');
  const stages=[];
  for (const index of [0,1,2,3]) {
    await page.locator(`[data-principle="${index}"]`).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
    await page.waitForTimeout(550);
    stages.push(await page.locator('#technique-step').innerText());
  }
  checks.push({name:'scroll-driven technique progresses',pass:stages[0]!==stages[3]&&stages[3]==='04',stages});
  // Intercept the new-tab destination; never send a message or submit a form.
  await page.context().route('https://wa.me/**', route=>route.fulfill({status:200,body:'Destination verified'}));
  const popupPromise=page.waitForEvent('popup');
  await page.locator('#contato [data-whatsapp]').first().click();
  const popup=await popupPromise;
  await popup.waitForLoadState();
  checks.push({name:'CTA opens correct WhatsApp destination in a new tab',pass:popup.url().startsWith('https://wa.me/5514996924473?text=')});
  await popup.close();
  await page.context().unroute('https://wa.me/**');
  return checks;
}
