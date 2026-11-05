// Zero-dependency static server for site/ (the site has no build step). Supports Range for the MP4s.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../site/', import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 4437);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4' };

createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(root, path);
    if (!file.startsWith(root)) throw new Error('outside');
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory()) { file = join(file, 'index.html'); info = await stat(file); }
    if (!info) throw new Error('missing');
    const head = { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store', 'accept-ranges': 'bytes' };
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : info.size - Number(range[2]);
      const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
      res.writeHead(206, { ...head, 'content-range': `bytes ${start}-${end}/${info.size}`, 'content-length': end - start + 1 });
      createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { ...head, 'content-length': info.size });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('404');
  }
}).listen(port, () => console.log(`site/ on http://localhost:${port}/`));
