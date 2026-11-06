#!/usr/bin/env python3
"""Motion assets derived from the restaurant's own footage and fonts. Originals stay untouched.

- site/videos/loops/<word>.mp4  muted montage loops cut from the three original MP4s
  (hard cuts, like the reels themselves), cropped 4:3 around the action, H.264, faststart
- site/videos/loops/<word>.webp first frame, for reduced motion / Save-Data
- site/shapes/word-<word>.svg   the word set in Caprasimo as outlines, used as a CSS mask
- site/shapes/word-<word>-line.svg  the same word as a wine outline, drawn over the film
- site/videos/loops/story-<n>.mp4  muted, lighter copies of the three films for the inline stories
  (the dialog still plays the originals with sound)

Run with Anaconda python:  python3 scripts/prepare-motion.py
"""
from pathlib import Path
import subprocess

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'site/videos'
LOOPS = SRC / 'loops'
LOOPS.mkdir(exist_ok=True)

# (video number, start s, end s, crop top as a fraction of the frame height)
MONTAGES = {
    'pizza': [(3, 8.40, 10.0, .52), (1, 9.40, 10.45, .30), (3, 7.05, 8.05, .55)],
    'pasta': [(1, 5.35, 6.55, .28), (3, 4.25, 5.30, .50), (1, 6.75, 7.40, .30)],
    'passione': [(1, 1.60, 2.85, .26), (1, 0.05, 0.62, .22), (1, 10.70, 11.15, .40)],
}
W, H = 576, 432  # 4:3 crop of the 576×1024 vertical frame


def loop(word, parts):
    inputs, chains = [], []
    for i, (n, start, end, top) in enumerate(parts):
        inputs += ['-ss', f'{start}', '-to', f'{end}', '-i', str(SRC / f'video-{n}-alvolo.mp4')]
        y = int(round((1024 - H) * min(1, top / .58)))
        chains.append(f'[{i}:v]crop={W}:{H}:0:{y},fps=25,setsar=1,format=yuv420p[v{i}]')
    concat = ''.join(f'[v{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0[out]'
    out = LOOPS / f'{word}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(chains) + ';' + concat,
                    '-map', '[out]', '-an', '-c:v', 'libx264', '-profile:v', 'high', '-crf', '27', '-preset', 'slow',
                    '-movflags', '+faststart', str(out)], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(out), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80',
                    str(LOOPS / f'{word}.webp')], check=True)
    print(out.name, out.stat().st_size // 1024, 'KB')


def word_svg(word, font, outline=False):
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    x, paths, upm = 0, [], font['head'].unitsPerEm
    hmtx = font['hmtx']
    kern = 0  # Caprasimo's GPOS kerning is mild at this size; plain advances keep the masks simple
    for ch in word:
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        d = pen.getCommands()
        if d:
            paths.append(f'<path transform="translate({x} 0)" d="{d}"/>')
        x += hmtx[name][0] + kern
    bp = BoundsPen(glyphs)
    ymin, ymax = 0, 0
    for ch in word:
        glyphs[cmap[ord(ch)]].draw(bp)
    ymin, ymax = bp.bounds[1], bp.bounds[3]
    pad = upm * .02
    vb = f'{-pad:.0f} {-ymax - pad:.0f} {x + 2 * pad:.0f} {ymax - ymin + 2 * pad:.0f}'
    style = 'fill="none" stroke="#8E1123" stroke-width="14"' if outline else 'fill="#000"'
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" preserveAspectRatio="xMidYMid meet">'
           f'<g transform="scale(1 -1)" {style}>{"".join(paths)}</g></svg>')
    name = f'word-{word.lower()}{"-line" if outline else ""}.svg'
    (ROOT / 'site/shapes' / name).write_text(svg)
    w, h = x + 2 * pad, ymax - ymin + 2 * pad
    print(name, f'aspect {w / h:.3f}')


def story(n):
    out = LOOPS / f'story-{n}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(SRC / f'video-{n}-alvolo.mp4'), '-an', '-vf', 'fps=25,format=yuv420p',
                    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '29', '-preset', 'slow', '-movflags', '+faststart', str(out)], check=True)
    print(out.name, out.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    for word, parts in MONTAGES.items():
        loop(word, parts)
    for n in (1, 2, 3):
        story(n)
    font = TTFont(ROOT / 'fonts/Caprasimo-Regular.ttf')
    for word in ('PIZZA', 'PASTA', 'PASSIONE'):
        word_svg(word, font)
        word_svg(word, font, outline=True)
