// Playwright launcher: uses the Chrome for Testing build already cached on this Mac.
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  const dirs = existsSync(cache) ? readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort().reverse() : [];
  for (const d of dirs) {
    for (const arch of ['chrome-mac-x64', 'chrome-mac-arm64', 'chrome-mac']) {
      const p = join(cache, d, arch, 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

export const launch = (opts = {}) => chromium.launch({ executablePath: chromePath(), ...opts });
export const BASE = process.env.QA_BASE || 'http://localhost:4437/';
