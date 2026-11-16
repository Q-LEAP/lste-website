// Prints documentation/brand-guidelines/LSTE-2026-Brand-Guidelines.html to
// assets/downloads/LSTE-2026-Brand-Guidelines.pdf with headless Chrome
// (2 x A4, backgrounds on, no header/footer). Set CHROME_PATH to override the
// browser location.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const src = resolve(root, 'documentation/brand-guidelines/LSTE-2026-Brand-Guidelines.html');
const out = resolve(root, 'assets/downloads/LSTE-2026-Brand-Guidelines.pdf');

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) throw new Error('Chrome not found — set CHROME_PATH.');

execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--virtual-time-budget=5000',
  `--print-to-pdf=${out}`,
  pathToFileURL(src).href,
], { stdio: 'inherit' });

console.log(`Wrote ${out}`);
