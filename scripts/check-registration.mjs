// Health check for the registration funnel — the one path on this site that
// leaves our control entirely.
//
// Why this exists: on 2026-09-17 every "Register for free" button on the site
// led to an Internal Server Error for an unknown number of days. Nothing in
// this repo had changed; the Odoo tenant that actually hosts the registration
// form had started returning HTTP 500 on *every* event detail page. We only
// found out because a prospective attendee gave up and emailed us. The site is
// static and deploys fine whatever Odoo does, so no build, no test and no
// deploy log could ever have caught it — the funnel can rot silently while
// every page we serve stays green.
//
// So this probe walks the funnel the way a visitor does: it reads the real
// registration URLs out of the shipped HTML (no hardcoded list to drift out of
// sync), follows them to their final destination, and asserts the visitor
// lands on a live registration page rather than an error, a login wall or a
// silent bounce back to the events listing.
//
// Run locally:  npm run check:register
// In CI:        .github/workflows/registration-healthcheck.yml (every 15 min)
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Mirror the build scripts' exclusions, plus documentation/: the 2026 programme
// draft in there carries the same CTA markup but is never published, so a stale
// link in a draft must not page anyone at 3am.
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.github', '.claude', '_source', 'src', 'scripts', 'documentation',
]);

// The external host the funnel hands off to. Anything pointing here is a
// registration link and gets probed; keeping this as a pattern rather than a
// full URL means a slug rename in Odoo (which has already happened once:
// luxembourg-software-testing-event-2026-24 became inscription-lste2026-24)
// is picked up automatically on the next run.
const TICKETING_HOST = 'q-leap.odoo.com';

// Pages we serve ourselves that carry the CTA. If one of these 404s the button
// is unreachable, which is just as broken as the button being dead.
const OWN_PAGES = [
  'https://www.lste.lu/',
  'https://www.lste.lu/register/',
];

// A served error page is still an HTTP response, and Odoo/nginx will happily
// return one with a 200 in some configurations. Treat these as hard failures
// wherever they appear in the body.
const ERROR_MARKERS = [
  'Internal Server Error',
  'Odoo Server Error',
  'Service Unavailable',
  '503 Service',
  'Bad Gateway',
];

// Signals that a registration page actually rendered its form rather than an
// empty shell. Missing markers are reported as a warning, not a failure: Odoo
// rewrites this markup between versions, and a false alarm every 15 minutes
// would get the whole check muted within a week.
const FORM_MARKERS = ['<form', 'register', 'ticket'];

const TIMEOUT_MS = 20_000;
const RETRIES = 3;          // a single blip is not an outage
const RETRY_DELAY_MS = 5_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function collectHtmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      out.push(...await collectHtmlFiles(full));
    } else if (entry.name.endsWith('.html') && !entry.name.startsWith('._')) {
      out.push(full);
    }
  }
  return out;
}

// Returns a Map of ticketing URL -> sorted list of repo-relative pages using it,
// so a failure report can name every page a visitor could have clicked from.
async function findTicketingUrls() {
  const files = await collectHtmlFiles(ROOT);
  const pattern = new RegExp(`https://${TICKETING_HOST.replace(/\./g, '\\.')}/[^"'\\s<>]+`, 'g');
  const found = new Map();
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    for (const url of html.match(pattern) ?? []) {
      const clean = url.replace(/[.,)]+$/, '');
      if (!found.has(clean)) found.set(clean, new Set());
      found.get(clean).add(path.relative(ROOT, file));
    }
  }
  return new Map(
    [...found].map(([url, pages]) => [url, [...pages].sort()]),
  );
}

async function fetchOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      // Odoo varies its response by user agent for some bot traffic; look like
      // the browser of the attendee whose experience we are asserting.
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
          + '(KHTML, like Gecko) Chrome/128.0 Safari/537.36 LSTE-healthcheck/1.0 (+https://www.lste.lu/)',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
    });
    const body = await res.text();
    return { status: res.status, finalUrl: res.url, body };
  } finally {
    clearTimeout(timer);
  }
}

// Retries only on outcomes that could plausibly be transient. A clean 404 is
// a real answer and retrying it three times just delays the alert.
async function fetchWithRetry(url) {
  let last;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      last = await fetchOnce(url);
      if (last.status < 500) return last;
    } catch (err) {
      last = { status: 0, finalUrl: url, body: '', error: err.message };
    }
    if (attempt < RETRIES) await sleep(RETRY_DELAY_MS);
  }
  return last;
}

// Odoo unpublishing an event does not 404 — it 302s to the events listing,
// which is a healthy 200 page. That bounce is the silent failure mode this
// check exists for, so the event id has to survive the redirect chain.
function eventIdOf(url) {
  return url.match(/\/event\/(?:[^/?#]*-)?(\d+)(?:[/?#]|$)/)?.[1] ?? null;
}

function checkTicketingUrl(url, result) {
  const failures = [];
  const warnings = [];

  if (result.error) {
    failures.push(`request failed: ${result.error}`);
    return { failures, warnings };
  }
  if (result.status !== 200) {
    failures.push(`HTTP ${result.status} (expected 200)`);
  }
  for (const marker of ERROR_MARKERS) {
    if (result.body.includes(marker)) failures.push(`error page served: "${marker}" found in body`);
  }

  const expectedId = eventIdOf(url);
  const actualId = eventIdOf(result.finalUrl);
  if (expectedId && actualId !== expectedId) {
    failures.push(
      `redirected off the event (expected event id ${expectedId}, landed on `
      + `${actualId ? `id ${actualId}` : 'a non-event page'}: ${result.finalUrl}) — `
      + 'the event is most likely unpublished or its date has passed',
    );
  }

  // A live Odoo event page is tens of KB. Anything tiny is a stub or an error.
  if (result.status === 200 && result.body.length < 2000) {
    failures.push(`suspiciously small response (${result.body.length} bytes)`);
  }

  const lower = result.body.toLowerCase();
  if (result.status === 200 && !FORM_MARKERS.some((m) => lower.includes(m))) {
    warnings.push('page loaded but no registration form markers found — worth an eyeball');
  }
  if (result.finalUrl !== url) {
    warnings.push(`redirected to ${result.finalUrl} — the link in the HTML is stale, update it`);
  }
  return { failures, warnings };
}

async function main() {
  const ticketingUrls = await findTicketingUrls();
  const problems = [];
  const notes = [];

  if (ticketingUrls.size === 0) {
    problems.push(`No ${TICKETING_HOST} link found in any published page — the CTA has lost its href.`);
  }

  console.log(`Registration health check — ${new Date().toISOString()}\n`);

  for (const [url, pages] of ticketingUrls) {
    const result = await fetchWithRetry(url);
    const { failures, warnings } = checkTicketingUrl(url, result);
    const label = failures.length ? 'FAIL' : warnings.length ? 'WARN' : 'OK  ';
    console.log(`${label}  ${url}`);
    console.log(`      HTTP ${result.status}${result.finalUrl !== url ? ` -> ${result.finalUrl}` : ''}`);
    console.log(`      linked from ${pages.length} page(s): ${pages.join(', ')}`);
    for (const f of failures) {
      console.log(`      ✗ ${f}`);
      problems.push(`${url}\n    ✗ ${f}\n    linked from: ${pages.join(', ')}`);
    }
    for (const w of warnings) {
      console.log(`      ! ${w}`);
      notes.push(`${url}\n    ! ${w}`);
    }
    console.log('');
  }

  for (const url of OWN_PAGES) {
    const result = await fetchWithRetry(url);
    const ok = result.status === 200 && !result.error;
    console.log(`${ok ? 'OK  ' : 'FAIL'}  ${url}\n      HTTP ${result.status}\n`);
    if (!ok) {
      problems.push(`${url}\n    ✗ HTTP ${result.status}${result.error ? ` (${result.error})` : ''} — the page carrying the CTA is itself down`);
    }
  }

  if (notes.length) {
    console.log(`\n${notes.length} warning(s):\n`);
    for (const n of notes) console.log(`  ${n}\n`);
  }

  if (problems.length) {
    console.error(`\nREGISTRATION IS BROKEN — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error(`  ${p}\n`);
    process.exitCode = 1;
    return;
  }

  console.log('Registration funnel is healthy.');
}

main().catch((err) => {
  console.error(`Health check crashed: ${err.stack ?? err.message}`);
  process.exitCode = 1;
});
