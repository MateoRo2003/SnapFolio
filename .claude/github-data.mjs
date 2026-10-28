// Baja las contribuciones públicas de GitHub (el gráfico del perfil) y las guarda para la sección
// de GitHub del portfolio. Correrlo cada tanto para actualizar los números:
//   node .claude/github-data.mjs            (usuario por defecto: MateoRo2003)
//   node .claude/github-data.mjs otroUsuario
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const user = process.argv[2] || 'MateoRo2003';
const out = fileURLToPath(new URL('../assets/data/github.json', import.meta.url));

const res = await fetch(`https://github.com/users/${user}/contributions`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
const html = await res.text();

// cada día es una celda con su fecha y nivel; la cantidad exacta está en su tooltip
const counts = new Map();
for (const [, id, text] of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g)) {
  const n = text.match(/^(\d[\d,]*)\s+contribution/);
  counts.set(id, n ? Number(n[1].replace(/,/g, '')) : 0);
}
const days = [];
for (const [cell] of html.matchAll(/<td[^>]*data-date="[^"]+"[^>]*>/g)) {
  const date = cell.match(/data-date="([^"]+)"/)[1];
  const id = cell.match(/id="([^"]+)"/)?.[1];
  const level = Number(cell.match(/data-level="(\d)"/)?.[1] || 0);
  days.push([date, counts.get(id) ?? 0, level]);
}
days.sort((a, b) => (a[0] < b[0] ? -1 : 1));
const total = days.reduce((s, d) => s + d[1], 0);

await mkdir(fileURLToPath(new URL('../assets/data/', import.meta.url)), { recursive: true });
await writeFile(out, JSON.stringify({ user, updated: new Date().toISOString().slice(0, 10), total, days }));
console.log(`${user}: ${days.length} días, ${total} contribuciones → assets/data/github.json`);
