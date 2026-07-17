# LSTE website — documentation & source materials

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
the client's own explicit wording, not a typo). The About page's organiser
photo placeholder was fixed in the 2026-07 storytelling pass below.

## 2026-07 storytelling pass ("give the site a real event identity")

A follow-up content/composition pass (no new animation, no DA change) aimed
at making the site feel like a living event rather than a SaaS product —
more real photos, real quotes, and visual rhythm-breaking. Nothing invented:
every photo, quote, and figure below already existed somewhere in the
project and was simply surfaced more prominently.

- **New reusable component: `.photo-band`** (`src/css/components.css`) — a
  full-bleed (no radius, no card shadow — deliberately not another rounded
  neu card) real-photo strip with a bottom-anchored scrim (same
  `rgba(20,15,50,…)` recipe as `.hero__scrim`) and a short caption. Used
  identically on 4 pages so it reads as a recurring "moments from LSTE"
  motif rather than a one-off.
- **Homepage**: the 3 testimonials were anonymized placeholders ("QA
  Lead," "Test Automation Engineer" — no real name). Replaced with 3 real,
  attributed quotes: Dr. Anne Kramer (from `news/digital-colleague/`),
  and Cristiano Cunha / Jonathan Bernales (real LinkedIn posts, labelled
  honestly as "LSTE community, via LinkedIn" since no job title for them
  is verified anywhere in the project — do not add one later without a
  source). Added a `.photo-band` (real crowd photo) between "Why attend"
  and the testimonials.
- **About page**: the "Organiser" section showed the Q-Leap logo where a
  team photo was wanted (a real gap — see the removed TODO). A real
  **"Q-Leap team at LSTE 2024"** photo already existed in `assets/img/`,
  unused — now used there instead. Added a `.photo-band` between Mission
  and Format sections.
- **Sponsors page**: added a "Sponsors of previous editions" block using
  the real `LSTE-2018-sponsor-banners` photo — deliberately only naming
  Docler Holding / Neotys / Luxair Group, since that's the one sponsor list
  actually confirmed in `previous-editions/edition-2018/index.html`'s own
  text. Other logos sitting in `assets/img/` (Deloitte, Thales, Capgemini,
  Tricentis, GASQ, ISTQB) were **not** used here — no verified text ties
  them to a confirmed sponsorship (vs. just attending/exhibiting), so
  don't add them to a "past sponsors" claim without checking first. Added
  a `.photo-band` (expo floor photo) above it.
- **Become-a-speaker page**: inserted a `.photo-band` (real
  "two speakers chatting" photo) between the Formats and Selection-process
  grids — the most repetitive 3-grids-in-a-row stretch on the site. No
  speaker testimonial was added here since no real quote about "what it's
  like to speak at LSTE" exists anywhere in the project.
- **Previous editions index**: added a small real photo to the top of the
  2025/2024/2019/2018 cards only (each reusing a photo already used on
  that edition's own recap page) — 2016's card was deliberately left
  without one (its recap page predates the recovered photo archive), and
  2017/2014 don't have real recap pages at all (empty-state modal), so
  adding a photo there would be inconsistent with the "View edition" link
  the other cards carry.
- **News index**: the `digital-colleague` card's generic one-line summary
  was replaced with an italic pull-quote from Dr. Kramer's real quote,
  already used verbatim in the article itself.

**Corrections after client review (2026-07-17):**
- **Photo-band resolution**: the full-bleed `.photo-band` images looked
  pixelated on wide viewports because a full-bleed section can render
  wider than the site's standard 1200px max image width. Fixed at the
  source: `scripts/optimize-images.mjs` now generates one extra, wider
  variant (`FULL_BLEED_WIDTH = 1920`, capped to each source's real
  resolution) for an explicit allowlist (`FULL_BLEED_BASENAMES`) of the 4
  photos actually used full-bleed, served via `srcset`/`sizes="100vw"` so
  mobile still only downloads the small variants. Add a new basename to
  that allowlist whenever a new photo gets the `.photo-band` treatment.
- **"300+" → "400+"**: the client confirmed the real attendee figure is
  400+, not 300+ — every generic "300+ testing/QA professionals" marketing
  line site-wide (home, about, speakers, sponsors, resources,
  become-a-speaker) was updated. Per-edition historical attendee counts
  (e.g. "320+ attendees" on the 2025 card, "280+" on 2024) were **not**
  touched — those are specific verified past numbers, not the general
  claim.
- **Sponsors page "past editions" block removed for now**: it named 2018
  sponsors (Docler Holding/Neotys/Luxair Group, the one edition with an
  explicit, verified sponsor list) but the client wants **2025** sponsors
  shown instead. No 2025 sponsor company names are verified anywhere in
  the project (only generic "sponsor booths in the background" — no
  names) — asked the client to supply the real 2025 sponsor list rather
  than guessing from exhibitor/session-presenter names, which aren't
  necessarily the same as confirmed sponsors. Re-add this block once that
  list is provided.
