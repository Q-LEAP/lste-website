# LSTE website — project conventions

## The homepage is the design & content reference

`index.html` is the reference implementation for how every other page on
the site should be structured and written. When building or editing any
inner page, match the homepage's logic rather than defaulting to a
generic "brochure" pattern:

- **Long-form prose gets left-aligned**, not centered. The homepage's
  "Who we are" and "Why come" sections pair a left-aligned text block
  (eyebrow + h2 + a real paragraph) with a visual or detail card beside
  it — never a centered paragraph on its own. Use `.section-head--left`
  (`src/css/layout.css`) for any section intro carrying a genuine
  paragraph of explanatory copy.
- **Short heading + one-liner intros can stay centered.** The homepage's
  own "Programme" and "News" sections use the centered `.section-head`
  default — but only because the text is a single short sentence sitting
  above a symmetric grid/timeline/carousel, not a full paragraph. That's
  the only case centered intros are homepage-consistent.
- **Hero sections are centered** (`.page-hero`): breadcrumb, bold
  uppercase H1, optional short subtitle. This is the one deliberately
  centered, brochure-style moment on every inner page and is not part of
  the "avoid centering" rule above — it's a distinct pattern, already
  applied sitewide.
- **No solid-color "brand band" heroes.** Every inner page uses the
  standard dark `.page-hero` with its ambient violet glow — not a
  full-bleed solid-violet section. If you find a page still using
  `.section--brand` as its hero, convert it.
- Titles are short — one or two words matching the page/nav name
  (`About`, `Contact`, `Tickets`, `Press`) — not a marketing headline.

## Content fidelity to lste.lu

Where a page has a real, currently-live equivalent on lste.lu, its text
content should match verbatim (adapted into our DA/markup, not copied
HTML). Don't invent marketing copy, taglines, or extra sections beyond
what the real page has. Pages with no real lste.lu equivalent (or whose
content is sourced from an internal document like the sponsor brochure)
should still be as lean as the homepage/About — synthesize dense,
multi-section "brochure" content down to the essential facts rather than
a card-grid per bullet point.

## Note on file naming

A literal `CLAUDE.md` at the repo root would collide with the existing
`Claude.md/` folder (this filesystem is case-insensitive), so this
document lives here instead. If that folder is ever renamed or removed,
consider moving this file to `CLAUDE.md` so it's picked up automatically.
