// Renders the News & Press cards from src/news/items.json:
//   - news/index.html: the category filters and every item, newest first,
//     between <!--NEWS_ITEMS_START--> and <!--NEWS_ITEMS_END-->;
//   - index.html: the homepage carousel, between <!--HOME_NEWS_START--> and
//     <!--HOME_NEWS_END-->, with the HOME_MAX newest items hosted on lste.lu
//     (LinkedIn picks stay off the homepage, which has its own LinkedIn strip).
//
// One item = one card. Fields:
//   id            unique, the slug for internal articles
//   date          YYYY-MM-DD
//   category      lste-news | speakers-sessions | community | press-coverage
//   source_type   internal (on lste.lu) | press (a media article reproduced on
//                 lste.lu) | linkedin | external (any other site)
//   content_type  article | video | interview | post
//   title, excerpt
//   url           /news/<slug>/ for lste.lu pages, a full URL otherwise
//   image         { src, width, height, alt } plus one of:
//                   variants: true  -> assets/img/<src>-400|800.avif/webp/jpg
//                   variants: false -> assets/img/<src>.avif/webp/jpg
//                   external: true  -> src is a full URL (LinkedIn thumbnail)
//                 and logo: true for a logo on white instead of a photo,
//                 focus_y: 0-100 to frame a portrait picture on the face
//   source_name   optional: the media or site name (press, external)
//   author        optional: person and/or organisation
//   cta           optional: overrides the default call to action
//
// LinkedIn is a source, never a category: a LinkedIn post is filed under
// the editorial category it belongs to and labelled "· LinkedIn". News &
// Press shows a hand-picked selection; the full feed is /linkedin/.
//
// Paths are written root-relative; localize-paths.mjs makes them relative
// afterwards, so run this before it (npm run build does).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME_MAX = 6;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CATEGORIES = {
  'lste-news': 'LSTE News',
  'speakers-sessions': 'Speakers & Sessions',
  community: 'Community',
  'press-coverage': 'Press Coverage',
};
const SOURCE_LABELS = { linkedin: 'LinkedIn', external: null, press: null, internal: null };
const CONTENT_LABELS = { video: 'Video', interview: 'Video interview', post: 'Post', article: null };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function humanDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function picture(image) {
  // Portrait LinkedIn video thumbnails are framed on the speaker's face (see home.css).
  const portrait = image.height > image.width ? ' news-card__media--portrait' : '';
  const cls = image.logo ? 'news-card__media news-card__media--logo' : `news-card__media${portrait}`;
  const alt = esc(image.alt || '');
  // focus_y (0-100) moves the crop down the picture so a face stays in view.
  const focus = image.focus_y !== undefined ? ` style="--focus-y: ${Number(image.focus_y)}%"` : '';
  const size = `width="${image.width}" height="${image.height}"${focus}`;
  if (image.external) {
    return `<img class="${cls}" src="${esc(image.src)}" ${size} loading="lazy" alt="${alt}" decoding="async" referrerpolicy="no-referrer">`;
  }
  const base = `/assets/img/${image.src}`;
  const set = (ext) => (image.variants ? `${base}-400.${ext} 400w, ${base}-800.${ext} 800w` : `${base}.${ext}`);
  const sizes = image.variants ? ' sizes="(max-width: 480px) 400px, 800px"' : '';
  const fallback = image.variants ? `${base}-800.jpg` : `${base}.jpg`;
  return `<picture>
            <source type="image/avif" srcset="${set('avif')}"${sizes}>
            <source type="image/webp" srcset="${set('webp')}"${sizes}>
            <img class="${cls}" src="${fallback}" ${size} loading="lazy" alt="${alt}" decoding="async">
          </picture>`;
}

function callToAction(item) {
  if (item.cta) return item.cta;
  if (item.source_type === 'linkedin') return ['video', 'interview'].includes(item.content_type) ? 'Watch on LinkedIn' : 'View on LinkedIn';
  if (item.source_type === 'press') return 'Read article';
  if (item.source_type === 'external') return 'Visit source';
  return 'Read more';
}

function card(item) {
  const category = CATEGORIES[item.category];
  if (!category) throw new Error(`${item.id}: unknown category "${item.category}"`);
  const external = /^https?:\/\//.test(item.url);
  const source = SOURCE_LABELS[item.source_type];
  const tag = `<span class="news-tag news-tag--${item.category}">${esc(category)}${source ? `<span class="news-tag__source"> · ${source}</span>` : ''}</span>`;
  // The line that says where the content comes from and what it is.
  const meta = [item.source_name, CONTENT_LABELS[item.content_type], item.author].filter(Boolean);
  const label = callToAction(item);
  const link = external
    ? `<a class="news-link" href="${esc(item.url)}" target="_blank" rel="noopener" aria-label="${esc(`${label}: ${item.title} (opens in a new tab)`)}">${esc(label)} <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`
    : `<a class="news-link" href="${item.url}">${esc(label)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
  const portrait = item.image.height > item.image.width ? ' news-card--portrait' : '';
  return `<article class="card news-card${portrait}" data-category="${item.category}" data-source-type="${item.source_type}" data-content-type="${item.content_type}">
          ${picture(item.image)}
          <div class="news-card__top">
            <p class="news-date"><time datetime="${item.date}">${humanDate(item.date)}</time></p>
            ${tag}
          </div>
          <div class="news-card__body">
            <h3>${esc(item.title)}</h3>
            <p class="text-muted news-card__excerpt">${esc(item.excerpt)}</p>${meta.length ? `
            <p class="news-card__meta">${meta.map(esc).join(' · ')}</p>` : ''}
            ${link}
          </div>
        </article>`;
}

function filters() {
  const buttons = [['all', 'All'], ...Object.entries(CATEGORIES)]
    .map(([id, label]) => `<button type="button" class="filter-chip" data-news-filter="${id}" aria-pressed="${id === 'all'}">${esc(label)}</button>`)
    .join('\n        ');
  // Hidden until main.js wires it up: without JavaScript every card shows.
  return `<div class="filter-chips news-filters" role="group" aria-label="Filter by category" hidden>
        ${buttons}
      </div>`;
}

function between(html, file, start, end, content) {
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i === -1 || j === -1 || j < i) throw new Error(`${file}: missing ${start} / ${end}`);
  return html.slice(0, i + start.length) + '\n' + content + '\n' + html.slice(j);
}

async function main() {
  const items = JSON.parse(await readFile(path.join(ROOT, 'src/news/items.json'), 'utf8'))
    .sort((a, b) => b.date.localeCompare(a.date));
  const ids = new Set();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`duplicate id ${item.id}`);
    ids.add(item.id);
  }

  const newsPath = path.join(ROOT, 'news/index.html');
  let news = await readFile(newsPath, 'utf8');
  news = between(news, 'news/index.html', '<!--NEWS_ITEMS_START-->', '<!--NEWS_ITEMS_END-->', `      ${filters()}
      <p class="sr-only" id="news-filter-status" aria-live="polite"></p>
      <div class="grid grid--3 reveal news-grid">
        ${items.map(card).join('\n\n        ')}
      </div>
      <p class="news-more" data-news-show="all community"><a class="news-link" href="/linkedin/">Explore all LSTE LinkedIn updates <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></p>
      `);
  await writeFile(newsPath, news);

  const homePath = path.join(ROOT, 'index.html');
  let home = await readFile(homePath, 'utf8');
  const latest = items.filter((item) => item.source_type !== 'linkedin').slice(0, HOME_MAX);
  home = between(home, 'index.html', '<!--HOME_NEWS_START-->', '<!--HOME_NEWS_END-->', `        ${latest.map(card).join('\n        ')}
        `);
  await writeFile(homePath, home);

  console.log(`Rendered ${items.length} news items (${latest.length} on the homepage).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
