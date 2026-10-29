// Renderiza una composición (línea de tiempo pausada en window.__timelines.main) cuadro por cuadro.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { pathToFileURL } from 'url';
const [file, outDir, fps = '30', dur = '15', only] = process.argv.slice(2);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, protocolTimeout: 120000, args: ['--hide-scrollbars', '--use-angle=d3d11', '--enable-gpu', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0', timeout: 60000 });
await page.waitForFunction(() => document.documentElement.dataset.ready === '1', { timeout: 30000 });
const N = Math.round(+fps * +dur);
const frames = only ? only.split(',').map(Number) : [...Array(N).keys()];
for (const f of frames) {
  await page.evaluate((t) => { window.__timelines.main.seek(t, false); }, f / +fps);
  await page.screenshot({ path: `${outDir}/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 });
}
console.log('cuadros', frames.length, errors.join(' | ') || 'sin errores');
await browser.close();
