// Baja las métricas reales de GitHub para la sección de GitHub del portfolio y las guarda en
// assets/data/github.json (la copia fija; en el hosting, api/github.php las trae en vivo).
//   node .claude/github-data.mjs            (usuario por defecto: MateoRo2003)
//   node .claude/github-data.mjs otroUsuario
// Con un token (GITHUB_TOKEN, o la sesión de `gh auth login`) usa la API oficial y suma commits,
// y repos con commits; sin token lee el gráfico público del perfil. Mismo formato que api/github.php.
import { writeFile, mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const user = process.argv[2] || 'MateoRo2003';
const out = fileURLToPath(new URL('../assets/data/github.json', import.meta.url));
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

let token = process.env.GITHUB_TOKEN;
if (!token) {
  try { token = execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* sin gh */ }
}

const QUERY = `query($login: String!) {
  user(login: $login) {
    createdAt
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalRepositoriesWithContributedCommits
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } }
    }
  }
}`;

async function fromApi() {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'snapfolio' },
    body: JSON.stringify({ query: QUERY, variables: { login: user } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub API: ${res.status} ${JSON.stringify(json.errors || json.message)}`);
  const u = json.data.user;
  const cc = u.contributionsCollection;
  const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays.map((d) => [d.date, d.contributionCount, LEVEL[d.contributionLevel] ?? 0]));
  return {
    source: 'api',
    total: cc.contributionCalendar.totalContributions,
    days,
    stats: {
      commits: cc.totalCommitContributions,
      contributedRepos: cc.totalRepositoriesWithContributedCommits,
      publicRepos: u.repositories.totalCount,
      since: u.createdAt.slice(0, 10),
    },
  };
}

// sin token: el gráfico público del perfil (cada celda tiene fecha y nivel; la cantidad, en su tooltip)
async function fromProfile() {
  const res = await fetch(`https://github.com/users/${user}/contributions`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
  const html = await res.text();
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
  return { source: 'profile', total: days.reduce((s, d) => s + d[1], 0), days, stats: null };
}

let data;
try {
  if (!token) throw new Error('sin token');
  data = await fromApi();
} catch (e) {
  if (token) console.warn(`No se pudo usar la API (${e.message}); uso el gráfico público.`);
  data = await fromProfile();
}

await mkdir(fileURLToPath(new URL('../assets/data/', import.meta.url)), { recursive: true });
await writeFile(out, JSON.stringify({ user, updated: new Date().toISOString().slice(0, 10), ...data }));
const s = data.stats;
console.log(`${user} (${data.source}): ${data.days.length} días, ${data.total} contribuciones` +
  (s ? `, ${s.commits} commits en ${s.contributedRepos} repos, ${s.publicRepos} repos públicos` : '') +
  ' → assets/data/github.json');
