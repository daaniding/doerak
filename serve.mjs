/* Tiny static server for local dev. `node serve.mjs` → http://localhost:3000 */
import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const PORT = process.env.PORT || 3000;
const ROOT = path.dirname(url.fileURLToPath(import.meta.url));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const filePath = path.join(ROOT, p);
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found: ' + req.url);
  }
});

server.listen(PORT, () => {
  console.log(`DOERAK serving on http://localhost:${PORT}`);
});
