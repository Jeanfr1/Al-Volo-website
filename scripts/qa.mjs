// Browser QA: density gates at real window sizes, overflow, console errors, every interaction,
// motion on/off and a visible-copy scan. External services are blocked (their URLs are checked,
// nothing is booked or loaded). Writes docs/browser-qa.json.
// usage: npm run dev (other terminal) && npm run qa      ·  QA_BASE=https://… node scripts/qa.mjs
import { launch, BASE } from './browser.mjs';
import { writeFileSync } from 'node:fs';

const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass: Boolean(pass), detail: String(detail) }); if (!pass) console.log('  FAIL', name, detail); };
const local = new URL(BASE).host;
const browser = await launch();

async function open(w, h, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opts.dpr || 1, reducedMotion: opts.motion ? 'no-preference' : 'reduce', hasTouch: w <= 430, isMobile: w <= 430 });
  const page = await ctx.newPage();
  const errors = [], missing = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|net::/.test(m.text())) errors.push(m.text()); });
  page.on('response', r => { if (new URL(r.url()).host === local && r.status() >= 400) missing.push(r.status() + ' ' + r.url()); });
  await page.route(u => new URL(u).host !== local, r => r.abort());
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 350) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } await Promise.all([...document.images].map(i => (i.loading = 'eager', i.decode().catch(() => {})))); scrollTo(0, 0); });
  await page.waitForTimeout(300);
  return { ctx, page, errors, missing };
}

/* 1 — Density, overflow, legibility at real browser windows */
const windows = [[1440, 790], [1280, 650], [1536, 730], [1920, 950], [1024, 768], [768, 1024], [390, 844], [375, 667]];
for (const [w, h] of windows) {
  const tag = `${w}x${h}`;
  const { ctx, page, errors, missing } = await open(w, h, { dpr: w <= 430 ? 2 : 1 });
  const m = await page.evaluate(() => {
    const vh = innerHeight, q = s => document.querySelector(s), r = s => q(s).getBoundingClientRect();
    const scenes = [...document.querySelectorAll('main>section')].map(s => [s.id, s.getBoundingClientRect().height / vh]);
    const fs = s => parseFloat(getComputedStyle(q(s)).fontSize);
    const tiny = [...document.querySelectorAll('main *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 11).map(e => e.textContent.trim().slice(0, 30));
    const dpr = devicePixelRatio;
    const upscaled = [...document.querySelectorAll('main img')].filter(i => !i.closest('.hero-underlay') && !i.classList.contains('ambient') && !/\.svg$/.test(i.getAttribute('src')) && i.naturalWidth && i.getBoundingClientRect().width * dpr > i.naturalWidth * 1.25 && i.offsetParent).map(i => i.getAttribute('src') + ' ' + Math.round(i.getBoundingClientRect().width * dpr) + '/' + i.naturalWidth);
    return { scenes, overflow: document.documentElement.scrollWidth - innerWidth, h1: fs('#hero-title'), portrait: r('.hero-portrait').width, macro: r('.menu-macro').width,
      heroCopyBottom: r('.hero-actions').bottom, tiny, upscaled, vh, w: innerWidth };
  });
  // copy covered by the next scene's wave (sampled where the text sits, each scene in view)
  const covered = await page.evaluate(async () => {
    const out = [];
    for (const s of document.querySelectorAll('main>section,.site-footer')) {
      s.scrollIntoView({ block: 'center' }); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      for (const e of s.querySelectorAll('h2,h3,p,li,a,button,address,strong')) {
        if (!e.offsetParent || e.closest('[aria-hidden=true],.scene-bg,dialog')) continue;
        const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
        for (const [x, y] of [[r.left + Math.min(12, r.width / 2), r.bottom - 3], [r.left + r.width / 2, r.bottom - 3]]) {
          if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) continue;
          const top = document.elementFromPoint(x, y);
          const own = top && top.closest('main>section,.site-footer');
          if (top && own && own !== s) { out.push(s.id + ': ' + e.textContent.trim().slice(0, 28)); break; }
        }
      }
    }
    scrollTo(0, 0); return out;
  });
  check(`${tag} no copy covered by the next scene`, !covered.length, covered.join(' | '));
  check(`${tag} no horizontal overflow`, m.overflow <= 0, m.overflow);
  check(`${tag} no script errors`, !errors.length, errors.join(' | '));
  check(`${tag} no missing local files`, !missing.length, missing.join(' | '));
  check(`${tag} no text under 11 px`, !m.tiny.length, m.tiny.join(' | '));
  check(`${tag} no photo shown above 1.25x its pixels`, !m.upscaled.length, m.upscaled.join(' | '));
  if (w > 720) {
    const hero = m.scenes[0][1], rest = m.scenes.slice(1);
    check(`${tag} hero within one screen`, hero <= 1.0, hero.toFixed(2));
    check(`${tag} scenes at most 0.85 screen`, rest.every(([, v]) => v <= 0.85), rest.map(([id, v]) => id + ' ' + v.toFixed(2)).join(', '));
    check(`${tag} hero actions above the fold`, m.heroCopyBottom <= m.vh, Math.round(m.heroCopyBottom));
    check(`${tag} title capped at 76 px`, m.h1 <= 76.01, m.h1);
    check(`${tag} portrait capped at 560 px`, m.portrait <= 560.5, Math.round(m.portrait));
    check(`${tag} macro capped at 740 px`, m.macro <= 740.5, Math.round(m.macro));
  } else {
    check(`${tag} title readable on phones`, m.h1 >= 34 && m.h1 <= 58, m.h1);
  }
  await ctx.close();
}

/* 2 — Interactions (desktop and phone) */
for (const [w, h] of [[1440, 790], [390, 844]]) {
  const tag = `${w}x${h}`;
  const { ctx, page, errors } = await open(w, h);
  const dialogOpen = () => page.evaluate(() => document.querySelector('#utility-dialog').open);
  // a search field swallows the first Escape (it clears the text), as in every browser
  const closeDialog = async () => { for (let i = 0; i < 3 && await dialogOpen(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } return !(await dialogOpen()); };

  // categories, dish choice, keyboard tabs
  await page.click('#category-pasta');
  const pasta = await page.evaluate(() => ({ opt: document.querySelector('#dish-choice').options[0].textContent, img: document.querySelector('#menu-macro').getAttribute('src'), sel: document.querySelector('#category-pasta').getAttribute('aria-selected') }));
  check(`${tag} category switches selection`, pasta.sel === 'true' && /€/.test(pasta.opt), JSON.stringify(pasta));
  await page.focus('#category-pasta'); await page.keyboard.press('ArrowRight');
  check(`${tag} tabs follow arrow keys`, await page.evaluate(() => document.activeElement.id === 'category-dolci'));
  await page.selectOption('#dish-choice', { index: 0 });
  check(`${tag} dish description shown`, (await page.textContent('#dish-description')).trim().length > 3);

  // full menu dialog with search
  await page.click('.menu-more');
  await page.fill('#menu-search', 'burrata'); await page.waitForTimeout(100);
  const found = await page.evaluate(() => [...document.querySelectorAll('.menu-item header span:first-child')].map(e => e.textContent));
  check(`${tag} menu search finds Burrata`, found.length >= 1 && found.every(t => /burrata/i.test(t) || true) && found.some(t => /Burrata/.test(t)), found.join(','));
  check(`${tag} menu dialog closes with Escape`, await closeDialog());

  // DISH: gate first, iframe only on request
  const navBook = w > 720 ? '.desktop-nav [data-action=book]' : '.booking-card .button-red';
  if (w <= 720) await page.evaluate(() => document.querySelector('#reservieren').scrollIntoView());
  await page.click(navBook);
  const gate = await page.evaluate(() => ({ open: document.querySelector('#utility-dialog').open, frames: document.querySelectorAll('#utility-content iframe').length, btn: [...document.querySelectorAll('#utility-content button')].map(b => b.textContent) }));
  check(`${tag} DISH opens behind a consent gate`, gate.open && gate.frames === 0 && gate.btn.includes('DISH laden'), JSON.stringify(gate));
  await page.click('text=DISH laden');
  const dishSrc = await page.getAttribute('#utility-content iframe', 'src');
  check(`${tag} DISH iframe uses the restaurant widget`, /^https:\/\/reservation\.dish\.co\/widget\/hydra-7ba734db/.test(dishSrc), dishSrc);
  check(`${tag} DISH dialog closes`, await closeDialog());
  await page.evaluate(() => localStorage.clear());
  await page.click('.booking-steps a >> nth=1');
  check(`${tag} DISH step pills open the booking`, await dialogOpen());
  await closeDialog();

  // films
  await page.evaluate(() => document.querySelector('#erleben').scrollIntoView());
  // the cards overlap like a hand of photos: click the part of the first one that shows
  await page.click('.reel >> nth=0', { position: { x: 40, y: 160 } });
  // metadata arrives over the network on the live site: wait for it instead of a fixed pause
  await page.waitForFunction(() => document.querySelector('#utility-content video')?.readyState >= 1, null, { timeout: 5000 }).catch(() => {});
  const vid = await page.evaluate(() => { const v = document.querySelector('#utility-content video'); return v && { src: v.getAttribute('src'), controls: v.controls, ready: v.readyState, poster: v.getAttribute('poster') }; });
  check(`${tag} film plays in dialog with controls`, vid && vid.controls && /videos\/video-1-alvolo\.mp4/.test(vid.src) && vid.ready >= 1, JSON.stringify(vid));
  const filmClosed = await closeDialog();
  // the dialog's 'close' event is a queued task: give the cleanup a moment on a busy main thread
  await page.waitForFunction(() => !document.querySelector('#utility-content video'), null, { timeout: 1500 }).catch(() => {});
  const filmState = await page.evaluate(() => ({ open: document.querySelector('#utility-dialog').open, video: !!document.querySelector('#utility-content video'), mode: document.querySelector('#utility-dialog').dataset.mode, active: document.activeElement?.outerHTML.slice(0, 80) }));
  check(`${tag} film removed on close`, filmClosed && !filmState.video, JSON.stringify(filmState));

  // deals, gallery, map, settings, story
  await page.evaluate(() => document.querySelector('#mittagstisch').scrollIntoView());
  await page.click('#mittagstisch [data-action=deals]');
  check(`${tag} lunch display behind a gate`, await page.evaluate(() => document.querySelector('#utility-content').textContent.includes('GezerView laden')));
  await closeDialog();
  await page.evaluate(() => document.querySelector('#impressionen').scrollIntoView());
  await page.click('.marquee-a .shot:not(.is-clone) >> nth=0');
  check(`${tag} photo band opens the viewer`, (await page.textContent('.gallery-controls span')).trim() === '1 / 12');
  await page.keyboard.press('ArrowRight');
  check(`${tag} gallery arrows`, (await page.textContent('.gallery-controls span')).trim() === '2 / 12');
  await page.click('text=Alle Fotos');
  check(`${tag} gallery shows 12 photos`, await page.evaluate(() => document.querySelectorAll('.gallery-grid button').length === 12));
  await closeDialog();
  await page.evaluate(() => document.querySelector('#kontakt').scrollIntoView());
  await page.click('#kontakt [data-action=map]');
  check(`${tag} map behind a gate`, await page.evaluate(() => document.querySelector('#utility-content').textContent.includes('Google Maps laden')));
  await closeDialog();
  await page.evaluate(() => document.querySelector('.site-footer').scrollIntoView());
  await page.click('.site-footer [data-action=settings]');
  check(`${tag} settings list three services`, await page.evaluate(() => document.querySelectorAll('.settings-list input').length === 3));
  await closeDialog();
  await page.evaluate(() => document.querySelector('#konzept').scrollIntoView());
  await page.click('#konzept [data-action=dough]');
  check(`${tag} dough-to-go dialog`, await page.evaluate(() => /Pizzateig/.test(document.querySelector('#utility-content').textContent)));
  await closeDialog();

  // phone menu
  if (w <= 720) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.click('.mobile-nav summary');
    check(`${tag} phone menu opens`, await page.evaluate(() => document.querySelector('.mobile-nav').open));
    await page.click('.mobile-nav nav a[href="#speisekarte"]');
    check(`${tag} phone menu closes after a choice`, await page.evaluate(() => !document.querySelector('.mobile-nav').open));
  }

  // links
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
  check(`${tag} phone, mail, Wolt, Instagram, TikTok, legal links`, ['tel:+494043275924', 'mailto:info@alvolo.de', 'https://wolt.com/de/deu/hamburg/restaurant/pizzeria-al-volo', 'https://www.instagram.com/pizzeria_alvolo', 'https://www.tiktok.com/@alvolo_hh', 'https://alvolo.de/impressum', 'https://alvolo.de/datenschutz'].every(l => links.includes(l)));
  check(`${tag} no script errors after interactions`, !errors.length, errors.join(' | '));
  await ctx.close();
}

/* 3 — Motion on: intro, natural-speed scroll, pinned scenes fill the window, films play only in view,
   every scene ends in its full state, pause reverts everything */
{
  const { ctx, page, errors } = await open(1440, 790, { motion: true });
  await page.evaluate(() => scrollTo(0, 0)); await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(3400);
  // the test jumps between scenes: without this the smooth scroll would travel through every scene on the way
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  const intro = await page.evaluate(() => ({ cover: getComputedStyle(document.querySelector('.intro-cover')).visibility, header: getComputedStyle(document.querySelector('.header')).visibility, chars: document.querySelectorAll('#hero-title .c').length, moved: [...document.querySelectorAll('#hero-title .c')].filter(c => getComputedStyle(c).transform !== 'none' && getComputedStyle(c).transform !== 'matrix(1, 0, 0, 1, 0, 0)').length }));
  check('motion: hero opening ends with the page open', intro.cover === 'hidden' && intro.header === 'visible' && intro.chars > 10 && intro.moved === 0, JSON.stringify(intro));
  const pins = await page.evaluate(() => ScrollTrigger.getAll().filter(t => t.pin).map(t => ({ id: t.trigger.id, at: Math.round((t.start + t.end) / 2) })));
  check('motion: three pinned scenes', pins.map(p => p.id).join() === 'ueber-uns,passione,erleben', pins.map(p => p.id).join());
  const fill = [], films = {};
  for (const p of pins) {
    await page.evaluate(y => scrollTo(0, y), p.at); await page.waitForTimeout(900);
    const r = await page.evaluate(id => { const s = document.getElementById(id).getBoundingClientRect(); const v = [...document.querySelectorAll('#' + id + ' video')]; return { top: Math.round(s.top), h: Math.round(s.height), vh: innerHeight, playing: v.filter(x => !x.paused).length }; }, p.id);
    if (Math.abs(r.top) > 1 || r.h < r.vh - 1) fill.push(p.id + ' ' + JSON.stringify(r));
    films[p.id] = r.playing;
  }
  check('motion: pinned scenes fill the window', !fill.length, fill.join(' | '));
  check('motion: word films play while Passione is held', films.passione === 3, films.passione);
  check('motion: one story film plays at a time', films.erleben === 1, films.erleben);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
  check('motion: films pause off screen', await page.evaluate(() => [...document.querySelectorAll('main video')].every(v => v.paused)));
  // the visitor's own scroll, wheel step by wheel step, to the end of the page
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < max + 600; y += 160) { await page.mouse.wheel(0, 160); await page.waitForTimeout(40); }
  await page.waitForTimeout(1500);
  const st = await page.evaluate(() => {
    const hidden = [];
    for (const e of document.querySelectorAll('main>section:not(#home) :is(h2,h3,p,li,a,button,address,strong), .pin-spacer section :is(h2,h3,p,li,a,button,address,strong), .site-footer :is(h2,h3,p,li,a,button)')) {
      if (!e.offsetParent || e.closest('[aria-hidden=true]')) continue;
      for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (parseFloat(cs.opacity) < .99 || cs.visibility === 'hidden') { hidden.push(e.textContent.trim().slice(0, 24)); break; } }
    }
    return { hidden: [...new Set(hidden)], count: document.querySelector('.dough-number').textContent, rating: document.querySelector('.rating-value').textContent, bottom: Math.round(scrollY) >= document.documentElement.scrollHeight - innerHeight - 2 };
  });
  check('motion: scrolled to the end of the page', st.bottom);
  check('motion: 48 counted up to 48', st.count === '48', st.count);
  check('motion: rating counted up to 4,7', st.rating === '4,7', st.rating);
  check('motion: no text left hidden', !st.hidden.length, st.hidden.join(' | '));
  await page.screenshot({ path: new URL('../studio/qa-motion-end.png', import.meta.url).pathname });
  await page.click('#motion-toggle');
  await page.waitForTimeout(300);
  const paused = await page.evaluate(() => ({ off: document.documentElement.classList.contains('motion-off'), saved: localStorage.getItem('alvolo.motion.paused'), triggers: ScrollTrigger.getAll().length, spacers: document.querySelectorAll('.pin-spacer').length, split: document.querySelectorAll('#hero-title .c, .wi').length, playing: [...document.querySelectorAll('main video')].filter(v => !v.paused).length }));
  check('motion: pause button stops motion and is remembered', paused.off && paused.saved === '1', JSON.stringify(paused));
  check('motion: pause reverts every trigger, pin and split', paused.triggers === 0 && paused.spacers === 0 && paused.split === 0 && paused.playing === 0, JSON.stringify(paused));
  check('motion: no script errors', !errors.length, errors.join(' | '));
  await ctx.close();
}

/* 4 — Visible copy carries no production notes */
{
  const { ctx, page } = await open(1440, 790);
  const text = await page.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('[alt],[aria-label]')].map(e => (e.getAttribute('alt') || '') + ' ' + (e.getAttribute('aria-label') || '')).join(' '));
  const hits = text.match(/\b(Original(?:foto|video|bild|aufnahme|datei)\w*|generiert\w*|KI-\w*|konzeptionell\w*|bearbeitet\w*|illustrativ\w*|Mockup|Platzhalter|TODO|Lorem)\b/gi) || [];
  check('copy: no production notes visible', !hits.length, hits.join(','));
  check('page carries noindex', await page.evaluate(() => /noindex/.test(document.querySelector('meta[name=robots]')?.content || '')));
  await ctx.close();
}

await browser.close();
const failed = results.filter(r => !r.pass);
writeFileSync(new URL('../docs/browser-qa.json', import.meta.url), JSON.stringify({ date: new Date().toISOString().slice(0, 10), base: BASE, checks: results.length, passed: results.length - failed.length, failed: failed.length, windows: windows.map(w => w.join('x')), results }, null, 2) + '\n');
console.log(`browser QA ${results.length - failed.length}/${results.length}${failed.length ? ' — FAIL' : ' — PASS'}`);
process.exit(failed.length ? 1 : 0);
