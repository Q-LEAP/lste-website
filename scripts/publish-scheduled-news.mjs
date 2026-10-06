// Publishes the weekly blog articles queued in src/news-queue/ once their
// date has come. Run every Tuesday at 09:00 (Luxembourg) by
// .github/workflows/publish-weekly-news.yml; safe to run by hand any time.
//
// Each entry of src/news-queue/schedule.json is one ready-made article page
// (src/news-queue/<slug>/index.html). When an entry's `publish` date is today
// or earlier (Luxembourg time) and news/<slug>/ does not exist yet, this:
//   1. copies the page to news/<slug>/index.html,
//   2. adds it to src/news/items.json (category "community" unless the entry
//      says otherwise) and re-renders the News & Press cards and the homepage
//      carousel with build-news.mjs,
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
const ITEMS = path.join(ROOT, 'src/news/items.json');

function todayInLuxembourg() {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Luxembourg' }).format(new Date());
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

// The News & Press entry for a weekly article (see build-news.mjs).
function newsItem(entry) {
  return {
    id: entry.slug,
    date: entry.publish,
    category: entry.category || 'community',
    source_type: 'internal',
    content_type: 'article',
    title: entry.title,
    excerpt: entry.excerpt,
    url: `/news/${entry.slug}/`,
    image: { src: entry.image, variants: true, width: entry.width, height: entry.height, alt: entry.alt },
    ...(entry.author ? { author: entry.author } : {}),
  };
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

  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let sitemap = await readFile(sitemapPath, 'utf8');
  const items = JSON.parse(await readFile(ITEMS, 'utf8'));

  for (const entry of due) {
    const page = await readFile(path.join(QUEUE, entry.slug, 'index.html'), 'utf8');
    await mkdir(path.join(ROOT, 'news', entry.slug), { recursive: true });
    await writeFile(path.join(ROOT, 'news', entry.slug, 'index.html'), page);

    if (!items.some((item) => item.id === entry.slug)) items.unshift(newsItem(entry));

    const loc = `https://www.lste.lu/news/${entry.slug}/`;
    if (!sitemap.includes(`<loc>${loc}</loc>`)) {
      const anchor = sitemap.match(/  <url><loc>https:\/\/www\.lste\.lu\/news\/<\/loc>.*\n/);
      if (!anchor) throw new Error('sitemap.xml: /news/ entry not found');
      const line = `  <url><loc>${loc}</loc><lastmod>${entry.publish}</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>\n`;
      sitemap = sitemap.replace(anchor[0], anchor[0] + line);
    }
    console.log(`Published ${entry.publish} ${entry.slug}`);
  }

  for (const loc of ['https://www.lste.lu/', 'https://www.lste.lu/news/']) {
    sitemap = sitemap.replace(
      new RegExp(`(<url><loc>${loc.replace(/[.]/g, '\\.')}</loc><lastmod>)[^<]*`),
      `$1${today}`,
    );
  }

  await writeFile(ITEMS, JSON.stringify(items, null, 2) + '\n');
  await writeFile(sitemapPath, sitemap);

  for (const script of ['build-news.mjs', 'inject-partials.mjs', 'localize-paths.mjs', 'version-assets.mjs']) {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', script)], { stdio: 'ignore' });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
