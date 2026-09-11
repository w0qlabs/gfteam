async (page) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:3000/index.html?vscode-livepreview=true');
  const handle = page.locator('.belt-handle');
  const value = () => handle.getAttribute('aria-valuenow');
  const pull = async (distance) => {
    const box = await handle.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + distance, { steps: 10 });
    await page.mouse.up();
  };
  const results = {};
  await pull(-90);
  results.upwardIgnored = await value() === '0';
  await pull(20);
  results.shortPullIgnored = await value() === '0';
  const sequence = [];
  for (let i = 0; i < 5; i++) {
    await pull(160);
    sequence.push(await value());
  }
  results.sequence = sequence;
  results.oneRankPerPullAndWrap = sequence.join(',') === '1,2,3,4,0';
  await handle.press('End');
  await handle.press('ArrowDown');
  results.keyboardWrap = await value() === '0';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await pull(70);
  results.reducedMotion = await value() === '1';
  const cdp = await page.context().newCDPSession(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 80 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  results.touchAdvances = await value() === '2';
  await cdp.detach();
  return results;
}
