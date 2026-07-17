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
- **Official "About the Event" copy** (lste.lu/about, verbatim): headings
  "Who we are" / "The uNique testing event in Luxembourg" and "For who" /
  "For all testers and IT practitioners", plus the Q-LEAP organiser
  paragraph. This copy was ported into `about/index.html` — do not rewrite
  it freely; if it needs to change, re-pull from the live page first.
  - Marketing lines used verbatim: "THE BIGGEST TESTING EVENT IN
    LUXEMBOURG." / "FOR ALL TESTERS AND PASSIONNATE TESTERS" (sic — the
    typo is in the official copy).
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

LinkedIn has no public, partnership-free way to embed a company page's post
feed on a third-party site — `news/index.html` links out to LinkedIn
instead. YouTube uploads CAN be auto-embedded, but need the channel's
numeric Channel ID (not the `@LSTElu` handle) — see the HTML comment above
the "Never miss an update" section in `news/index.html` for the exact
iframe snippet to drop in once that ID is available.
