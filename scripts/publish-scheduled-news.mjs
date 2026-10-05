// Publishes the weekly blog articles queued in src/news-queue/ once their
// date has come. Run every Tuesday at 09:00 (Luxembourg) by
// .github/workflows/publish-weekly-news.yml; safe to run by hand any time.
//
// Each entry of src/news-queue/schedule.json is one ready-made article page
// (src/news-queue/<slug>/index.html). When an entry's `publish` date is today
// or earlier (Luxembourg time) and news/<slug>/ does not exist yet, this:
//   1. copies the page to news/<slug>/index.html,
//   2. adds its card at the top of /news/ and of the homepage news carousel
//      (the carousel keeps the HOMEPAGE_MAX newest cards),
//   3. adds it to sitemap.xml,
//   4. re-runs inject-partials, localize-paths and version-assets so the new
//      page gets the current nav/footer and asset hashes even if those
//      changed after it was queued.
// Already-published entries are skipped, so running it twice does nothing.
// src/ is excluded from Jekyll, so a queued article is not reachable on the
// live site before its date.
//
//   node scripts/publish-scheduled-news.mjs                    # today
//   node scripts/publish-scheduled-news.mjs --date 2026-10-19  # pretend it's that day
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUEUE = path.join(ROOT, 'src/news-queue');
const HOMEPAGE_MAX = 6;
const MARKER = '<!--LATEST_NEWS-->';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function todayInLuxembourg() {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Luxembourg' }).format(new Date());
}

function humanDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

// Same markup as the existing cards; `prefix` is the path back to the site root.
function card(entry, prefix, newsHref) {
  const img = `${prefix}assets/img/${entry.image}`;
  return `<article class="card news-card">
          <picture>
          <source type="image/avif" srcset="${img}-400.avif 400w, ${img}-800.avif 800w" sizes="(max-width: 480px) 400px, 800px">
          <source type="image/webp" srcset="${img}-400.webp 400w, ${img}-800.webp 800w" sizes="(max-width: 480px) 400px, 800px">
          <img class="news-card__media" src="${img}-800.jpg" width="${entry.width}" height="${entry.height}" loading="lazy" alt="${escapeHtml(entry.alt)}" decoding="async">
        </picture>
          <p class="news-date">${humanDate(entry.publish)}</p>
          <div class="news-card__body">
            <h3>${escapeHtml(entry.title)}</h3>
            <p class="text-muted" style="font-size:0.9rem;">${escapeHtml(entry.excerpt)}</p>
            <a class="news-link" href="${newsHref}">Read more <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
          </div>
        </article>`;
}

function insertAfterMarker(html, file, snippet) {
  if (!html.includes(MARKER)) throw new Error(`${file}: missing ${MARKER} marker`);
  return html.replace(MARKER, `${MARKER}\n        ${snippet}`);
}

// Keeps only the first `max` cards inside the homepage carousel track.
function capCarousel(html, max) {
  const start = html.indexOf(MARKER) + MARKER.length;
  const trackEnd = html.indexOf('\n      </div>', start);
  const cards = html.slice(start, trackEnd).match(/\s*<article class="card news-card">[\s\S]*?<\/article>/g) || [];
  if (cards.length <= max) return html;
  return html.slice(0, start) + cards.slice(0, max).join('') + html.slice(trackEnd);
}

async function main() {
  const dateArg = process.argv.indexOf('--date');
  const today = dateArg !== -1 ? process.argv[dateArg + 1] : todayInLuxembourg();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`Bad date: ${today}`);

  const schedule = JSON.parse(await readFile(path.join(QUEUE, 'schedule.json'), 'utf8'))
    .sort((a, b) => a.publish.localeCompare(b.publish));

  const due = [];
  for (const entry of schedule) {
    if (entry.publish > today) continue;
    if (await exists(path.join(ROOT, 'news', entry.slug, 'index.html'))) continue;
    due.push(entry);
  }
  if (due.length === 0) {
    console.log(`Nothing to publish on ${today}.`);
    return;
  }

  const newsIndexPath = path.join(ROOT, 'news/index.html');
  const homePath = path.join(ROOT, 'index.html');
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let newsIndex = await readFile(newsIndexPath, 'utf8');
  let home = await readFile(homePath, 'utf8');
  let sitemap = await readFile(sitemapPath, 'utf8');

  // Oldest first, so the newest card ends up on top.
  for (const entry of due) {
    const page = await readFile(path.join(QUEUE, entry.slug, 'index.html'), 'utf8');
    await mkdir(path.join(ROOT, 'news', entry.slug), { recursive: true });
    await writeFile(path.join(ROOT, 'news', entry.slug, 'index.html'), page);

    newsIndex = insertAfterMarker(newsIndex, 'news/index.html', card(entry, '../', `${entry.slug}/index.html`));
    home = insertAfterMarker(home, 'index.html', card(entry, './', `./news/${entry.slug}/index.html`));

    const loc = `https://www.lste.lu/news/${entry.slug}/`;
    if (!sitemap.includes(`<loc>${loc}</loc>`)) {
      const anchor = sitemap.match(/  <url><loc>https:\/\/www\.lste\.lu\/news\/<\/loc>.*\n/);
      if (!anchor) throw new Error('sitemap.xml: /news/ entry not found');
      const line = `  <url><loc>${loc}</loc><lastmod>${entry.publish}</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>\n`;
      sitemap = sitemap.replace(anchor[0], anchor[0] + line);
    }
    console.log(`Published ${entry.publish} ${entry.slug}`);
  }

  home = capCarousel(home, HOMEPAGE_MAX);
  for (const loc of ['https://www.lste.lu/', 'https://www.lste.lu/news/']) {
    sitemap = sitemap.replace(
      new RegExp(`(<url><loc>${loc.replace(/[.]/g, '\\.')}</loc><lastmod>)[^<]*`),
      `$1${today}`,
    );
  }

  await writeFile(newsIndexPath, newsIndex);
  await writeFile(homePath, home);
  await writeFile(sitemapPath, sitemap);

  for (const script of ['inject-partials.mjs', 'localize-paths.mjs', 'version-assets.mjs']) {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', script)], { stdio: 'ignore' });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
