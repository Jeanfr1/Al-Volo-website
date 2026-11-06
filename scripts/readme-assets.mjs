// README assets from the running site (npm run dev in another terminal):
//   .github/assets/banner.png · hero-scroll.gif · desktop-sections.jpg · mobile-screens.jpg
// The GIF: the intro is filmed with GSAP's global clock slowed to 0.3x (so screenshot latency
// barely moves it), then the page is scrolled position by position and each frame is taken
// 350 ms after the scroll, while the scrubbed scenes are still catching up.
// usage: node scripts/readme-assets.mjs [banner|gif|desktop|mobile ...]
import { launch, BASE } from './browser.mjs';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url).pathname;
const OUT = ROOT + '.github/assets/';
const TMP = ROOT + 'studio/readme/';
const SCENES = ['home', 'speisekarte', 'konzept', 'unser-konzept', 'ueber-uns', 'passione', 'erleben', 'mittagstisch', 'impressionen', 'bewertungen', 'reservieren', 'kontakt'];
const want = process.argv.slice(2).length ? process.argv.slice(2) : ['banner', 'gif', 'desktop', 'mobile'];
mkdirSync(OUT, { recursive: true });
const browser = await launch();
const py = code => execFileSync('python3', ['-c', code], { stdio: 'inherit' });
const settle = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const scrollTo = (p, y) => p.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
const centreOf = (p, id) => p.evaluate(id => {
  const el = document.getElementById(id), r = el.getBoundingClientRect();
  const y = scrollY + r.top + r.height / 2 - innerHeight / 2;
  return Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
}, id);

async function stills(width, height, dir, ids, align) {
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; }));
  await p.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  for (const [i, id] of ids.entries()) {
    const y = align === 'top' ? await p.evaluate(id => Math.max(0, document.getElementById(id).getBoundingClientRect().top + scrollY - 8), id) : await centreOf(p, id);
    await scrollTo(p, id === 'home' ? 0 : y); await p.waitForTimeout(350); await settle(p);
    await p.screenshot({ path: `${dir}/${String(i).padStart(2, '0')}-${id}.png` });
  }
  await ctx.close();
}

if (want.includes('banner')) {
  const p = await browser.newPage({ viewport: { width: 1600, height: 520 } });
  await p.goto(BASE + 'robots.txt'); // same origin, so the self-hosted fonts load
  await p.setContent(`<!doctype html><base href="${BASE}"><style>
    @font-face{font-family:Caprasimo;src:url(fonts/Caprasimo-Regular.woff)}
    @font-face{font-family:'DM Sans';src:url(fonts/DMSans-SemiBold.woff);font-weight:600}
    *{margin:0;box-sizing:border-box}
    body{width:1600px;height:520px;overflow:hidden;position:relative;font-family:'DM Sans';color:#F4E7CF;
      background:radial-gradient(120% 140% at 0% 0%,#C41E3A 0%,#8E1123 58%,#5E0B17 100%)}
    .seal{position:absolute;left:96px;top:78px;width:150px;height:150px;border-radius:50%;background:#F4E7CF;box-shadow:0 14px 40px #0006}
    .seal img{width:100%}
    h1{position:absolute;left:92px;top:250px;font:400 104px/1 Caprasimo;letter-spacing:.5px}
    p{position:absolute;left:98px;top:376px;font:600 30px/1.3 'DM Sans';opacity:.92}
    small{position:absolute;left:98px;top:430px;font:600 18px/1 'DM Sans';letter-spacing:3px;text-transform:uppercase;opacity:.7}
    .photo{position:absolute;right:150px;top:-70px;width:560px;height:560px;border-radius:50%;overflow:hidden;border:8px solid #F4E7CF;box-shadow:0 30px 80px #0007}
    .photo img{width:100%;height:100%;object-fit:cover;object-position:42% 30%}
    .food{position:absolute;right:560px;top:250px;width:330px;height:330px;border-radius:50%;overflow:hidden;border:7px solid #F4E7CF;box-shadow:0 24px 60px #0008}
    .food img{width:100%;height:100%;object-fit:cover;object-position:50% 50%}
  </style>
  <div class="seal"><img src="brand/seal-320.webp"></div>
  <h1>Al Volo</h1><p>Hier schmeckt das Leben.</p><small>Pizzeria · Hamburg</small>
  <div class="photo"><img src="photos/alvolo-2.webp"></div><div class="food"><img src="photos/alvolo-6.webp"></div>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: OUT + 'banner.png' });
  await p.close();
  console.log('banner.png');
}

if (want.includes('gif')) {
  const dir = TMP + 'gif/'; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let n = 0;
  const shot = async (hold = 1) => { const buf = await p.screenshot(); for (let k = 0; k < hold; k++) writeFileSync(`${dir}f_${String(++n).padStart(4, '0')}.png`, buf); };
  await p.addInitScript(() => { const t = setInterval(() => { if (window.gsap) { gsap.globalTimeline.timeScale(0.3); clearInterval(t); } }, 5); });
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.gsap && window.ScrollTrigger && document.querySelector('.header .seal').style.transform, null, { polling: 'raf' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  // the intro runs about 3.3 s: 14 frames, about 0.24 s of animation apart
  for (let k = 0; k < 14; k++) { await shot(k === 0 ? 3 : 1); await p.waitForTimeout(720); }
  await p.evaluate(() => { gsap.globalTimeline.timeScale(1); }); await p.waitForTimeout(400); await shot(8);
  const end = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const steps = 40;
  for (let k = 1; k <= steps; k++) { await scrollTo(p, Math.round(end * k / steps)); await p.waitForTimeout(350); await settle(p); await shot(k === steps ? 12 : 1); }
  await p.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '9', '-i', `${dir}f_%04d.png`, '-vf',
    'fps=9,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
    '-loop', '0', OUT + 'hero-scroll.gif']);
  console.log('hero-scroll.gif', n, 'frames');
}

if (want.includes('desktop')) {
  await stills(1440, 900, TMP + 'desktop/', SCENES, 'centre');
  py(`
import glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob('${TMP}desktop/*.png')); W=900; bar=40; gap=36; pad=48
def frame(path):
    im=Image.open(path).convert('RGB'); im=im.resize((W,round(im.height*W/im.width)),Image.LANCZOS)
    f=Image.new('RGB',(W,im.height+bar),'#ECE6DC'); d=ImageDraw.Draw(f)
    for i,c in enumerate(('#E5534B','#E9B23F','#4CB05A')): d.ellipse((16+i*20,14,28+i*20,26),fill=c)
    d.rounded_rectangle((W//2-170,9,W//2+170,31),radius=11,fill='#FFFFFF')
    f.paste(im,(0,bar)); m=Image.new('L',f.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,f.width-1,f.height-1),radius=12,fill=255)
    out=Image.new('RGB',f.size,'#F4E7CF'); out.paste(f,(0,0),m); return out
fr=[frame(f) for f in fs]; h=fr[0].height
rows=(len(fr)+1)//2
sheet=Image.new('RGB',(pad*2+W*2+gap,pad*2+h*rows+gap*(rows-1)),'#F4E7CF')
for i,im in enumerate(fr): sheet.paste(im,(pad+(i%2)*(W+gap),pad+(i//2)*(h+gap)))
sheet.save('${OUT}desktop-sections.jpg',quality=84,optimize=True,progressive=True); print('desktop-sections.jpg',sheet.size)`);
}

if (want.includes('mobile')) {
  await stills(390, 844, TMP + 'mobile/', ['home', 'speisekarte', 'passione', 'erleben', 'kontakt'], 'top');
  py(`
import glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob('${TMP}mobile/*.png')); b=14; r=46; gap=40; pad=56
def phone(path):
    sc=Image.open(path).convert('RGB'); w,h=sc.size
    ph=Image.new('RGBA',(w+2*b,h+2*b),(0,0,0,0)); d=ImageDraw.Draw(ph)
    d.rounded_rectangle((0,0,ph.width-1,ph.height-1),radius=r+b,fill='#161214')
    m=Image.new('L',sc.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=r,fill=255)
    ph.paste(sc,(b,b),m); d.rounded_rectangle((w//2+b-52,b+10,w//2+b+52,b+36),radius=13,fill='#161214'); return ph
ps=[phone(f) for f in fs]; pw,phh=ps[0].size
sheet=Image.new('RGB',(pad*2+pw*len(ps)+gap*(len(ps)-1),pad*2+phh),'#F4E7CF')
for i,im in enumerate(ps): sheet.paste(im,(pad+i*(pw+gap),pad),im)
sheet.save('${OUT}mobile-screens.jpg',quality=86,optimize=True,progressive=True); print('mobile-screens.jpg',sheet.size)`);
}
await browser.close();
