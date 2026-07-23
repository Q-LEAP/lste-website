// Appends a content-hash query string (?v=abc1234) to every reference to
// assets/css/styles.css, assets/js/main.js, the self-hosted webfonts, and
// the sitewide logo/favicon — everywhere each is referenced.
//
// Why: GitHub Pages (and most CDNs in front of it) cache these under their
// fixed URL for several minutes. Since a filename never changes between
// deploys, a browser or edge cache that already has the old bytes has no
// reason to refetch — visitors can keep seeing stale bytes for a while
// after a push that changed one, which has already caused at least two
// "local looks right, live looks broken" incidents for styles.css/main.js.
// The same risk applies to the fonts (referenced by fixed path from inside
// styles.css) and the logo/favicon (referenced by fixed path from every
// page) — any of these can be swapped in place (a rebrand, a font subset
// change) without ever getting a new filename. Appending a hash of the
// actual file content makes every change produce a brand new URL, so
// stale caches are simply never consulted for the new bytes; nothing to
// invalidate, nothing to expire.
//
// Run this LAST in the build (after css:build/js:build so the hashes
// reflect final content, and after partials:inject/paths:localize so it
// rewrites the final relative hrefs actually shipped on each page).
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.claude', '_source', 'scripts', 'src']);

// Self-hosted webfonts, referenced by fixed relative path from inside the
// compiled assets/css/styles.css (not from HTML), so they're versioned by
// rewriting the CSS's own url(...) references rather than HTML attributes.
const FONT_FILES = [
  'assets/fonts/space-grotesk-variable.woff2',
  'assets/fonts/hanken-grotesk-variable.woff2',
  'assets/fonts/jetbrains-mono-500.woff2',
  'assets/fonts/icons/fa-solid-900.woff2',
  'assets/fonts/icons/fa-brands-400.woff2',
];

// Sitewide identity assets referenced by fixed filename from HTML across
// (nearly) every page via the shared nav/footer partials and per-page
// <head> favicon/JSON-LD.
const IMAGE_FILES = [
  'assets/img/favicon.svg',
  'assets/img/lste-logo-white.svg',
  'assets/img/lste-logo.svg',
];

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
  // Fonts are referenced from inside styles.css itself, not from HTML —
  // hash each font file and rewrite the CSS's own url(...) references
  // first, then hash the CSS *after* that rewrite so styles.css's own
  // ?v= reflects its true final bytes.
  let cssText = await readFile(path.join(ROOT, 'assets/css/styles.css'), 'utf8');
  const fontHashes = {};
  for (const rel of FONT_FILES) {
    const buf = await readFile(path.join(ROOT, rel));
    const hash = shortHash(buf);
    fontHashes[rel] = hash;
    const filename = path.basename(rel);
    const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cssText = cssText.replace(
      new RegExp(`(${escaped})(\\?v=[a-f0-9]+)?(\\))`, 'g'),
      `$1?v=${hash}$3`
    );
  }
  await writeFile(path.join(ROOT, 'assets/css/styles.css'), cssText, 'utf8');

  const [cssBuf, jsBuf] = await Promise.all([
    readFile(path.join(ROOT, 'assets/css/styles.css')),
    readFile(path.join(ROOT, 'assets/js/main.js')),
  ]);
  const cssHash = shortHash(cssBuf);
  const jsHash = shortHash(jsBuf);

  const imageHashes = {};
  for (const rel of IMAGE_FILES) {
    const buf = await readFile(path.join(ROOT, rel));
    imageHashes[rel] = shortHash(buf);
  }

  const files = await findHtmlFiles(ROOT);
  let changed = 0;
  for (const file of files) {
    const original = await readFile(file, 'utf8');
    let updated = original
      .replace(/(styles\.css)(\?v=[a-f0-9]+)?(")/g, `$1?v=${cssHash}$3`)
      .replace(/(main\.js)(\?v=[a-f0-9]+)?(")/g, `$1?v=${jsHash}$3`);
    // Font <link rel="preload"> hints must carry the same ?v= as the
    // font url(...) inside styles.css, or the preloaded URL won't match
    // what the browser actually requests once the CSS applies — silently
    // wasting the preload instead of speeding up first paint.
    for (const rel of [...FONT_FILES, ...IMAGE_FILES]) {
      const hash = fontHashes[rel] ?? imageHashes[rel];
      const filename = path.basename(rel);
      const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      updated = updated.replace(
        new RegExp(`(${escaped})(\\?v=[a-f0-9]+)?(")`, 'g'),
        `$1?v=${hash}$3`
      );
    }
    if (updated !== original) {
      await writeFile(file, updated);
      changed++;
    }
  }
  console.log(`Versioned styles.css (${cssHash}), main.js (${jsHash}), ${FONT_FILES.length} font(s), and ${IMAGE_FILES.length} logo/favicon image(s) across ${changed}/${files.length} page(s).`);
}

main();
