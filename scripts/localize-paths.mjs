// Rewrites root-relative paths (href="/about/", src="/assets/img/x.jpg")
// into path-relative ones (href="../about/", src="../assets/img/x.jpg")
// based on each page's depth from the site root.
//
// Why: authoring with root-relative paths is simplest (no depth math
// needed in source), and it works once deployed to a real domain root.
// But it breaks when a page is opened via file:// or served from a
// subpath, since "/" then means the filesystem/server root, not the
// site root. Running this after every build makes the shipped HTML
// portable regardless of how it's opened, while keeping the source
// (partials, hand-authored pages) simple to write.
//
// Leaves absolute URLs (https://...), protocol-relative (//...),
// mailto:, tel:, and in-page (#...) references untouched.
import { readFile, writeFile, readdir } from 'node:fs/promises';
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

function depthOf(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return rel.split('/').length - 1;
}

function relPrefix(depth) {
  return depth === 0 ? './' : '../'.repeat(depth);
}

// Appends index.html to directory-style links (trailing slash). Plain
// file:// browsing has no server to supply a default document, so a
// link to ".../about/" opens a blank directory listing instead of the
// page — this makes every internal link resolve to a real file.
function withIndexIfDir(pathPart) {
  return pathPart.endsWith('/') ? pathPart + 'index.html' : pathPart;
}

function rewriteOne(url, prefix) {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  const stripped = url.slice(1);
  if (stripped === '') return withIndexIfDir(prefix);
  const hashIdx = stripped.indexOf('#');
  if (hashIdx === -1) return withIndexIfDir(prefix + stripped);
  const beforeHash = stripped.slice(0, hashIdx);
  const hash = stripped.slice(hashIdx);
  return withIndexIfDir(prefix + beforeHash) + hash;
}

function rewriteHtml(html, depth) {
  const prefix = relPrefix(depth);

  html = html.replace(/(href|src)="(\/[^"]*)"/g, (m, attr, url) => `${attr}="${rewriteOne(url, prefix)}"`);

  html = html.replace(/srcset="([^"]*)"/g, (m, list) => {
    const rewritten = list
      .split(',')
      .map((part) => {
        const trimmed = part.trim();
        const spaceIdx = trimmed.indexOf(' ');
        const url = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
        const rest = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx);
        return rewriteOne(url, prefix) + rest;
      })
      .join(', ');
    return `srcset="${rewritten}"`;
  });

  html = html.replace(/content="(0; url=)(\/[^"]*)"/g, (m, pfx, url) => `content="${pfx}${rewriteOne(url, prefix)}"`);

  return html;
}

const EXTERNAL_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:', '//', '#'];

// Second, independently-idempotent pass: appends index.html to any
// internal directory-style link, whether it's already root-relative
// ("/about/") or path-relative ("../about/", "about/"). Needed because
// the first pass only fires on root-relative "/..." — once a page has
// already been through this build once, its links no longer start
// with "/", so this pass is what actually catches them on a rerun.
function fixDirLinks(html) {
  html = html.replace(/(href|src)="([^"]*)"/g, (m, attr, url) => {
    if (!url || EXTERNAL_PREFIXES.some((p) => url.startsWith(p))) return m;
    const hashIdx = url.indexOf('#');
    const beforeHash = hashIdx === -1 ? url : url.slice(0, hashIdx);
    const hash = hashIdx === -1 ? '' : url.slice(hashIdx);
    if (!beforeHash.endsWith('/')) return m;
    return `${attr}="${beforeHash}index.html${hash}"`;
  });

  html = html.replace(/content="(0; url=)([^"]*)"/g, (m, pfx, url) => {
    if (!url || EXTERNAL_PREFIXES.some((p) => url.startsWith(p)) || !url.endsWith('/')) return m;
    return `content="${pfx}${url}index.html"`;
  });

  return html;
}

async function main() {
  const files = await findHtmlFiles(ROOT);
  let changed = 0;
  for (const file of files) {
    const original = await readFile(file, 'utf8');
    const rewritten = fixDirLinks(rewriteHtml(original, depthOf(file)));
    if (rewritten !== original) {
      await writeFile(file, rewritten);
      changed++;
    }
  }
  console.log(`Localized paths in ${changed}/${files.length} page(s).`);
}

main();
