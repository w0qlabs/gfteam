import sharp from 'sharp';

const phase = process.argv[2] || 'before';
const variants = ['armbar', 'triangle', 'rear-choke'];
const times = phase === 'before' ? [0, 1, 2, 2.5, 3, 3.5, 4, 4.5, 5] : null;
for (const id of variants) {
  const files = times ? times.map(t => `${phase}-${id}-${t}.png`) : (await import('node:fs/promises')).readdir('output/playwright').then(names => names.filter(n => n.startsWith(`${phase}-${id}-`) && n.endsWith('.png')).sort());
  const list = await files;
  const panels = await Promise.all(list.map(async (file, i) => ({
    input: await sharp(`output/playwright/${file}`).resize(420, 300, {fit: 'contain', background: '#e5e9e0'}).png().toBuffer(),
    left: (i % 3) * 420, top: Math.floor(i / 3) * 330 + 30,
  })));
  const labels = list.map((file, i) => `<text x="${i % 3 * 420 + 12}" y="${Math.floor(i / 3) * 330 + 22}" font-size="16">${file}</text>`).join('');
  const height = Math.ceil(list.length / 3) * 330;
  await sharp({create: {width:1260,height,channels:3,background:'#e5e9e0'}}).composite([...panels, {input:Buffer.from(`<svg width="1260" height="${height}">${labels}</svg>`),left:0,top:0}]).png().toFile(`output/playwright/sheet-${phase}-${id}.png`);
}
