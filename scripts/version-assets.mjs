// Appends a content-hash query string (?v=abc1234) to every reference to
// assets/css/styles.css and assets/js/main.js across all pages.
//
// Why: GitHub Pages (and most CDNs in front of it) cache these two files
// under their fixed URL for several minutes. Since the filename never
// changes between deploys, a browser or edge cache that already has the
// old bytes has no reason to refetch — visitors can keep seeing a stale
// stylesheet/script for a while after a push that changed either one,
// which has already caused at least two "local looks right, live looks
// broken" incidents. Appending a hash of the actual built content makes
// every change produce a brand new URL, so stale caches are simply never
// consulted for the new bytes; nothing to invalidate, nothing to expire.
//
// Run this LAST in the build (after css:build/js:build so the hash
// reflects final content, and after partials:inject/paths:localize so it
// rewrites the final relative hrefs actually shipped on each page).
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.claude', '_source', 'scripts', 'src']);

async function findHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      files.push(...(await findHtmlFiles(path.join(dir, entry.name))));
    } else if (entry.name.endsWith('.html') && !entry.name.startsWith('.')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function shortHash(buf) {
  return createHash('sha256').update(buf).digest('hex').slice(0, 8);
}

async function main() {
  const [cssBuf, jsBuf] = await Promise.all([
    readFile(path.join(ROOT, 'assets/css/styles.css')),
    readFile(path.join(ROOT, 'assets/js/main.js')),
  ]);
  const cssHash = shortHash(cssBuf);
  const jsHash = shortHash(jsBuf);

  const files = await findHtmlFiles(ROOT);
  let changed = 0;
  for (const file of files) {
    const original = await readFile(file, 'utf8');
    const updated = original
      .replace(/(styles\.css)(\?v=[a-f0-9]+)?(")/g, `$1?v=${cssHash}$3`)
      .replace(/(main\.js)(\?v=[a-f0-9]+)?(")/g, `$1?v=${jsHash}$3`);
    if (updated !== original) {
      await writeFile(file, updated);
      changed++;
    }
  }
  console.log(`Versioned styles.css (${cssHash}) and main.js (${jsHash}) across ${changed}/${files.length} page(s).`);
}

main();
