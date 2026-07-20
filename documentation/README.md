# LSTE website — documentation & source materials

> ⚠️ **BEFORE GOING LIVE:** as of 2026-07-20, every single page carries
> `<meta name="robots" content="noindex, nofollow">` and `robots.txt` is set
> to `Disallow: /` — done deliberately because this build isn't at its
> official URL yet. **Both must be reverted** (remove the meta tag
> site-wide, restore `robots.txt`'s `Allow: /` + per-directory disallows)
> before the real launch, or the site will never get indexed. See the
> dated note near the bottom of this file for the exact prior `robots.txt`
> contents to restore.

This folder is the single place to check before making any significant
content change to the site. It holds source materials (old programmes,
flyers) and a running record of facts that were verified against official
sources, so future edits stay consistent instead of drifting or re-inventing
content that already exists somewhere official.

**Rule of thumb:** if a change touches copy, dates, the venue, sponsors, or
historical editions, read this file first and cross-check against
`archives/` and the live site (lste.lu) before writing anything.

## What's here

- `archives/` — PDF programmes and flyers recovered from past editions:
  - `A5-programme_C01-2016.pdf`, `programme_C04-2016.pdf`, `verso_A5 14,8 x 21cm 2016.pdf` — 2016 edition programme (used to build `previous-editions/edition-2016/`).
  - `flyer.lste 2019.pdf` — 2019 edition flyer.
  - `Program LSTE 2024 (1).pdf`, `Program LSTE_Tuto_2024JPG.pdf` — 2024 edition programme and tutorial track.
  - `LSTE-Program-2025 1.pdf` — 2025 edition programme.
  - A `LSTE 2018/` and `LSTE 2019/` folder (Masterslide/programme decks, sponsoring
    PDFs, photos) were supplied on 2026-07-17, used to build
    `previous-editions/edition-2018/` and `edition-2019/`, and then deleted per
    the client's instruction once their useful content was extracted — see
    "Verified facts" below for what was pulled from them. The best ~12/~9
    photos from each were moved into `assets/img/source/` (prefixed
    `LSTE-2018-…` / `LSTE-2019-…`) and the rest (RAW files, budgets, attendee
    lists, sponsorship contracts, PSD/AI design files) were deleted — not
    kept anywhere, so don't expect to find them again if more detail is
    needed later than what's recorded here.

## What's NOT here (known gaps — don't invent to fill them)

- **No PPTX** was found or supplied. Any task that references "the PPTX" as a
  source has not been fully completed — content that would normally come
  from it (pricing-free brochure copy, page-5 structure, etc.) was instead
  cross-checked against the live lste.lu site where possible, and left as a
  documented gap otherwise.
- **No photos from Marie (Teams)** were found or supplied.
- **No Q-Leap team photo** was found or supplied — `about/index.html` still
  shows the Q-Leap logo where a team photo was requested (see the `TODO`
  comment next to that image).
- No official archives were found for the 2014, 2017, or 2018 editions
  beyond a bare listing on lste.lu/previous-editions — those years show a
  QA-themed empty state on the site rather than fabricated content.

## Verified facts (session of 2026-07-17)

Cross-checked directly against the live lste.lu pages (view-source, not
paraphrased) and third-party listings. Treat these as authoritative until
someone confirms otherwise from Q-Leap directly.

- **Official 2026 venue:** Conference Center, Hôtel Parc Belle-Vue —
  5 Avenue Marie-Thérèse, L-2132 Luxembourg (Luxembourg City, near the
  Hamilius tram/bus stop). This is the SAME venue as the 2025 edition.
  Do not confuse with Q-Leap SA's own office address (10B rue des
  mérovingiens, L-8070 Bertrange) used on the Contact page — that's the
  organiser's HQ, not the event venue.
- **Real edition history** (per lste.lu/previous-editions): 2014, 2016,
  2017, 2018, 2019, 2024, 2025 — 7 editions total. No LSTE was held in 2015
  or 2020–2023. The site previously and incorrectly listed 2021/2022/2023 as
  real editions ("since 2018") — this was fabricated and has been corrected.
- **2024 edition:** 14 November 2024, Digital Learning Hub, Esch-Belval —
  6th edition, theme "Continuous Quality."
- **2025 edition:** 27 November 2025, Parc Belle-Vue, Luxembourg City — 7th
  edition, theme "AI & the Future of Quality."
- **2019 edition** (from the now-deleted `LSTE 2019/` folder): 5th edition,
  Thursday 10 October 2019, 17:30–20:30, House of Startups (9 rue du
  Laboratoire, Luxembourg-city). 150+ registrations, 80 companies (per the
  event's own opening slide). Sponsors: Q-Leap, Docler Holding, Neotys,
  Luxembourg-City Incubator, Hacknowledge, GASQ, House of Startups. No
  ticket prices were carried over onto the site (site-wide no-pricing rule).
- **2018 edition** (from the now-deleted `LSTE 2018/` folder): 4th edition,
  Thursday 4 October 2018 (date confirmed via photo EXIF, matching the
  programme deck's own title slide). 120+ attendees, 88 organizations per
  the 2019 sponsoring deck's retrospective table (the day-of deck itself
  said "115 attendees / 70 organizations" — a minor real-source discrepancy;
  the more official-looking retrospective number was used). Sponsors: Q-Leap,
  Docler Holding, Neotys, Luxair Group. **No venue name was found in any
  surviving material** — don't invent one if asked to fill it in later.
- **History table (2014→2018), from the 2019 sponsoring deck:** 2014: 60
  attendees / 35 orgs. 2016: 75 / 40. 2017: 100 / 55. 2018: 120 / 88. Used to
  fill in the previously-empty attendee counts on the 2014/2016/2017 cards
  on `previous-editions/index.html`.
- **Official "About the Event" copy** (lste.lu/about, meaning/content
  verbatim): headings "Who we are" / "The unique testing event in
  Luxembourg" and "For who" / "For all testers and IT practitioners", plus
  the Q-LEAP organiser paragraph. This copy was ported into
  `about/index.html` — do not rewrite it freely; if it needs to change,
  re-pull from the live page first.
  - Note: the live page has a few small typos ("uNique", "PASSIONNATE",
    "practioners") that were silently corrected for spelling only during
    the 2026-07-17 UX/DA review pass — the wording and meaning are
    otherwise unchanged from the official source.
- **Sponsors (2026, confirmed only):** Q-Leap. Every other sponsor
  previously listed (Deloitte, NSI, Sogeti, AINOS, Xray, Thales, Uni.lu,
  SQAI Suite, Tricentis, SnT, Q-Guard, jemmic, Q-Bot, Luxembourg Testing
  Board, Silicon Luxembourg, GASQ, ITNation) sponsored a past edition but is
  **not yet confirmed for 2026**. Their logo assets are kept in
  `assets/img/` unreferenced so they can be re-added quickly once/if they
  confirm — do not delete those image files.
- **Sponsorship tiers:** Platinium / Gold / Silver (Bronze retired).
- **Full-day structure** (from the live schedule page, used as the closest
  real substitute for the unavailable PPTX page 5): Morning Tutorials from
  10:00 (optional, limited seats — never mention the price; the CTA should
  only invite people to contact hello@lste.lu for the brochure), Exhibition
  Area from 13:00, Keynote Room from 13:30, Demo Room from 14:00, Networking
  Cocktail from 19:00.

## Formspree setup (contact form + newsletter)

Both `contact/index.html` and the newsletter form in `news/index.html` post
to a placeholder Formspree ID (`REPLACE_WITH_YOUR_FORMSPREE_ID`) and will
silently fail until real IDs are set:

1. Create one Formspree form per use case (contact, newsletter) at
   https://formspree.io, with `hello@lste.lu` as the recipient.
2. Swap each form's `action="https://formspree.io/f/REPLACE_WITH_YOUR_FORMSPREE_ID"`
   for the real endpoint Formspree gives you.
3. Submit a real test message on each form and confirm delivery.

## Social media

LinkedIn has no public, partnership-free way to auto-sync a company page's
post feed onto a third-party site — that requires the Community Management
API (registered business + LinkedIn app approval + a backend to hold OAuth
tokens). YouTube uploads CAN be auto-embedded, but need the channel's
numeric Channel ID (not the `@LSTElu` handle) — see the HTML comment above
the "Never miss an update" section in `news/index.html` for the exact
iframe snippet to drop in once that ID is available.

### LinkedIn Updates page (`/linkedin/`)

Per Q-Leap's decision (2026-07-17), individual posts are embedded manually —
there's no public auto-sync feed API. LinkedIn's post embed is also a
cross-origin iframe (its internals can't be restyled with CSS), so rather
than showing 11 raw LinkedIn embeds back to back, the page shows a clean
grid of preview-image cards (LinkedIn bakes a play button into video
thumbnails itself) with the caption revealed on hover; clicking a card
opens the real, playable LinkedIn embed in an on-site modal (lazy-loaded —
the iframe `src` is only set when a card is clicked, and cleared on close).

This page ships with 11 real posts (added 2026-07-17 from URLs supplied
directly by the client). To add a new one:

1. From the post's share URL (e.g. from "Copy link to post"), the number
   after `-activity-` is the activity ID —
   `.../posts/luxembourg-software-testing-event_xxx-activity-7475793676074455040-WD34`
   → activity ID `7475793676074455040`.
2. Fetch `https://www.linkedin.com/embed/feed/update/urn:li:activity:ACTIVITY_ID`
   (loads without login) and read its `<meta property="og:image">` and
   `<meta property="og:description">` tags for the real thumbnail URL and
   caption — **never invent these**, always pull them from the real page.
3. Add a new card at the **top** of `.linkedin-grid` in `linkedin/index.html`
   (posts are shown newest-first; the activity ID is a reliable proxy for
   order — higher = newer):
   ```html
   <button type="button" class="linkedin-card" data-activity="ACTIVITY_ID" aria-label="Open LinkedIn post: EXCERPT">
     <img src="OG_IMAGE_URL" alt="" loading="lazy">
     <span class="linkedin-card__overlay"><span class="linkedin-card__excerpt">EXCERPT</span></span>
   </button>
   ```

Only **public** posts can be embedded this way. If an author deletes the
original post, both its thumbnail and the modal embed break — remove the
card when that happens.

## News page (`/news/`)

As of 2026-07-17, the 6 articles listed on `/news/` are fully self-hosted
(no more "Read on lste.lu" external links) — this was done ahead of the
lste.lu WordPress site being decommissioned once the HTML migration is
complete. Each card links to a local `news/<slug>/index.html` page that
reproduces the original article's real text and photo, styled with the
site's own `.article-body`/`.article-meta`/`.article-hero-img` classes
(defined in `src/css/pages/inner.css`, reusing the `.policy-body` prose
layout). Source content was pulled from lste.lu's `/press/` articles
(now offline) — nothing here is invented.

The 6 slugs, in the order shown on `/news/`:

1. `avanti-sharma-mc` — Avanti Sharma announced as MC for LSTE 2025
2. `lste-2025-ai-7th-edition` — LSTE 2025: AI at the heart of the 7th edition
3. `digital-colleague` — Learning how to live with the digital colleague (Dr. Anne Kramer, Smartesting)
4. `lste-2024-landmark` — LSTE: a landmark event for software testing professionals
5. `deloitte-lste-2024` — Deloitte at LSTE 2024: driving innovation in software testing
6. `sogeti-lste-2024` — Sogeti at LSTE 2024: exploring GenAI in testing

All 6 reuse images that already existed in `assets/img/` from earlier work
on the site — no new source images were added. Each article's bottom CTA
points to the relevant `previous-editions/edition-2024|2025/` recap page
(or, for the Avanti Sharma piece, straight to `register/` for the next
edition) instead of the stale "Register for [past event]" CTA that ran in
the original piece.

## 2026-07 audit & polish pass

A full-site UX/UI/accessibility/SEO/performance audit (3 parallel research
passes: design-system/JS, SEO, accessibility/UX) followed by a matching
implementation pass, done without touching the colour palette, typography,
or neumorphic shadow system. Kept deliberately incremental — no new
dependencies, no new animation infrastructure beyond what `initReveal()`
already provided.

**Accessibility**
- Fixed the h1→h3 heading-hierarchy skip that existed on all 6 news
  articles (subheadings promoted h3→h2) and on `previous-editions/`,
  `news/`, `speakers/`, `contact/` (added a heading — visible where it adds
  real orientation value, `sr-only` where a visible one would just repeat
  the hero's `<h1>`).
- Fixed the `<h4>`/`<h3>` inconsistency between the 3 card grids on
  `become-a-speaker/index.html` (two used `<h4>`, one used `<h3>` for the
  same visual weight — aligned on `<h3>`).
- `privacy-policy/index.html`'s "Contents" TOC label was an `<h3>` sitting
  *before* the page's first `<h2>` — changed to a non-heading
  `.policy-toc__label` (the `<nav>` already carries `aria-label`, so no
  information is lost).
- `base.css`'s `prefers-reduced-motion` block zeroed `transition-duration`
  but not `transition-delay` — a latent gap that would have made any
  future staggered animation (see below) still visibly cascade in for
  motion-sensitive users. Fixed before adding the stagger.
- `.footer-social a` bumped from 38×38px to 44×44px to meet the same
  click-target size used by every other icon button on the site.

**Performance/UX: map embeds**
- Both Google Maps iframes (venue, contact) loaded unconditionally and
  could scroll-jack the page. Replaced with a click-to-activate overlay
  (`.js-map-embed` / `initMapEmbeds()` in `src/js/main.js`) — same lazy
  philosophy as the existing LinkedIn modal, just inline instead of in a
  dialog. The iframe request only happens once a visitor actually clicks.

**Page-specific restructuring** (see the brief's own reasoning — applied
only where it adds real value, not generalised everywhere):
- **Venue** — "Getting there" rebuilt around a 3-step `.timeline` journey
  (Findel Airport → free bus 16/29 or tram, ~25 min → Hamilius → 4-min walk),
  reusing the existing timeline component (`schedule/`, `become-a-speaker/`)
  instead of the previous 3 same-size transport cards. Local car/street
  parking kept as a secondary block underneath. Facts verified via
  lux-airport.lu (bus 16/29 schedules) and transports.public.lu (airport
  tram, live since 2 March 2025) — not invented. Added a small venue-only
  FAQ (airport transfer, wheelchair access, Wi-Fi) with its own `FAQPage`
  JSON-LD, deliberately not duplicating the homepage's parking FAQ entry.
- **Schedule** — the 4 track tabs all showed identical "coming soon" text.
  Collapsed to one placeholder panel + a row of track-name badges; the
  `data-tabs`/`role=tablist` markup (and `initTabs()`) stay in the codebase
  for reuse once real per-track sessions exist.
- **Sponsors** — Gold and Silver were two near-identical "will be announced"
  paragraphs. Merged into one section with one CTA.
- **Previous editions** — the 2025 (7th edition, latest) card gets a
  "Latest edition" ribbon + elevated shadow (same visual language as
  `.pricing-card--featured`'s ribbon), for grid rhythm without changing
  column span. The 2019 card's missing "theme" field was left as-is —
  no verified theme exists for that edition, so nothing was invented to
  fill it.
- **News articles** — the 4 direct Dr. Kramer quotes in `digital-colleague`
  are now `<blockquote>`s (reusing the `.policy-highlight` left-accent-border
  look) to break up the otherwise monotonous single-column long-form pages.

**SEO**
- Added `og:image` to the 17 pages that had none (news articles reuse their
  own hero photo; pages without a dedicated photo fall back to the same
  generic conference photo already used as `index.html`'s default).
  `privacy-policy/index.html` had no OpenGraph block at all — added the
  full set.
- Trimmed 5 meta descriptions that ran past ~160 characters (would have
  truncated in search results) down to ~125–155 chars each, without
  changing their meaning.
- Added `NewsArticle` JSON-LD to all 6 `news/*` article pages (headline,
  image, datePublished, publisher `Organization`, `mainEntityOfPage`).
- Added `BreadcrumbList` JSON-LD to every page that already renders a
  visible breadcrumb, via a new one-off, re-runnable script:
  `scripts/inject-breadcrumb-schema.mjs` (`node scripts/inject-breadcrumb-schema.mjs`).
  It parses each page's own breadcrumb nav and mirrors it into schema — it
  doesn't invent hierarchy, and it's idempotent (skips pages that already
  have a `BreadcrumbList` block, and skips anything `noindex`, e.g.
  `speakers/index.html`). Re-run it whenever a new page gets a breadcrumb.
- `sitemap.xml`: added the 6 news article pages, `linkedin/`, and the
  3 previously-missing edition recaps (2016/2018/2019). Also **removed**
  `speakers/` from the sitemap — it carries `<meta name="robots"
  content="noindex">` and had no business being listed for crawling in
  the first place.
- Twitter Card tags were already present sitewide (`summary_large_image`)
  and were left as-is — no new Twitter-specific tags were added, per
  instruction not to add them without a clear use case.

**Subtle motion/premium polish** (all CSS `transform`/`opacity` only,
riding the same `.reveal`/`.is-visible` toggle `initReveal()` already
manages via `IntersectionObserver` — no new JS observers):
- Card grids, the sponsor strip, clusters, the gallery masonry, the
  LinkedIn grid, and timelines now cascade their items in one at a time
  (small `nth-child` `transition-delay`, capped at 300ms) instead of
  popping in as a single block. The reduced-motion fix above makes sure
  this fully disappears under `prefers-reduced-motion`.
- Trailing arrow/external-link icons in `.btn`, `.news-link`, and
  `.muted-link` nudge 3px on hover/focus — a small, GPU-cheap cue that the
  action moves you forward.
- Considered and **deliberately skipped**: a mouse-follow tilt effect on
  cards. Given animations are the lowest priority in the brief's own
  ordering and the effort/JS-complexity (per-card mousemove listeners)
  didn't clear the "does this genuinely help" bar for a first pass.

**Not touched, and why**: the Formspree contact/newsletter placeholder IDs
(still need a real Formspree ID from the client — see the section above);
the "Platinium" spelling (used consistently across the site — this was
the client's own explicit wording, not a typo).

## 2026-07-20 art-direction pass ("give the site a real event identity")

A visual-identity system change (typography, contrast, a signature graphic
motif, hero impact, neumorphism nuance) done at the tokens/components layer
so it's the new baseline everywhere at once — not a content pass, no new
photos-as-full-bleed-bands (that was tried once already and reverted; the
client clarified the actual problem was the fixed-height full-bleed format
itself, not real photos in general — contained treatments remain fine).

- **Typography**: `--font-heading` (tokens.css) is now **Space Grotesk**
  (previously identical to `--font-body`, i.e. Open Sans for literally
  everything). New `--font-mono` token (**JetBrains Mono**, weight 500
  only) applied narrowly to `.eyebrow`, `.countdown__value`, `.badge`,
  `.timeline__time` — small "technical" UI accents, never headings or
  body copy. Google Fonts `<link>` updated sitewide (26 pages) to load all
  three families in one request. **Important:** Space Grotesk has no
  800/900 weight — every `font-weight: 800` tied to `--font-heading`
  (h1/h2, `.stat-value`, `.avatar-initials`, `.pricing-card__price`,
  `.edition-card__year`) was dropped to 700 to avoid a synthetic/faux-bold
  fallback. If a heading-adjacent component is added later, check this
  before assuming 800 is safe.
- **Signature motif ("Trace")**: a small reusable SVG — a thin stepped
  line with hollow "checkpoint" circles and one filled accent dot —
  stored as themed data-URI custom properties (`--motif-trace` in
  tokens.css, one value per theme so it stays visible on both light and
  dark surfaces). Used as a low-opacity tiled texture on `.section--alt`
  (new) and `.section--brand` (replacing the old single reused
  logo-illustration corner flourish — that image file is still on disk,
  just no longer referenced), as a small `mask-image` glyph before every
  `.eyebrow` (tinted via `currentColor`, no separate theme variant
  needed), and as a faint layer in the hero between the photo and the
  colour scrim (`.hero__motif`, `src/css/pages/home.css`).
- **Contrast/rhythm**: `.section--dark` (real contrast, previously used
  in exactly 3 places, all the same stats-strip) is now also used for the
  homepage testimonials section — no new CSS, just broader use of an
  existing tool.
- **Hero**: also fixed a real pre-existing bug while touching this markup
  — the hero background was wrapped in an invalid nested `<picture>`
  inside `<picture>` (two source sets, one redundant). Consolidated to
  one. H1 now sized/spaced independently of the shared `--fs-h1` (hero
  only), with one phrase ("Software Testing") gradient-clipped via the
  same text-clip technique already used on `.stat-value`
  (`.hero__highlight`).
- **Neumorphism**: new `.testimonial-card--accent` (flat surface +
  2px brand border, no soft shadow) reuses the exact recipe already
  proven once on `.pricing-card--featured` — a soft neu shadow tuned for
  the light page background doesn't read correctly on an arbitrary dark
  section, so cards meant to sit on `.section--dark` opt into this
  instead. Used on the (now real, re-added) homepage testimonials.
- **Reinstated from the reverted pass, unchanged in format**: the 3 real
  attributed testimonial quotes (originally Dr. Anne Kramer, Cristiano
  Cunha, Jonathan Bernales — `.avatar-initials`, no fabricated photo,
  since updated again below) and the About page's real "Q-Leap team at
  LSTE 2024" photo in its Organiser section (contained in its existing
  grid column — this exact format was confirmed fine by the client; only
  the full-bleed band was rejected).

## 2026-07-20 (later): em-dash cleanup, testimonial swap, temporary noindex

- **Em-dashes removed site-wide.** The client dislikes the "—" character
  ("ça fait très IA"). Every visible occurrence across all 30 pages plus
  the chat widget's bilingual fallback answers (`src/js/main.js`) was
  rewritten with alternative punctuation (commas, colons, semicolons,
  parentheses, or clause restructuring), preserving every fact/date/name
  exactly. Only em-dashes inside developer HTML/JS comments (never
  user-visible) were left alone. **If you write any new copy for this
  site, don't use em-dashes** — this is a standing style rule now, not a
  one-time cleanup.
- **Homepage testimonials swapped again**, using real quotes the client
  sourced directly from LinkedIn posts:
  - Kept: Dr. Anne Kramer (unchanged, links to `news/digital-colleague/`).
  - Replaced Cristiano Cunha / Jonathan Bernales with:
    - **Anna Kabanova** ("Project QA Lead", per the client — her
      `linkedin/index.html` card caption previously said "Senior QA
      Engineer"; updated that too so both mentions agree).
    - **Avanti Sharma**, given the featured/first card position per the
      client — title updated to her real professional role, "Director of
      Artificial Intelligence & Growth, Workshop4Me" (already verified in
      `news/avanti-sharma-mc/`, which her card links to), rather than her
      LSTE-specific "Master of Ceremonies" role.
  - Cunha's real affiliation (Xray) surfaced in the same source material
    but his quote wasn't reused here — he's still featured on
    `linkedin/index.html`. Ainos/Quentin Ostertag's post was reviewed too
    but wasn't a first-person quote (company-page framing "à travers le
    regard de Quentin Ostertag"), so it wasn't used as a testimonial.
- **Site-wide `noindex, nofollow`** (see the warning at the top of this
  file). `robots.txt` was previously:
  ```
  User-agent: *
  Allow: /
  Disallow: /.claude/
  Disallow: /scripts/
  Disallow: /src/
  Disallow: /worker/
  Disallow: /node_modules/

  Sitemap: https://lste.lu/sitemap.xml
  ```
  Restore exactly that (or re-derive from `sitemap.xml`'s page list, kept
  up to date separately) when the site is ready to go live, and remove
  `<meta name="robots" content="noindex, nofollow">` from every page
  (it was either newly inserted or replaced an existing, different value —
  `privacy-policy/index.html` previously had `"index, follow"`,
  `speakers/index.html` and the 4 redirect stubs previously had bare
  `"noindex"` — check `git log` on this commit for the exact prior
  per-page values if a page needs something other than `"index, follow"`).

## 2026-07-20 (later still): FAQ correction, X/Twitter + YouTube removed

- **"Is lunch included?" FAQ removed** (homepage visible FAQ + its
  `FAQPage` JSON-LD entry) — the client wasn't confident it's actually
  free/included, so rather than guess, the claim was dropped everywhere
  it appeared: `register/index.html`'s ticket feature list ("Networking
  lunch & coffee breaks" → "Coffee breaks throughout the day"), and both
  the chat widget's `free/price` intent and its dedicated `lunch` intent
  in `src/js/main.js` (now points lunch-specific questions to
  hello@lste.lu instead of asserting it's included). **If real info on
  lunch ever gets confirmed, it can be reintroduced** — don't re-add the
  "included free" claim without checking with the client first.
- **No X/Twitter or YouTube account exists yet** — every icon/link to
  `twitter.com/LSTElu` and `youtube.com/@LSTElu` was removed sitewide:
  the shared `footer-social` block (`src/partials/footer.html`, cascades
  everywhere via `partials:inject`), the homepage `Organization` JSON-LD
  `sameAs` array (LinkedIn only now), and `news/index.html`'s "Watch on
  YouTube" CTA (paragraph/section simplified to LinkedIn-only). Only
  LinkedIn (real, confirmed: `linkedin.com/company/lste/`) remains. If
  official X/Twitter or YouTube accounts are created later, re-add them
  in `src/partials/footer.html` and re-run `npm run partials:inject` —
  don't hand-edit each page.

## 2026-07-20 (even later): chat widget bug fixes (FR + EN)

- **Real bug found and fixed: chat-generated internal links were broken
  everywhere except the homepage.** `INTENTS` in `src/js/main.js` writes
  internal paths root-relative (`/register/`, `/venue/`, etc.) for
  readability, and `render()` linkifies them into real `<a href>`s at
  runtime — but this script is shared across every page at every folder
  depth, and the site has no server-side routing. A literal `/register/`
  href 404s under `file://` and under any deployment that isn't the
  domain root (only works by coincidence on a page actually served at
  root). Fixed by adding `sitePrefix()`, which reads the already-correct,
  per-page-localized `.site-logo` href (set at build time by
  `scripts/localize-paths.mjs`) and uses it to rewrite each internal path
  to a real relative one (`/venue/` → `../venue/index.html` from one
  folder down, etc.) before turning it into a link. If you add new
  chat-widget-generated links in the future, they'll go through this
  same fix automatically — don't hardcode `/foo/` hrefs anywhere else in
  `main.js` without routing them through `render()`.
- **Stale/inaccurate chatbot answers corrected (both FR and EN):**
  - The `register`/`ticket` and `free`/`price` intents asserted an
    "optional Tutorial Pass... €250 + VAT" — this directly contradicted
    the site's own established rule (see "Verified facts" above) of
    never publishing a price for the morning tutorial and only inviting
    people to contact hello@lste.lu for the brochure. Reworded to match.
  - The `student` intent claimed "application required, limited seats"
    and a student-ID requirement — this isn't what the real, existing
    FAQ says ("students... welcome, free of charge, just like every
    other attendee... the same way"). Reworded to match that FAQ exactly
    instead of asserting an invented process.

## 2026-07-20 (yet later): header/nav simplification, countdown moved

- **"More" dropdown + mobile nav trimmed from 8 to 4 items.** Removed
  Media Kit & Resources, Previous Editions, News, and LinkedIn Updates
  from `src/partials/nav.html` (both the desktop dropdown and the mobile
  panel) per the client's request to reduce nav cognitive load — these 4
  pages are unchanged and still fully reachable from the footer (Event/
  Get Involved/Resources columns), nothing was deleted or made
  unreachable. Re-run `npm run partials:inject` after any further nav
  edits — don't hand-edit each page's injected copy.
- **Countdown moved out of the Hero into its own band.** The Hero was
  carrying too much simultaneously (eyebrow, title, subtitle, meta row,
  2 CTAs, and a live countdown). The countdown (`.countdown`/`data-countdown`
  — `initCountdown()` in `src/js/main.js` already queries all matching
  elements generically, so no JS change was needed) now lives in the
  section right after the Hero, replacing the previous static stats
  band (8th edition / 1,500+ / 100+ / 50+ — that same info still exists
  on the About page's own stats strip, so nothing was lost, just
  de-duplicated off the homepage). Removed the now-unused
  `.hero__countdown-label` CSS rule.
