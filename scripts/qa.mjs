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
    const upscaled = [...document.querySelectorAll('main img')].filter(i => !i.closest('.hero-underlay') && !i.classList.contains('ambient') && i.naturalWidth && i.getBoundingClientRect().width * dpr > i.naturalWidth * 1.25 && i.offsetParent).map(i => i.getAttribute('src') + ' ' + Math.round(i.getBoundingClientRect().width * dpr) + '/' + i.naturalWidth);
    return { scenes, overflow: document.documentElement.scrollWidth - innerWidth, h1: fs('#hero-title'), portrait: r('.hero-portrait').width, macro: r('.menu-macro').width,
      heroCopyBottom: r('.hero-actions').bottom, tiny, upscaled, vh, w: innerWidth };
  });
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
  await page.click('.reel >> nth=0');
  // metadata arrives over the network on the live site: wait for it instead of a fixed pause
  await page.waitForFunction(() => document.querySelector('#utility-content video')?.readyState >= 1, null, { timeout: 5000 }).catch(() => {});
  const vid = await page.evaluate(() => { const v = document.querySelector('#utility-content video'); return v && { src: v.getAttribute('src'), controls: v.controls, ready: v.readyState, poster: v.getAttribute('poster') }; });
  check(`${tag} film plays in dialog with controls`, vid && vid.controls && /videos\/video-2-alvolo\.mp4/.test(vid.src) && vid.ready >= 1, JSON.stringify(vid));
  const filmClosed = await closeDialog();
  // the dialog's 'close' event is a queued task: give the cleanup a moment on a busy main thread
  await page.waitForFunction(() => !document.querySelector('#utility-content video'), null, { timeout: 1500 }).catch(() => {});
  const filmState = await page.evaluate(() => ({ open: document.querySelector('#utility-dialog').open, video: !!document.querySelector('#utility-content video'), mode: document.querySelector('#utility-dialog').dataset.mode, active: document.activeElement?.outerHTML.slice(0, 80) }));
  check(`${tag} film removed on close`, filmClosed && !filmState.video, JSON.stringify(filmState));

  // deals, gallery, map, settings, story
  await page.click('.deals-button');
  check(`${tag} lunch display behind a gate`, await page.evaluate(() => document.querySelector('#utility-content').textContent.includes('GezerView laden')));
  await closeDialog();
  await page.evaluate(() => document.querySelector('#pizzeria').scrollIntoView());
  await page.click('.place-actions [data-action=gallery]');
  check(`${tag} gallery shows 12 photos`, await page.evaluate(() => document.querySelectorAll('.gallery-grid button').length === 12));
  await page.click('.gallery-grid button >> nth=0');
  await page.keyboard.press('ArrowRight');
  check(`${tag} gallery arrows`, (await page.textContent('.gallery-controls span')).trim() === '2 / 12');
  await closeDialog();
  await page.evaluate(() => document.querySelector('#kontakt').scrollIntoView());
  await page.click('.footer [data-action=map]');
  check(`${tag} map behind a gate`, await page.evaluate(() => document.querySelector('#utility-content').textContent.includes('Google Maps laden')));
  await closeDialog();
  await page.click('.footer [data-action=settings]');
  check(`${tag} settings list three services`, await page.evaluate(() => document.querySelectorAll('.settings-list input').length === 3));
  await closeDialog();
  await page.evaluate(() => document.querySelector('#konzept').scrollIntoView());
  await page.click('[data-action=story]');
  check(`${tag} concept dialog`, await page.evaluate(() => /48 Stunden/.test(document.querySelector('#utility-content').textContent)));
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

/* 3 — Motion on: every scene enters, ends in its full state; pause works */
{
  const { ctx, page, errors } = await open(1440, 790, { motion: true });
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1600);
  check('motion: hero opening finishes on the portrait', await page.evaluate(() => getComputedStyle(document.querySelector('.hero-portrait')).clipPath === 'none' || !document.querySelector('.hero-portrait').getAnimations().length));
  for (const id of ['speisekarte', 'konzept', 'erleben', 'pizzeria', 'reservieren']) {
    await page.evaluate(id => { const s = document.getElementById(id); scrollTo(0, s.offsetTop - innerHeight * 0.25); }, id);
    await page.waitForTimeout(1900);
  }
  const st = await page.evaluate(() => ({
    inScenes: [...document.querySelectorAll('.is-in')].map(e => e.id),
    count: document.querySelector('.dough-number').textContent,
    hidden: [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity !== '1').length,
    chef: getComputedStyle(document.querySelector('.chef-window')).clipPath,
  }));
  check('motion: all scenes entered', ['speisekarte', 'konzept', 'erleben', 'pizzeria'].every(i => st.inScenes.includes(i)), st.inScenes.join(','));
  check('motion: 48 counted up to 48', st.count === '48', st.count);
  check('motion: no text left hidden', st.hidden === 0, st.hidden);
  await page.screenshot({ path: new URL('../studio/qa-motion-end.png', import.meta.url).pathname });
  await page.click('#motion-toggle');
  const paused = await page.evaluate(() => ({ off: document.documentElement.classList.contains('motion-off'), saved: localStorage.getItem('alvolo.motion.paused') }));
  check('motion: pause button stops motion and is remembered', paused.off && paused.saved === '1', JSON.stringify(paused));
  check('motion: no script errors', !errors.length, errors.join(' | '));
  await ctx.close();
}

/* 4 — Visible copy carries no production notes */
{
  const { ctx, page } = await open(1440, 790);
  const text = await page.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('[alt],[aria-label]')].map(e => (e.getAttribute('alt') || '') + ' ' + (e.getAttribute('aria-label') || '')).join(' '));
  const hits = text.match(/\b(original\w*|generiert\w*|KI-\w*|konzeptionell\w*|bearbeitet\w*|illustrativ\w*|Mockup|Platzhalter|TODO|Lorem)\b/gi) || [];
  check('copy: no production notes visible', !hits.length, hits.join(','));
  check('page carries noindex', await page.evaluate(() => /noindex/.test(document.querySelector('meta[name=robots]')?.content || '')));
  await ctx.close();
}

await browser.close();
const failed = results.filter(r => !r.pass);
writeFileSync(new URL('../docs/browser-qa.json', import.meta.url), JSON.stringify({ date: new Date().toISOString().slice(0, 10), base: BASE, checks: results.length, passed: results.length - failed.length, failed: failed.length, windows: windows.map(w => w.join('x')), results }, null, 2) + '\n');
console.log(`browser QA ${results.length - failed.length}/${results.length}${failed.length ? ' — FAIL' : ' — PASS'}`);
process.exit(failed.length ? 1 : 0);
