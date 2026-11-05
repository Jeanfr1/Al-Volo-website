// Scrolls at a natural pace with the wheel (motion on) and saves a contact sheet of frames.
// usage: node scripts/filmstrip.mjs [WxH] [frames]
import { launch, BASE } from './browser.mjs';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [w, h] = (process.argv[2] || '1440x790').split('x').map(Number);
const frames = Number(process.argv[3] || 24);
const dir = new URL('../studio/filmstrip/', import.meta.url).pathname; mkdirSync(dir, { recursive: true });
const b = await launch(); const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto(BASE, { waitUntil: 'networkidle' });
const total = await p.evaluate(() => document.body.scrollHeight - innerHeight);
const step = total / (frames - 4);
for (let i = 0; i < frames; i++) {
  await p.screenshot({ path: `${dir}/f${String(i).padStart(2, '0')}.png` });
  if (i >= 2) for (let k = 0; k < 6; k++) { await p.mouse.wheel(0, step / 6); await p.waitForTimeout(45); }
  else await p.waitForTimeout(450);
  await p.waitForTimeout(220);
}
await b.close();
execFileSync('python3', ['-c', `
import glob
from PIL import Image
fs=sorted(glob.glob('${dir}/f*.png')); ims=[Image.open(f).convert('RGB') for f in fs]
tw=480; th=round(ims[0].height*tw/ims[0].width); cols=4; rows=-(-len(ims)//cols)
sheet=Image.new('RGB',(cols*(tw+8),rows*(th+8)),'white')
for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),((i%cols)*(tw+8),(i//cols)*(th+8)))
sheet.save('${dir}/sheet.png')`]);
console.log('sheet', `${dir}sheet.png`);
