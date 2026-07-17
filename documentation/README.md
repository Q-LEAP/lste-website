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
