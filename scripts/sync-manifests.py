#!/usr/bin/env python3
"""Refresh docs/asset-manifest.json (derived assets), run the kit checker, then MANIFEST.sha256.

The order matters: the checker validates the asset hashes and rewrites docs/QA*, so the
file-level manifest is written last.  Run after any change:  npm run manifest
"""
from pathlib import Path
import hashlib, json, subprocess, sys

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sha = lambda f: hashlib.sha256(f.read_bytes()).hexdigest()

# 1. asset-manifest.json: keep the kit's entries, (re)write the implementation's derived ones.
derived = {'site/photos/plates': 'derived_plate_from_original_photo',
           'site/photos/posters': 'poster_frame_from_original_video',
           'site/photos/og-al-volo.jpg': 'share_image_from_page_capture',
           **{f'site/brand/{n}': 'display_copy_of_original_logo' for n in ('seal-320.webp', 'icon-64.png', 'icon-180.png')}}
manifest = json.loads((ROOT / 'docs/asset-manifest.json').read_text())
manifest = [e for e in manifest if e['classification'] not in derived.values()]
for prefix, kind in derived.items():
    target = ROOT / prefix
    for f in sorted([target] if target.is_file() else target.glob('*')):
        with Image.open(f) as im:
            manifest.append({'path': str(f.relative_to(ROOT)), 'classification': kind, 'bytes': f.stat().st_size,
                             'sha256': sha(f), 'width': im.width, 'height': im.height, 'mode': im.mode})
(ROOT / 'docs/asset-manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')

# 2. Kit checker (writes docs/QA.json, docs/QA.md, docs/scale-measurements.json).
kit = subprocess.run([sys.executable, str(ROOT / 'tools/verificar-kit.py')], cwd=ROOT)

# 3. MANIFEST.sha256: every file git would publish (tracked + untracked, not ignored), minus itself.
files = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard'], cwd=ROOT,
                       capture_output=True, text=True, check=True).stdout.split('\n')
files = sorted({f for f in files if f and f != 'MANIFEST.sha256' and (ROOT / f).is_file()})
(ROOT / 'MANIFEST.sha256').write_text(''.join(f'{sha(ROOT / f)}  {f}\n' for f in files))
print(f'asset-manifest: {len(manifest)} entries · MANIFEST.sha256: {len(files)} files')
sys.exit(kit.returncode)
