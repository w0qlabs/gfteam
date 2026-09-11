async (page) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:3000/index.html?vscode-livepreview=true');
  await page.locator('[data-step="0"]').click();
  const before = await page.locator('#fighter-a .head').getAttribute('cx');
  await page.locator('#play-technique').click();
  await page.waitForTimeout(1500);
  const during = await page.locator('#fighter-a .head').getAttribute('cx');
  await page.waitForFunction(() => document.querySelector('#play-technique').textContent.includes('Ver outra'), null, {timeout:12000});
  return {
    url:page.url(),
    animated:before !== during,
    before,during,
    completed:await page.locator('[data-step="3"]').getAttribute('aria-pressed') === 'true',
    caption:await page.locator('#technique-caption').innerText(),
  };
}
