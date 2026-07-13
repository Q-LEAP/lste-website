// Injects the shared nav/footer partials into every page between marker
// comments, so header/footer only ever need editing in one place.
// A page opts in by containing:
//   <!--NAV_START--><!--NAV_END-->
//   <!--FOOTER_START--><!--FOOTER_END-->
// Pages that don't have the markers yet (not migrated to the new design
// system) are left untouched.
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

function injectBetween(html, startTag, endTag, replacement) {
  const start = html.indexOf(startTag);
  const end = html.indexOf(endTag);
  if (start === -1 || end === -1 || end < start) return { html, changed: false };
  const before = html.slice(0, start + startTag.length);
  const after = html.slice(end);
  return { html: `${before}\n${replacement}\n${after}`, changed: true };
}

function markActiveLink(navHtml, pagePath) {
  // pagePath like "/about/" — mark the matching nav link as current.
  const linkRegex = new RegExp(`(href="${pagePath.replace(/\//g, '\\/')}")`, 'g');
  return navHtml.replace(linkRegex, (m) => m).replace(
    new RegExp(`<a class="main-nav-link" href="${pagePath.replace(/\//g, '\\/')}">`),
    `<a class="main-nav-link" aria-current="page" href="${pagePath}">`
  );
}

function pagePathFor(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/index\.html$/, '');
}

async function main() {
  const navPartial = await readFile(path.join(ROOT, 'src/partials/nav.html'), 'utf8');
  const footerPartial = await readFile(path.join(ROOT, 'src/partials/footer.html'), 'utf8');
  const files = await findHtmlFiles(ROOT);

  let migrated = 0;
  let skipped = 0;

  for (const file of files) {
    let html = await readFile(file, 'utf8');
    const pagePath = pagePathFor(file);
    const nav = markActiveLink(navPartial, pagePath);

    let changedAny = false;
    ({ html, changed: changedAny } = injectBetween(html, '<!--NAV_START-->', '<!--NAV_END-->', nav));
    let footerChanged = false;
    ({ html, changed: footerChanged } = injectBetween(html, '<!--FOOTER_START-->', '<!--FOOTER_END-->', footerPartial));

    if (changedAny || footerChanged) {
      await writeFile(file, html);
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`Injected partials into ${migrated} page(s); ${skipped} page(s) skipped (no markers yet).`);
}

main();
