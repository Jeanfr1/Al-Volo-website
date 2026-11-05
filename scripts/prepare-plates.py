#!/usr/bin/env python3
"""Derived plates for the desktop composition. Originals and site/photos stay untouched.

ambient(): the scene's own photo, placed exactly where the CSS places it (canvas units),
extended past its borders by push-pull diffusion and blurred. The sharp photo sits on top
with feathered edges, so it melts into a blurred copy of itself: no seam, no mirroring,
no second photo.

Run with Anaconda python:  python3 scripts/prepare-plates.py
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'site/photos'
OUT = ROOT / 'site/photos/plates'
OUT.mkdir(parents=True, exist_ok=True)

# Desktop frame around the 1024-unit canvas: wide enough for a 2000 px window.
FRAME_X0, FRAME_W = -488, 2000


def load(name):
    return np.asarray(Image.open(SRC / name).convert('RGB')).astype(np.float32) / 255


def pushpull(img, mask):
    """Fill mask==0 pixels with a smooth extrapolation of the known ones."""
    levels = []
    im, m = img * mask[..., None], mask.copy()
    while min(m.shape) > 4:
        levels.append((im, m))
        im = cv2.pyrDown(im)
        m = cv2.pyrDown(m)
    # coarsest level: anything the kernel never reached takes the photo's mean colour
    mean = (img * mask[..., None]).sum((0, 1)) / max(mask.sum(), 1)
    filled = np.where((m > 1e-4)[..., None], im / np.maximum(m, 1e-6)[..., None], mean)
    for im_l, m_l in reversed(levels):
        up = cv2.resize(filled, (m_l.shape[1], m_l.shape[0]), interpolation=cv2.INTER_LINEAR)
        known = im_l / np.maximum(m_l, 1e-6)[..., None]
        w = np.clip(m_l * 4, 0, 1)[..., None]
        filled = known * w + up * (1 - w)
    return filled


def ambient(name, out, left, top, width, height, scale=0.5, blur=26, dark=1.0, x0=FRAME_X0, w=FRAME_W):
    """Render the photo at (left, top, width) canvas units inside a frame x0..x0+w, 0..height."""
    photo = load(name)
    fw, fh = int(round(w * scale)), int(round(height * scale))
    pw = int(round(width * scale))
    ph = int(round(photo.shape[0] * pw / photo.shape[1]))
    small = cv2.resize(photo, (pw, ph), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((fh, fw, 3), np.float32)
    mask = np.zeros((fh, fw), np.float32)
    px, py = int(round((left - x0) * scale)), int(round(top * scale))
    sx0, sy0 = max(0, -px), max(0, -py)
    dx0, dy0 = max(0, px), max(0, py)
    dx1, dy1 = min(fw, px + pw), min(fh, py + ph)
    canvas[dy0:dy1, dx0:dx1] = small[sy0:sy0 + dy1 - dy0, sx0:sx0 + dx1 - dx0]
    mask[dy0:dy1, dx0:dx1] = 1
    filled = pushpull(canvas, mask)
    filled = cv2.GaussianBlur(filled, (0, 0), blur)
    filled = np.clip(filled * dark, 0, 1)
    Image.fromarray((filled * 255).astype(np.uint8)).save(OUT / out, 'WEBP', quality=82, method=6)
    print(out, (fw, fh))


def burrata():
    """The burrata pizza of alvolo-9 on its own (alpha), for the hero foreground."""
    im = Image.open(SRC / 'alvolo-9.webp').convert('RGB')
    crop = (0, 0, 1060, 640)
    rgb = np.asarray(im.crop(crop))
    h, w = rgb.shape[:2]
    alpha = np.zeros((h, w), np.float32)
    cv2.ellipse(alpha, (528, 292), (450, 280), -2, 0, 360, 1.0, -1)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 14)
    # the source frame cuts the far crust: fade it instead of showing a straight edge
    ramp = np.clip(np.arange(h) / 60.0, 0, 1)[:, None]
    alpha *= ramp
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(OUT / 'hero-burrata.webp', 'WEBP', quality=86, method=6)
    print('hero-burrata.webp', (w, h))


def posters():
    """Card posters: one frame of each original MP4, chosen for the subject (no new video)."""
    import subprocess
    from io import BytesIO
    out = ROOT / 'site/photos/posters'
    out.mkdir(exist_ok=True)
    for n, t in ((1, 11.3), (2, 0.55), (3, 4.6)):
        png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', str(ROOT / f'site/videos/video-{n}-alvolo.mp4'),
                              '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], check=True, capture_output=True).stdout
        Image.open(BytesIO(png)).convert('RGB').save(out / f'video-{n}.webp', 'WEBP', quality=88, method=6)
        print(f'posters/video-{n}.webp at {t}s')


def seal():
    """Display-size copies of the original logo (downsampled only, no redesign; the original stays in site/brand)."""
    logo = Image.open(ROOT / 'site/brand/logo-original.png').convert('RGBA')
    logo.resize((320, 320), Image.LANCZOS).save(ROOT / 'site/brand/seal-320.webp', 'WEBP', quality=90, method=6)
    for size in (64, 180):
        logo.resize((size, size), Image.LANCZOS).save(ROOT / f'site/brand/icon-{size}.png', optimize=True)
    print('seal-320.webp, icon-64.png, icon-180.png')


if __name__ == '__main__':
    seal()
    posters()
    # Values mirror site/styles.css (desktop, canvas units). Scene plates start PAD units above
    # the scene box so they also fill the wave band that reaches up into the previous scene.
    PAD = 80
    ambient('alvolo-2.webp', 'hero-ambient.webp', left=400, top=-49, width=560, height=740, blur=22)
    ambient('alvolo-8.webp', 'reels-ambient.webp', left=-166, top=92 + PAD, width=820, height=460 + PAD, blur=22)
    ambient('alvolo-12.webp', 'place-ambient.webp', left=429, top=-80 + PAD, width=272, height=400 + PAD, blur=24)
    ambient('alvolo-1.webp', 'booking-ambient.webp', left=326, top=-20 + PAD, width=760, height=420 + PAD, blur=22)
    # Mobile hero: 800 px frame centred on the portrait (portrait centre = 50% + 18 px, top 300 px).
    ambient('alvolo-2.webp', 'hero-ambient-m.webp', left=185, top=300, width=430, height=820, x0=0, w=800, blur=20)
    burrata()
