// Levanta todos los portfolios a la vez, uno por puerto, sin cambiar de rama:
//   4173 → la carpeta tal como está (la rama en la que se trabaja, con los cambios en vivo)
//   4174 → master (el sitio original)
//   4175 → portfolio-3d
//   4176 → portfolio-editorial
// Las ramas se leen directo de git (git show rama:archivo), así no hace falta checkout ni otra carpeta.
// Uso: node .claude/serve-ramas.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { join, extname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SITES = [
  { port: 4173, name: 'actual (carpeta)', branch: null },
  { port: 4174, name: 'original', branch: 'master' },
  { port: 4175, name: '3D', branch: 'portfolio-3d' },
  { port: 4176, name: 'editorial', branch: 'portfolio-editorial' },
];
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
};

const fromBranch = (branch, path) => new Promise((ok, fail) => {
  execFile('git', ['show', `${branch}:${path}`], { cwd: root, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 }, (err, out) => (err ? fail(err) : ok(out)));
});

for (const site of SITES) {
  createServer(async (req, res) => {
    let path = decodeURIComponent(req.url.split('?')[0]);
    if (path.endsWith('/')) path += 'index.html';
    path = posix.normalize(path).replace(/^\/+/, '');
    if (path.startsWith('..')) return res.writeHead(403).end();
    try {
      const body = site.branch ? await fromBranch(site.branch, path) : await readFile(join(root, path));
      res.writeHead(200, { 'content-type': types[extname(path).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404).end('404');
    }
  }).listen(site.port, () => console.log(`${site.name.padEnd(17)} http://localhost:${site.port}${site.branch ? `  (rama ${site.branch})` : ''}`));
}
console.log('Ctrl+C para cortar todos');
