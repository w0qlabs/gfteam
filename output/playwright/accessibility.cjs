async (page) => {
  const results = [];
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('http://127.0.0.1:4173/');
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    await page.waitForTimeout(1000);
    const result=await page.evaluate(async()=>{
      const {violations}=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});
      return violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
    });
    results.push({width,violations:result});
  }
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await page.getByRole('slider').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
  const b=await page.getByRole('slider').boundingBox();
  const x=b.x+b.width/2,y=b.y+45;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  const ranks=[];
  for(let i=1;i<=4;i++) {
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+i*42}]});
    await page.waitForTimeout(60);
    ranks.push(await page.getByRole('slider').getAttribute('aria-valuenow'));
  }
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  results.push({touchRanks:ranks,pass:JSON.stringify(ranks)===JSON.stringify(['1','2','3','4'])});
  await client.send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await client.detach();
  return results;
}
