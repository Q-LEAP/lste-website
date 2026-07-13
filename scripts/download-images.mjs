// Downloads every hotlinked image referenced by the site once, into
// assets/img/source/, and writes assets/img/manifest.json mapping the
// original URL (as referenced in HTML) to its local source filename.
// Run once; re-run is safe (skips files that already exist).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'assets/img/source');
const MANIFEST_PATH = path.join(ROOT, 'assets/img/manifest.json');
const URL_LIST_PATH = path.join(ROOT, 'scripts/_image-urls.txt');

function localNameFor(url) {
  const u = new URL(url);
  const base = path.basename(u.pathname).replace(/[^a-zA-Z0-9._-]/g, '-');
  return base;
}

async function downloadOne(url) {
  const name = localNameFor(url);
  const dest = path.join(SRC_DIR, name);
  if (existsSync(dest)) return { url, name, status: 'cached' };
  try {
    const res = await fetch(url);
    if (!res.ok) return { url, name, status: `http-${res.status}` };
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return { url, name, status: `bad-content-type-${contentType}` };
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    return { url, name, status: 'downloaded' };
  } catch (err) {
    return { url, name, status: `error-${err.message}` };
  }
}

async function pool(items, size, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: size }, worker));
  return results;
}

async function main() {
  await mkdir(SRC_DIR, { recursive: true });
  const urls = (await readFile(URL_LIST_PATH, 'utf8'))
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const results = await pool(urls, 6, downloadOne);

  const manifest = {};
  for (const r of results) manifest[r.url] = r.name;
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const failed = results.filter((r) => r.status.startsWith('error') || r.status.startsWith('http'));
  console.log(`Downloaded/cached ${results.length - failed.length}/${results.length} images.`);
  if (failed.length) {
    console.log('Failed:');
    failed.forEach((f) => console.log(`  ${f.status}  ${f.url}`));
  }
}

main();
