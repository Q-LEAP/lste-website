// Adds a BreadcrumbList JSON-LD block to every page that already renders a
// visible <nav class="breadcrumb">, by mirroring that same nav's links —
// no facts invented, just the existing breadcrumb re-expressed as schema.
//
// Skips: pages with no breadcrumb nav, pages already carrying a
// BreadcrumbList block (idempotent), and pages marked noindex (a hidden
// page shouldn't get rich-result markup search engines won't render).
//
// Re-run this after adding a new page with a breadcrumb — it's safe to
// run repeatedly; already-processed pages are left untouched.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.claude', '_source', 'scripts', 'src', 'documentation']);
const SITE_ORIGIN = 'https://lste.lu';

async function findHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      files.push(...(await findHtmlFiles(path.join(dir, entry.name))));
    } else if (entry.name === 'index.html') {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

// Resolves a breadcrumb href (relative to the page's own directory) to an
// absolute https://lste.lu/... URL, the same way a browser would.
function resolveHref(fileDir, href) {
  const resolved = path.normalize(path.join(fileDir, href)).replace(/\\/g, '/');
  const relFromRoot = path.relative(ROOT, resolved).replace(/\\/g, '/');
  if (relFromRoot === 'index.html') return `${SITE_ORIGIN}/`;
  const dirPart = relFromRoot.replace(/index\.html$/, '');
  return `${SITE_ORIGIN}/${dirPart}`;
}

function buildBreadcrumbSchema(fileDir, breadcrumbInner) {
  const items = [];
  const linkRe = /<a href="([^"]+)">([^<]*)<\/a>/g;
  let m;
  while ((m = linkRe.exec(breadcrumbInner))) {
    items.push({ name: decodeEntities(m[2]).trim(), url: resolveHref(fileDir, m[1]) });
  }
  const currentMatch = breadcrumbInner.match(/aria-current="page">([^<]*)</);
  if (currentMatch) {
    items.push({ name: decodeEntities(currentMatch[1]).trim(), url: null });
  }
  if (items.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => {
      const entry = { '@type': 'ListItem', position: i + 1, name: item.name };
      if (item.url) entry.item = item.url;
      return entry;
    }),
  };
}

async function main() {
  const files = await findHtmlFiles(ROOT);
  let changed = 0;
  let skippedNoindex = 0;
  let skippedNoBreadcrumb = 0;
  let skippedExisting = 0;

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    if (html.includes('BreadcrumbList')) { skippedExisting++; continue; }
    if (/<meta name="robots" content="noindex/.test(html)) { skippedNoindex++; continue; }

    const navMatch = html.match(/<nav class="breadcrumb"[^>]*>([\s\S]*?)<\/nav>/);
    if (!navMatch) { skippedNoBreadcrumb++; continue; }

    const schema = buildBreadcrumbSchema(path.dirname(file), navMatch[1]);
    if (!schema) { skippedNoBreadcrumb++; continue; }

    const block = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;
    const headCloseIdx = html.indexOf('</head>');
    const updated = html.slice(0, headCloseIdx) + block + html.slice(headCloseIdx);
    await writeFile(file, updated);
    changed++;
  }

  console.log(`Added BreadcrumbList to ${changed} page(s). Skipped: ${skippedExisting} already had it, ${skippedNoindex} noindex, ${skippedNoBreadcrumb} no breadcrumb.`);
}

main();
