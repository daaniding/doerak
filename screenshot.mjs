/* Headless screenshot helper — uses puppeteer if available. */
import puppeteer from 'puppeteer';
import path from 'path';
import { promises as fs } from 'fs';

const url = process.argv[2] || 'http://localhost:3000';
const labelArg = process.argv[3] || 'shot';
const viewport = process.argv[4] || '390x844';
const [w, h] = viewport.split('x').map(n => parseInt(n, 10));

const outDir = process.argv[5] || '/tmp';
await fs.mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
await new Promise(r => setTimeout(r, 800));
const out = path.join(outDir, `doerak-${labelArg}-${w}x${h}.png`);
await page.screenshot({ path: out, fullPage: false });
console.log(out);
await browser.close();
