<div align="center">

<img src=".github/assets/banner.png" alt="Al Volo: Hier schmeckt das Leben." width="100%" />

<h3>A one-page website for a neighbourhood pizzeria in Hamburg, where the AV seal opens every scene like a camera iris and the restaurant's own films pour into the page.</h3>

<p>
  <a href="https://al-volo-hamburg.vercel.app"><strong>🌐 Live site</strong></a>
  &nbsp;·&nbsp;
  <a href="#hero-animation"><strong>🎬 How the hero works</strong></a>
  &nbsp;·&nbsp;
  <a href="#getting-started"><strong>🛠️ Run it locally</strong></a>
</p>

<p>
  <a href="https://al-volo-hamburg.vercel.app"><img src="https://img.shields.io/badge/Vercel-Live-8E1123?style=for-the-badge&logo=vercel&logoColor=white" alt="Live on Vercel" /></a>
  <img src="https://img.shields.io/badge/HTML5-No_build-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5, no build step" />
  <img src="https://img.shields.io/badge/GSAP-ScrollTrigger-0AE448?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP ScrollTrigger" />
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JavaScript" />
  <img src="https://img.shields.io/badge/♿_Accessibility-first-C41E3A?style=for-the-badge" alt="Accessibility first" />
</p>

</div>

<br />

## 🚀 Overview

**Pizzeria Al Volo** serves pizza, pasta and a good time on Eppendorfer Weg in Hamburg. The site is built from the approved board *Momenti Veri* around one idea: the round AV seal works like a **camera aperture**. The page opens through it, and every round window on the page opens the same way. Behind those windows are real moments at the restaurant: a guest with an Aperol, a pizza fresh from the oven, the chef at work, the façade on Eppendorfer Weg.

Thirteen scenes in German take visitors from the first impression to a **table at DISH**. Each one has its own scroll choreography, built with GSAP and ScrollTrigger. Three scenes hold the screen while their content plays: six reasons pan sideways, three words fill with the kitchen's films, and three films play one after another like stories.

- **A cinematic opening**: the seal spins in, opens the page as an iris and flies back into the header, then the title rises letter by letter
- **The restaurant's films, everywhere**: the three original videos are cut into muted loops that fill the letters of *Pizza, Pasta, Passione* and play as story cards. A tap opens the full film with sound
- **Everything from alvolo.de**: the concept, the three pillars, the six reasons, lunch and deals, the gallery, the Google and Instagram reward, contact and directions. All of it is redrawn in the board's style
- **Clear path to a table**: *Tisch reservieren* in the header, the sticky bar, the hero and the booking scene opens the restaurant's real DISH reservation, with the phone number as a fallback
- **Light where it counts**: 1.95 MB on first load at 1440 × 900 and 1.51 MB on a phone. Films load only when their scene comes into view. The 7.7 MB of full films with sound load only when a visitor taps one

<br />

<a name="hero-animation"></a>

## 🎬 The hero animation

<div align="center">
  <a href="https://al-volo-hamburg.vercel.app"><img src=".github/assets/hero-scroll.gif" alt="The seal spins in and opens the page as an iris, the title rises letter by letter, then the scroll runs through every scene down to the footer" width="100%" /></a>
  <sub>Captured from the running page at 1440 × 900 · the opening is shown at 0.3× speed</sub>
</div>

<br />

The opening plays once per visit. Each scene after it is tied to the scroll and plays backwards when the visitor scrolls back up:

| Scroll                                   | What happens                                                                                                                                                     |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Load                                     | The AV seal spins in at the centre of a dark cover (−220° to 0° in 0.95 s), then the cover opens as a circular iris while the seal flies back into the header     |
|                                          | The title rises out of its own mask, one letter every 30 ms. The burrata rolls in from the left, then the buttons, hours and navigation. About 3.5 s in all; a scroll jumps to the end |
| Leaving the hero                         | The three title lines slide apart (−26 %, +18 %, −14 %), the portrait closes from a full window into a small circle and sinks, the burrata rolls off to the right and the seal turns −150° |
| **Worauf hast du Lust?**                 | The pizza window opens as an ellipse while the camera pans across the pizza. The basil swings in and draws its stem, and a brush stroke wipes in                         |
| **48 Stunden.**                          | **48** counts up with the scroll while the clock ring fills. The chef's window opens as a circle, the tomato vine draws itself and the tomatoes drop with a bounce |
| **Mehr als Pizza**                       | The three columns arrive at different speeds; each photo turns open like the seal (−120° to 0°)                                                                 |
| **Qualität kommt von innen.** · pinned   | The scene holds while the six reasons travel sideways, each photo drifting inside its frame; the *01 / 06* counter follows                                     |
| **Pizza, Pasta, Passione** · pinned      | The three words drift apart while the kitchen's films pour into the letters from the left, the right and below                                                    |
| **Vom Teig zum Tisch.** · pinned         | Three films play like stories: the story bar fills with the scroll, the active card straightens and plays, and the others tilt back and dim                               |
| **Mittagstisch**                         | The restaurant's display turns in 3D as it passes, then switches on with a flash and a blinking *Heute* badge                                                    |
| **Ein Stück Hamburg.**                   | The façade rises in an arch, and the pizza window rolls in like a wheel                                                                                          |
| **Einblicke in unsere Pizzeria**         | Two endless bands of photos run against each other with the scroll                                                                                               |
| **Bewerten, Folgen**                     | 4,7 counts up, the stars fill, the three steps flip up one by one, and the gift lid opens                                                                           |
| **Dein Platz wartet.**                   | The table opens like curtains from the centre, a swoosh underlines the title, and the DISH card slides into place                                                  |
| **Hier finden Sie uns**                  | The façade opens as a circle from the map pin. The pin drops and pulses, and the opening hours flip into place like a split-flap board                          |
| Footer                                   | The *Al Volo* wordmark fills in as the page reaches its end                                                                                                      |

**Under the hood**

- 📐 **One unit for the whole page.** Everything is laid out in canvas units: `--u = min(1px, 100vw / 1024, 100svh / 760)`. The layout never grows past the approved board, so a 1920 px window shows the same title, portrait and pizzas as a 1024 px one. On short windows, the height cap keeps the hero inside one screen.
- 🎛️ **Motion as a layer on top.** The static page is complete on its own. `motion.js` builds the whole choreography inside one `gsap.context()`, and only while motion is on. Turning motion off reverts every tween, pin and split heading, and removes the cloned photo bands. Pinned scenes fill the window while they hold, with their content centred.
- 🎞️ **Films that play only in view.** Every inline video is `muted`, `playsinline` and `preload="none"`. Each one gets its source on first use and plays only while its scene is on screen. All of them pause when the tab is hidden.
- 🔤 **Words cut from the typeface.** `scripts/prepare-motion.py` turns *Pizza*, *Pasta* and *Passione* into Caprasimo outlines with fontTools and uses them as CSS masks. It also cuts 576 × 432 montage loops from the three original MP4s with FFmpeg, using hard cuts like the reels themselves, at 160 to 240 KB each.
- 🌊 **Waves in canvas units.** Each scene's background reaches up into the previous one and is cut by an SVG wave mask drawn on the same 1024-unit grid. The curves keep their shape at any window width.
- 🌫️ **Photos that melt into themselves.** Behind each scene photo sits a blurred plate of the same photo, extended past its edges (`scripts/prepare-plates.py`). The edge is invisible, nothing is mirrored and no second picture is added.
- 🐢 **Graceful by default.** `prefers-reduced-motion`, the *Bewegung* pause button and Save-Data all show every scene in its final state, with posters in place of films. Scrolling stays native.

<br />

## 🖥️ Sections

<div align="center">
  <img src=".github/assets/desktop-sections.jpg" alt="Desktop screenshots of the thirteen scenes, from the hero down to the contact scene and footer" width="100%" />
</div>

<br />

| #   | Section                                          | Anchor           | Role                                                                                                          |
| :-- | :----------------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------ |
| 01  | **Hier schmeckt das Leben.**                     | `#home`          | First impression, with menu and reservation calls to action and the opening hours                             |
| 02  | **Worauf hast du Lust?**                         | `#speisekarte`   | Pizza macro, category tabs and a dish picker; *Alle Kategorien & Suche* opens the full selection; PDF menu    |
| 03  | **48 Stunden. Für diesen Moment.**               | `#konzept`       | The dough story on solid red, with *Unser Konzept* and *Teig für zu Hause*                                     |
| 04  | **Mehr als Pizza – ein Stück Italien in Hamburg.** | `#unser-konzept` | The three pillars: Pizza, Frische, Tradition                                                                 |
| 05  | **Qualität kommt von innen.**                    | `#ueber-uns`     | Six reasons, from the stone oven to the Google reviews, as a sideways track                                    |
| 06  | **Pizza, Pasta, Passione**                       | `#passione`      | The three words filled with the kitchen's films                                                               |
| 07  | **Vom Teig zum Tisch.**                          | `#erleben`       | The restaurant's story, with three films as story cards and the full films with sound on tap               |
| 08  | **Mittagstisch und andere Deals**                | `#mittagstisch`  | The live lunch and deals display from the pizzeria, opened on request, with the phone number                  |
| 09  | **Ein Stück Hamburg. Viel Italien.**             | `#pizzeria`      | The façade, with Wolt, Google, Instagram, TikTok and the gift voucher                                          |
| 10  | **Einblicke in unsere Pizzeria**                 | `#impressionen`  | The 12 gallery photos in two moving bands, each one opening the lightbox                                      |
| 11  | **Bewerten, Folgen – und beschenkt werden.**     | `#bewertungen`   | The Google rating and the restaurant's reward: review, follow, show it on the next visit                      |
| 12  | **Dein Platz wartet.**                           | `#reservieren`   | Date, time and guests opening the restaurant's DISH reservation, with phone, email and address               |
| 13  | **Pizzeria Al Volo**                             | `#kontakt`       | Address, opening hours, route, map, phone, email and social links                                             |
| 14  | Footer                                           | `.site-footer`   | Navigation, visit details, Impressum, Datenschutz and privacy settings                                        |

<br />

## 📱 Mobile first, motion optional

<div align="center">
  <img src=".github/assets/mobile-screens.jpg" alt="Mobile screenshots: hero, menu, Pizza Pasta Passione, the story films and the contact scene" width="100%" />
</div>

<br />

- Below 720 px the page uses its own composition instead of a shrunken board: text first, then the portrait, with the burrata on the seam
- Nothing is pinned on a phone. The six reasons and the three story films become rows to swipe, and the story card most in view plays while its bar follows the film
- No horizontal scroll from 375 to 1920 px wide and no text under 11 px in the page content (checked in the browser QA)
- Pointer parallax only runs on fine pointers; nothing depends on hover

<br />

## ✨ Highlights

- **🎞️ The restaurant's own films**: three word films and three story loops cut from the original videos, with the full films with sound one tap away. They pause when the dialog closes or the tab is hidden
- **🍕 Menu with search**: 21 dishes in eight categories with prices checked against the PDF menu, which stays one tap away for the full list
- **📅 Real reservations**: the restaurant's own DISH widget, with the phone number as a fallback. The site never shows an invented "booking confirmed" screen
- **⭐ Rate, follow, get a surprise**: the restaurant's existing reward, laid out in three steps that link straight to Google and Instagram
- **🔒 Nothing external until asked**: DISH, the deals display and Google Maps load only when the visitor asks. A stored choice can be changed under *Einstellungen*, and the fonts are self-hosted
- **🖼️ Photo bands and lightbox**: the 12 photos of the official gallery, with arrow-key navigation and an *Alle Fotos* grid
- **🧪 Browser QA**: `npm run qa` runs 143 checks across 8 window sizes. It covers density, overflow, copy covered by the next scene, console errors, missing files, tiny text, upscaled photos and every dialog and link. With motion on, it checks that the three pins fill the window, that films play only in view, that every scene ends in its full state and that pausing reverts everything
- **🔎 Ready to share**: Open Graph image, `Restaurant` structured data and favicons; `noindex` until the client's own domain is live

<br />

## 💻 Tech stack

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="40" height="40" /><br />HTML5 | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="40" height="40" /><br />CSS3 | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="40" height="40" /><br />JavaScript | <img src="https://cdn.simpleicons.org/greensock/0AE448" width="40" height="40" /><br />GSAP | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="40" height="40" /><br />Python | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg" width="40" height="40" /><br />OpenCV | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/playwright/playwright-original.svg" width="40" height="40" /><br />Playwright | <img src="https://cdn.simpleicons.org/ffmpeg/007808" width="40" height="40" /><br />FFmpeg | <img src="https://cdn.simpleicons.org/vercel/000000/ffffff" width="40" height="40" /><br />Vercel |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |

### Why this stack?

- **Static HTML, CSS and JavaScript**: the `site/` folder is the whole website, with no build step and no framework runtime. It can be opened locally or put on any static host
- **GSAP 3.13 and ScrollTrigger**: scrubbed timelines, pins and a horizontal track with `containerAnimation`. They ship as two vendored files in `site/vendor/` (117 KB on disk), so the site loads nothing from a CDN
- **CSS custom properties**: one unit variable drives every size and position, so the board's proportions hold at every width
- **Python, OpenCV, fontTools and FFmpeg, offline only**: they measured the board, built the blurred plates, cut the film loops and the word masks, and pulled the video posters. The site never depends on them
- **Playwright**: a real Chrome checks every window size, dialog, link and pinned scene
- **Vercel**: static hosting straight from `site/`

<br />

## 🎨 Design system

| Token    | Value                                                                        | Use                                         |
| :------- | :--------------------------------------------------------------------------- | :------------------------------------------ |
| Red      | ![#C41E3A](https://img.shields.io/badge/%23C41E3A-C41E3A?style=flat-square) | Brand red, reservation button, menu titles  |
| Wine     | ![#8E1123](https://img.shields.io/badge/%238E1123-8E1123?style=flat-square) | The 48-hour scene, word outlines, header button |
| Cream    | ![#F4E7CF](https://img.shields.io/badge/%23F4E7CF-F4E7CF?style=flat-square) | Paper scenes, seams, seal base, text on dark |
| Card     | ![#F6E5CC](https://img.shields.io/badge/%23F6E5CC-F6E5CC?style=flat-square) | DISH card, step cards and dialogs           |
| Ink      | ![#0A0A0A](https://img.shields.io/badge/%230A0A0A-0A0A0A?style=flat-square) | Dark scenes and body text on cream          |
| Leaf     | ![#455332](https://img.shields.io/badge/%23455332-455332?style=flat-square) | Basil and vine accents                      |

- **Type**: Caprasimo for titles (hero title capped at 76 units) and DM Sans for text and interface, both self-hosted under the OFL
- **Grid**: a 1024-unit canvas centred in the window; backgrounds run edge to edge while content keeps the board's size
- **Scenes**: the hero is 720 units tall, followed by 538, 477, 563, 601, 626, 607, 540, 381, 605, 605, 493 and 558 units, and a 650-unit footer. The QA keeps every scene after the hero within 0.85 of the window at the desktop sizes
- **Motion**: scrubbed with the scroll (0.6 to 0.8 s smoothing) and played in reverse on the way back up. There are three pins: the reasons track holds for its own width, *Passione* for 85 % of a screen and the stories for 170 %. Photos are never zoomed

<br />

<a name="getting-started"></a>

## 🛠️ Getting started

```bash
# Clone the repository
git clone https://github.com/Jeanfr1/Al-Volo-website.git
cd Al-Volo-website

# Install the dev tools (Playwright for QA and captures, GSAP as the vendored source; the site itself needs nothing)
npm install

# Serve site/  →  http://localhost:4437
npm run dev

# Browser QA (8 window sizes, every dialog, link and pinned scene)  →  docs/browser-qa.json
npm run qa

# Asset hashes, kit checker and MANIFEST.sha256, in that order
npm run manifest
```

QA and captures use a cached *Chrome for Testing* build, or the browser named in `CHROME_PATH`.

- **Derived images** (plates, posters, seal and icons): run `python3 scripts/prepare-plates.py` with OpenCV, Pillow and FFmpeg installed.
- **Film loops and word masks**: run `python3 scripts/prepare-motion.py`, which needs fontTools and FFmpeg.
- **README images**: they come from `node scripts/readme-assets.mjs` while the dev server is running.

<br />

## 📁 Project structure

```
Al-Volo-website/
├── site/                         # The website: deploy this folder as-is
│   ├── index.html                # Thirteen scenes: home → speisekarte → … → kontakt, then the footer
│   ├── styles.css                # Canvas units, scene layout, wave masks, word films, phone reflow
│   ├── app.js                    # Motion switch, sticky bar, menu, dialogs, DISH/Maps/deals gate, films with sound
│   ├── motion.js                 # GSAP choreography, one function per scene, reverted when motion is off
│   ├── content.js                # Contacts, links, videos and gallery
│   ├── menu-data.js              # The 21-dish selection from the PDF menu
│   ├── vendor/                   # gsap.min.js and ScrollTrigger.min.js 3.13.0
│   ├── shapes/                   # Wave masks and the word masks and outlines
│   ├── photos/                   # Optimised photos, plates/ (blurred extensions), posters/ (video frames)
│   ├── videos/                   # The three original MP4s, plus loops/ (word films and story loops)
│   ├── fonts/  brand/            # Caprasimo, DM Sans (OFL) and the original logo with display-size copies
│   └── Speisekarte-Al-Volo-Original.pdf
├── scripts/
│   ├── serve.mjs                 # Zero-dependency static server with Range support
│   ├── qa.mjs                    # Browser QA
│   ├── shots.mjs  filmstrip.mjs  # Full-page shots and natural-speed scroll contact sheets
│   ├── readme-assets.mjs         # Banner, GIF and screenshots for this README
│   ├── prepare-plates.py         # Plates, burrata cutout, posters, seal and icons
│   ├── prepare-motion.py         # Film loops, story loops and word masks
│   └── sync-manifests.py         # Asset manifest, kit checker, MANIFEST.sha256
├── references/                   # The approved board (model 1, Momenti Veri)
├── roteiros/  motion/  process/  # Art direction, scene scripts, timeline and the 1024-unit scale rule
├── docs/                         # Architecture lock, scale contract, asset hashes, QA reports
├── images/originals/             # The 14 original photos, untouched
├── tools/verificar-kit.py        # Kit checker (116 checks)
├── GUIA-VISUAL.html  LEIA-ME-KIT.md
└── vercel.json                   # Static output from site/, noindex headers
```

<br />

<a name="deployment"></a>

## 🚀 Deployment

Hosted on **Vercel** as a static site and connected to this repository: every push to `main` ships to production. There is no build command, and only `site/` is published.

**Live site:** [al-volo-hamburg.vercel.app](https://al-volo-hamburg.vercel.app)

| Setting          | Value          |
| :--------------- | :------------- |
| Framework        | Other (static) |
| Build command    | none           |
| Output directory | `site`         |

`vercel.json` also sends `X-Robots-Tag: noindex` and long cache headers for fonts, and `site/robots.txt` disallows crawling until the client's own domain is live.

<br />

## 📌 Content checklist

Items waiting on the client. Each one is marked `TODO(alvolo)` in `site/`.

- [ ] Confirm the dish selection and prices against the current authorised menu (`menu-data.js`)
- [ ] Confirm the opening hours (`content.js`, footer and structured data)
- [ ] Confirm the current Google rating and review count, shown as 4,7 from over 2,300 reviews (`index.html`)
- [ ] Keep the voucher, Impressum and Datenschutz routes on alvolo.de if that hosting changes (`content.js`)
- [ ] Custom domain, then remove `noindex`, add `canonical` and `og:url`, and move `og:image` to it (`index.html`, `vercel.json`, `robots.txt`)

<br />

## 🙏 Acknowledgments

- **Pizzeria Al Volo** for the photos, videos, menu and the approved visual direction
- **[Caprasimo](https://github.com/docrepair-fonts/caprasimo-fonts)** and **[DM Sans](https://github.com/googlefonts/dm-fonts)**, both under the SIL Open Font License
- **[GSAP](https://gsap.com)** and ScrollTrigger by GreenSock
- **[DISH](https://www.dish.co)** for the reservation widget the restaurant already uses
- **[Playwright](https://playwright.dev)**, **[OpenCV](https://github.com/opencv/opencv)**, **[fontTools](https://github.com/fonttools/fonttools)**, **[FFmpeg](https://ffmpeg.org)** and **[Vercel](https://vercel.com)**

<br />

---

<div align="center">
  <img src="site/brand/icon-180.png" width="44" height="44" alt="" />
  <p><strong>Hier schmeckt das Leben.</strong></p>
  <p>Built with ❤️ by <a href="https://github.com/Jeanfr1">Jean</a> for Pizzeria Al Volo</p>
  <sub>© 2026 Pizzeria Al Volo. All rights reserved.</sub>
</div>
