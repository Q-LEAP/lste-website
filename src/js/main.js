/* ============================================================
   LSTE – Main JavaScript (vanilla, no dependencies)
   Nav is now static HTML (built at build time — see
   scripts/inject-partials.mjs), so this file only handles
   interaction: menu, forms, reveal, countdown, tabs, lightbox.
   ============================================================ */
(function () {
  'use strict';

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, onEscape) {
    let lastFocused = document.activeElement;
    function handleKeydown(e) {
      if (e.key === 'Escape') { onEscape(); return; }
      if (e.key !== 'Tab') return;
      const focusables = Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', handleKeydown);
    return function release() {
      document.removeEventListener('keydown', handleKeydown);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };
  }

  /* ── Sticky header ─────────────────────────────────────────── */
  function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Announcement bar ─────────────────────────────────────── */
  function initAnnouncement() {
    const bar = document.getElementById('announcement-bar');
    if (!bar) return;
    function setHeight() {
      document.documentElement.style.setProperty('--ann-h', bar.offsetHeight + 'px');
    }
    setHeight();
    window.addEventListener('resize', setHeight);
    const closeBtn = bar.querySelector('.announcement-bar__close');
    closeBtn && closeBtn.addEventListener('click', () => {
      bar.remove();
      document.documentElement.style.setProperty('--ann-h', '0px');
    });
  }

  /* ── Mobile nav ────────────────────────────────────────────── */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const panel = document.getElementById('mobile-nav-panel');
    if (!toggle || !panel) return;

    let releaseFocus = null;

    function close() {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      if (releaseFocus) { releaseFocus(); releaseFocus = null; }
    }

    function open() {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
      const firstLink = panel.querySelector('a');
      firstLink && firstLink.focus();
      releaseFocus = trapFocus(panel, close);
    }

    toggle.addEventListener('click', () => {
      panel.classList.contains('is-open') ? close() : open();
    });

    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });
  }

  /* ── Desktop nav "More" dropdown ──────────────────────────────── */
  function initNavDropdown() {
    const trigger = document.getElementById('nav-more-trigger');
    const menu = document.getElementById('nav-more-menu');
    if (!trigger || !menu) return;

    function close() {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
    function open() {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', () => {
      menu.hidden ? open() : close();
    });
    // Nothing unloads the page when the target is an in-page anchor on the
    // current page (the nav's Sponsors entry, once initSamePageAnchors has
    // rewritten it), so the menu has to close itself.
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) close();
    });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); trigger.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !e.target.closest('.main-nav-item--dropdown')) close();
    });
    document.addEventListener('focusout', (e) => {
      if (menu.hidden) return;
      const next = e.relatedTarget;
      if (!next || !next.closest('.main-nav-item--dropdown')) close();
    });
  }

  /* ── Animated stat counters ───────────────────────────────── */
  function initCounters() {
    const els = document.querySelectorAll('.stat-value, .stats-row__value');
    if (!els.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(el) {
      // The number lives in the element's leading text node; a trailing
      // "+"/"%"/"th" suffix is its own colored <span> sibling. Only the
      // text node gets mutated during the count-up — previously this set
      // el.textContent wholesale, which flattened out and destroyed that
      // suffix span's own color on every animation run.
      const numNode = el.childNodes[0];
      if (!numNode || numNode.nodeType !== Node.TEXT_NODE) return;
      const numText = numNode.textContent.trim();
      if (!/^[\d,]+$/.test(numText)) return;

      const target = parseInt(numText.replace(/,/g, ''), 10);
      const hasComma = numText.includes(',');
      const suffix = el.textContent.trim().slice(numText.length);
      const looksLikeYear = suffix === '' && numText.length === 4 && target > 1900 && target < 2100;
      // Ordinals (e.g. "8th") aren't a quantity to count up to — animating
      // the numeral alone produces grammatically wrong intermediates like
      // "1th, 2th, 3th" before landing on the real suffix.
      const looksLikeOrdinal = /^(st|nd|rd|th)$/i.test(suffix.trim());
      if (reduceMotion || !target || looksLikeYear || looksLikeOrdinal) return;

      const duration = 1100;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        numNode.textContent = hasComma ? value.toLocaleString('en-US') : String(value);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => observer.observe(el));
  }

  /* ── Reveal on scroll ──────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    // threshold: 0 (not a fraction like 0.12) — a reveal target that wraps a
    // tall multi-item grid/masonry can be many viewport-heights tall, so its
    // visible fraction never reaches a percentage-based threshold and it
    // never fires. Firing on any intersection at all works for both a small
    // card and a long grid.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => observer.observe(el));
  }

  /* ── Back to top ───────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 480);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Smooth in-page anchors ────────────────────────────────── */
  /* ── Nav links pointing at the current page ───────────────────
     The nav is authored with site-root paths ("/#sponsors") and
     scripts/localize-paths.mjs rewrites them into real relative URLs
     ("./index.html#sponsors") so every page also works over file://. On
     the very page a link points at, that full URL makes the browser
     reload rather than move down the page. Reducing those links to their
     bare hash lets initSmoothScroll below treat them as the in-page jumps
     they are. Runs before it, since it queries the DOM once at init. */
  function initSamePageAnchors() {
    const samePage = (a, b) => a.replace(/index\.html$/, '') === b.replace(/index\.html$/, '');
    document.querySelectorAll('.main-nav a[href*="#"], .mobile-nav-list a[href*="#"]').forEach((link) => {
      const url = new URL(link.href, location.href);
      if (!url.hash || !samePage(url.pathname, location.pathname)) return;
      link.setAttribute('href', url.hash);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 76;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ── Tabs ──────────────────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach((component) => {
      const tabs = Array.from(component.querySelectorAll('[role="tab"]'));
      const panels = Array.from(component.querySelectorAll('[role="tabpanel"]'));
      if (!tabs.length) return;

      function activate(index, focus) {
        tabs.forEach((tab, i) => {
          const active = i === index;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          if (panels[i]) panels[i].hidden = !active;
        });
        if (focus) tabs[index].focus();
      }

      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activate(i, false));
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); activate((i + 1) % tabs.length, true); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); activate((i - 1 + tabs.length) % tabs.length, true); }
        });
      });

      activate(0, false);
    });
  }

  /* ── Gallery lightbox ──────────────────────────────────────── */
  function initGallery() {
    const grids = document.querySelectorAll('.gallery-grid');
    const lightbox = document.querySelector('.lightbox');
    if (!grids.length || !lightbox) return;

    const imgEl = lightbox.querySelector('.lightbox__img');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn = lightbox.querySelector('.lightbox__prev');
    const nextBtn = lightbox.querySelector('.lightbox__next');

    const items = [];
    let current = 0;
    let releaseFocus = null;

    function show() {
      imgEl.src = items[current].src;
      imgEl.alt = items[current].alt || '';
    }
    function open(idx) {
      current = idx;
      show();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn && closeBtn.focus();
      releaseFocus = trapFocus(lightbox, close);
    }
    function close() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      if (releaseFocus) { releaseFocus(); releaseFocus = null; }
    }
    function prev() { current = (current - 1 + items.length) % items.length; show(); }
    function next() { current = (current + 1) % items.length; show(); }

    grids.forEach((grid) => {
      grid.querySelectorAll('.gallery-item').forEach((item) => {
        const img = item.querySelector('img');
        if (!img) return;
        const idx = items.length;
        items.push({ src: img.dataset.full || img.src, alt: img.alt });
        item.addEventListener('click', () => open(idx));
      });
    });

    closeBtn && closeBtn.addEventListener('click', close);
    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  }

  /* ── Auto-scroll carousels: clone each .js-auto-scroll's item set once
     and animate a slow translateX loop, so it reads as a continuous
     ticker rather than an obvious jump-cut. Direction (right-to-left by
     default) is just which keyframe the [data-direction="reverse"] CSS
     selects — same clone-and-measure logic either way, so a future
     reversed carousel is a one-line data attribute, not new JS. Skipped
     entirely (leaving the plain scrollable row from the CSS base state)
     under reduced motion or on narrow viewports, where an auto-scrolling
     row is harder to read and fights with touch
     scrolling. ─────────────────────────────────────────────────────── */
  function initAutoScrollCarousels() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || window.innerWidth < 768) return; // plain scrollable row instead

    document.querySelectorAll('.js-auto-scroll').forEach((carousel) => {
      const track = carousel.querySelector('.js-auto-scroll__track');
      if (!track) return;
      const items = Array.from(track.children);
      if (items.length < 2) return;

      items.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
      });

      const pxPerSecond = Number(carousel.dataset.speed) || 40; // slow, deliberate pace
      const halfWidth = track.scrollWidth / 2;
      track.style.setProperty('--auto-scroll-duration', halfWidth / pxPerSecond + 's');
      carousel.classList.add('is-animated');
    });
  }

  /* ── Forms (Contact / Newsletter — Formspree) ─────────────── */
  function initForms() {
    document.querySelectorAll('form[data-async]').forEach((form) => {
      const msg = form.querySelector('.form-msg');
      const btn = form.querySelector('[type="submit"]');
      const btnLabel = btn ? btn.textContent : '';

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const hp = form.querySelector('.hp-field');
        if (hp && hp.value) return;

        if (btn) { btn.disabled = true; btn.textContent = form.dataset.sendingLabel || 'Sending…'; }
        if (msg) { msg.textContent = ''; msg.className = 'form-msg'; }

        try {
          const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) throw new Error('Server error');
          if (msg) {
            msg.textContent = form.dataset.successMessage || 'Thank you, we will be in touch soon.';
            msg.className = 'form-msg form-msg--success';
          }
          form.reset();
        } catch {
          if (msg) {
            msg.textContent = form.dataset.errorMessage || 'Something went wrong. Please email hello@lste.lu directly.';
            msg.className = 'form-msg form-msg--error';
          }
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        }
      });
    });
  }

  /* ── Footer year ───────────────────────────────────────────── */
  function initFooterYear() {
    // Deliberately static content — a build-time year avoids a client
    // render just for text and keeps output cacheable/deterministic.
  }

  /* ── Shared simple modal: backdrop + dialog, focus trap, Escape and
     backdrop-click to close. Used by the "no archive" QA joke and the
     LinkedIn post player below — both just supply what happens on open
     (onOpen) and, optionally, on close (onClose). ──────────────────── */
  function initSimpleModal({ triggers, modal, closeBtn, onOpen, onClose }) {
    if (!triggers.length || !modal) return;
    let releaseFocus = null;

    function close() {
      modal.hidden = true;
      if (onClose) onClose();
      if (releaseFocus) { releaseFocus(); releaseFocus = null; }
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (onOpen) onOpen(trigger);
        modal.hidden = false;
        releaseFocus = trapFocus(modal, close);
        closeBtn.focus();
      });
    });

    closeBtn && closeBtn.addEventListener('click', close);
    modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  }

  /* ── QA-themed empty state for editions with no archive ───────── */
  function initEmptyEditionModal() {
    const messageEl = document.getElementById('empty-edition-message');
    const JOKES = [
      'Looks like this edition escaped our regression tests.',
      "Even our testers couldn't find any archives for this one.",
      "404: recap not found. We've logged a bug and moved on.",
      'This edition shipped to production, but the archives never made it past QA.',
      'We searched high and low; this recap is still stuck in a "pending review" state.',
    ];
    initSimpleModal({
      triggers: document.querySelectorAll('.js-empty-edition'),
      modal: document.getElementById('empty-edition-modal'),
      closeBtn: document.getElementById('empty-edition-close'),
      onOpen: (trigger) => {
        const year = trigger.dataset.edition || 'this edition';
        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
        messageEl.textContent = joke + ' (LSTE ' + year + ')';
      },
    });
  }

  /* ── LinkedIn post cards: open the real embed in a lazy modal ──── */
  function initLinkedInModal() {
    const iframe = document.getElementById('linkedin-modal-iframe');
    if (!iframe) return;
    initSimpleModal({
      triggers: document.querySelectorAll('.linkedin-card[data-activity]'),
      modal: document.getElementById('linkedin-modal'),
      closeBtn: document.getElementById('linkedin-modal-close'),
      onOpen: (card) => {
        iframe.src = 'https://www.linkedin.com/embed/feed/update/urn:li:activity:' + card.dataset.activity;
      },
      onClose: () => { iframe.src = ''; }, // stop any playing video
    });
  }

  /* ── Sponsor logos: show the sponsor's own pitch in the shared modal ──
     Progressive enhancement, deliberately. Each tile stays a real
     <a href> to the sponsor's site, so the outbound link is still there
     for crawlers and the tile still works with JS off or broken; the
     click is only intercepted for sponsors that actually have a pitch to
     show (data-pitch). A sponsor whose pitch we haven't received yet
     simply keeps the plain link — nothing to hide, no empty dialog.

     Pitches live in data-pitch, matching how data-activity/data-edition
     already drive the other two modals. Use '||' to split a pitch into
     paragraphs; the text is written with textContent, never innerHTML,
     so an apostrophe or angle bracket in a sponsor's copy can't break
     anything. ─────────────────────────────────────────────────────── */
  function initSponsorModal() {
    const modal = document.getElementById('sponsor-modal');
    if (!modal) return;
    const logoEl = document.getElementById('sponsor-modal-logo');
    const tierEl = document.getElementById('sponsor-modal-tier');
    const nameEl = document.getElementById('sponsor-modal-name');
    const pitchEl = document.getElementById('sponsor-modal-pitch');
    const linkEl = document.getElementById('sponsor-modal-link');
    const triggers = document.querySelectorAll('.sponsor-strip a[data-pitch]');
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
      // Only now that the handler exists does the tile behave as a dialog
      // trigger, so the ARIA hint is set here rather than in the markup.
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.addEventListener('click', (e) => e.preventDefault());
    });

    initSimpleModal({
      triggers,
      modal,
      closeBtn: document.getElementById('sponsor-modal-close'),
      onOpen: (trigger) => {
        const img = trigger.querySelector('img');
        const name = trigger.dataset.sponsor || (img && img.alt) || '';
        if (img) {
          logoEl.src = img.getAttribute('src');
          logoEl.alt = img.getAttribute('alt') || name;
        }
        nameEl.textContent = name;
        tierEl.textContent = trigger.dataset.tier || '';
        tierEl.hidden = !trigger.dataset.tier;
        pitchEl.textContent = '';
        trigger.dataset.pitch.split('||').forEach((para) => {
          const text = para.trim();
          if (!text) return;
          const p = document.createElement('p');
          p.textContent = text;
          pitchEl.appendChild(p);
        });
        linkEl.href = trigger.getAttribute('href');
        linkEl.setAttribute('aria-label', 'Visit ' + name + "'s website");
      },
    });
  }

  /* ── Speaker cards: biography in a dialog, like the sponsor tiles ──
     Each card is a <details>, so it works as an accordion without JS.
     Here the summary becomes the dialog trigger instead: the details
     never opens, and the dialog is filled from the card's own markup —
     the bio lives once, in the HTML. ─────────────────────────────── */
  function initSpeakerModal() {
    const modal = document.getElementById('speaker-modal');
    const grid = document.querySelector('.speaker-grid');
    if (!modal || !grid) return;
    const plateEl = document.getElementById('speaker-modal-plate');
    const logoEl = document.getElementById('speaker-modal-logo');
    const roleEl = document.getElementById('speaker-modal-role');
    const nameEl = document.getElementById('speaker-modal-name');
    const bioEl = document.getElementById('speaker-modal-bio');
    const triggers = grid.querySelectorAll('.speaker-card > summary');
    if (!triggers.length) return;

    grid.classList.add('js-speaker-modal');
    triggers.forEach((trigger) => {
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.addEventListener('click', (e) => e.preventDefault());
    });

    initSimpleModal({
      triggers,
      modal,
      closeBtn: document.getElementById('speaker-modal-close'),
      onOpen: (trigger) => {
        const card = trigger.parentElement;
        const text = (sel) => (card.querySelector(sel) || {}).textContent || '';
        nameEl.textContent = text('.speaker-card__name');
        roleEl.textContent = [text('.role'), text('.speaker-card__company')].filter(Boolean).join(' · ');
        plateEl.hidden = !card.dataset.logo;
        if (card.dataset.logo) {
          logoEl.src = card.dataset.logo;
          logoEl.alt = card.dataset.logoAlt || '';
        }
        bioEl.textContent = '';
        const bio = card.querySelector('.speaker-card__bio');
        if (bio) Array.from(bio.children).forEach((el) => bioEl.appendChild(el.cloneNode(true)));
      },
    });
  }

  /* ── Programme (Schedule): data-driven grid ───────────────────────
     Everything (desktop grid, mobile list, track filters, "Now" line,
     detail modal) is built from SESSIONS below. Until that array is
     populated, #schedule-empty stays the only thing shown — see
     schedule/index.html and src/css/pages/schedule.css for the two
     states this toggles. `track: 'general'` is a fifth, non-column
     value for day-wide events (doors open, coffee break) that don't
     belong to one room — it spans every track column instead of one,
     isn't a filter target, and isn't a modal trigger (see documentation/
     README.md, 2026-09-28 entry, for why the published sessions map the
     way they do below). ─────────────────────────────────────────── */
  function initSchedule() {
    const emptyEl = document.getElementById('schedule-empty');
    const appEl = document.getElementById('schedule-app');
    if (!emptyEl || !appEl) return;

    const EVENT_DATE = '2026-11-26'; // yyyy-mm-dd, for the "Now" line only
    const DAY_START = '13:00';
    const DAY_END = '21:00';
    const SLOT_MIN = 5; // grid resolution, in minutes

    // Rooms as named in the client's "LSTE Program DRAFT" (received
    // 2026-09-29): Auditorium, Salle Workshop, Salle Buffet. The buffet
    // room holds both the exhibition and the cocktail, but they stay two
    // columns here — the client asked for "Networking" to become
    // "Cocktail", not to merge it away.
    const TRACKS = [
      { id: 'keynote', label: 'Auditorium Room' },
      { id: 'workshop', label: 'Workshop Room' },
      { id: 'exhibition', label: 'Exhibition' },
      { id: 'cocktail', label: 'Cocktail' },
    ];

    // Times, slots and company names come straight from that draft; the
    // page says times may change up until the day. Slots the draft marks
    // "[Title TBC]" / "[Speaker TBC]" read "to be announced" rather than
    // "TBC" (client asked for no "TBC" on the page). The draft's closing
    // ("Closing & thank you", 19:00–19:05) sits in the Auditorium column,
    // not as a cross-track banner, because the cocktail runs across it.
    // description supports multiple paragraphs via '||', same convention
    // as the sponsor pitch dialog (initSponsorModal above).
    const TBA = 'Title to be announced';
    const SESSIONS = [
      { id: 'doors-open', track: 'general', start: '13:00', end: '13:30', title: 'Doors open & registration' },

      { id: 'opening', track: 'keynote', start: '13:30', end: '13:35', type: 'Opening', title: 'Opening', speaker: 'Avanti Sharma, Master of Ceremonies' },
      {
        id: 'keynote-denoo', track: 'keynote', start: '13:35', end: '13:50', type: 'Keynote',
        title: 'The Tester in 5 Years: AI Perspectives',
        speaker: 'Olivier Denoo, ps_testware',
        description: 'Opening keynote. 15 minutes, no Q&A.',
      },
      {
        id: 'keynote-riou-du-cosquer', track: 'keynote', start: '13:50', end: '14:20', type: 'Keynote',
        title: 'Are Your Testing Activities Effective? The Answer with TMMi v2',
        speaker: 'Eric Riou du Cosquer, Certilog',
        description: '20-minute talk followed by 10 minutes of Q&A.',
      },
      {
        id: 'thales-payloads', track: 'keynote', start: '14:20', end: '14:50', type: 'Keynote',
        title: 'The Devil Is in the Payloads: The Grueling Journey of Implementing a File Transfer Feature',
        speaker: 'Thales — speaker to be announced',
        description: [
          'Modern web applications, classic or API, very often let a user send in a file: a document that gives context to a request or backs up a claim, as with an insurance file. Once uploaded, that file is usually handled later on, either by another application or by someone in the back office. Not every file is benign, and one that is allowed through by mistake becomes a security risk.',
          'This talk shows how some file types — PDFs, here — can be abused and turned into an attack vector to reach a malicious objective. It also shows why it is both important and genuinely difficult, when writing the user story or the technical specification for an upload feature, to pin down which file types are accepted and to implement the matching technical validations.',
          'It is told as a story. A development team is asked to implement file upload against a vague specification: "users must be able to send us PDF files." An application security consultant embedded in the team tests the result, finds a way to slip malicious content through, explains the problem, and the team fixes it together — then the next iteration starts. Round after round, in true die-and-retry fashion, the consultant’s health bar drops, until the feature is finally robust. The point: all that extra work and frustration could have been avoided had the user story been clearer about security in the first place.',
          'Slides in English. Delivered in English or French depending on the audience.',
        ].join('||'),
      },
      {
        id: 'octoperf-ai-performance', track: 'workshop', start: '13:30', end: '14:50', type: 'Workshop',
        title: 'AI & Performance Testing — How to Run an End-to-End Performance Testing Campaign in Natural Language with Your Favorite LLM and OctoPerf. From Scripting to Analysis.',
        speaker: 'Ouamar Nedil, Director of Performance at OctoPerf',
        description: [
          'Discover how OctoPerf, powered by its AI capabilities through the MCP Server, enables you to run a complete performance testing campaign in just a few minutes using nothing but natural language and the LLM of your choice.',
          'During this workshop you will learn how to create realistic test scenarios with advanced user journeys, execute performance tests, and analyse the results. From scenario creation to in-depth performance analysis, your AI agent guides you through every step in the language of your choice.',
          'Ouamar Nedil is a multi-tool performance testing expert with over 15 years of experience.',
          'What to bring: a laptop with an internet connection, to get the most out of the workshop.',
        ].join('||'),
      },
      {
        id: 'exhibition-opening', track: 'exhibition', start: '13:30', end: '14:50', type: 'Exhibition',
        title: 'Exhibition area opening',
        description: 'The exhibition area is open from 13:00: meet the sponsors and see their tools and platforms between sessions.',
      },

      { id: 'coffee-break-1', track: 'general', start: '14:50', end: '15:20', title: 'Coffee break & networking' },

      { id: 'round-table', track: 'keynote', start: '15:20', end: '16:00', type: 'Round table', title: 'Round table — topic to be announced', speaker: 'Moderated by Avanti Sharma', description: 'Panellists to be announced.' },
      { id: 'keynote-agilitest', track: 'keynote', start: '16:00', end: '16:30', type: 'Keynote', title: TBA, speaker: 'Agilitest', description: '20-minute talk followed by 10 minutes of Q&A.' },
      { id: 'keynote-unilu', track: 'keynote', start: '16:30', end: '17:00', type: 'Keynote', title: TBA, speaker: 'University of Luxembourg', description: '20-minute talk followed by 10 minutes of Q&A.' },
      { id: 'workshop-agilitest', track: 'workshop', start: '15:20', end: '17:00', type: 'Workshop', title: TBA, speaker: 'Agilitest' },

      { id: 'coffee-break-2', track: 'general', start: '17:00', end: '17:30', title: 'Coffee break & booth visits' },

      { id: 'keynote-6', track: 'keynote', start: '17:30', end: '18:00', type: 'Keynote', title: 'Keynote to be announced', description: '20-minute talk followed by 10 minutes of Q&A.' },
      { id: 'keynote-xray', track: 'keynote', start: '18:00', end: '18:30', type: 'Keynote', title: TBA, speaker: 'Xray', description: '20-minute talk followed by 10 minutes of Q&A.' },
      { id: 'keynote-opentext', track: 'keynote', start: '18:30', end: '19:00', type: 'Keynote', title: TBA, speaker: 'OpenText', description: '20-minute talk followed by 10 minutes of Q&A.' },
      { id: 'workshop-qguard', track: 'workshop', start: '17:30', end: '19:00', type: 'Workshop', title: TBA, speaker: 'Q-Guard by Q-Leap' },
      { id: 'closing', track: 'keynote', start: '19:00', end: '19:05', type: 'Closing', title: 'Closing & thank you', speaker: 'LSTE organisers' },

      { id: 'cocktail', track: 'cocktail', start: '18:30', end: '21:00', title: 'Cocktail' },
    ];

    if (!SESSIONS.length) return; // keep showing the "coming soon" empty state

    const toolbar = document.getElementById('schedule-toolbar');
    const gridEl = document.getElementById('schedule-grid');
    const mobileEl = document.getElementById('schedule-mobile');
    const nowBtn = document.getElementById('schedule-now-btn');

    emptyEl.hidden = true;
    appEl.hidden = false;
    if (toolbar) toolbar.hidden = false;

    function toMinutes(hm) {
      const [h, m] = hm.split(':').map(Number);
      return h * 60 + m;
    }
    function formatRange(start, end) {
      return end ? start + '–' + end : start;
    }
    function el(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }

    const dayStartMin = toMinutes(DAY_START);
    const dayEndMin = toMinutes(DAY_END);
    const totalRows = Math.round((dayEndMin - dayStartMin) / SLOT_MIN);

    /* ── Desktop grid ──────────────────────────────────────────────── */
    function buildGrid() {
      gridEl.innerHTML = '';
      gridEl.style.gridTemplateColumns = '84px repeat(' + TRACKS.length + ', 1fr)';
      gridEl.style.gridTemplateRows = '40px repeat(' + totalRows + ', var(--slot-h))';

      gridEl.appendChild(el('div', 'schedule-grid__head-cell schedule-grid__head-cell--corner'));

      TRACKS.forEach((track, i) => {
        const head = el('div', 'schedule-grid__head-cell');
        head.style.gridColumn = String(i + 2);
        head.appendChild(el('span', 'badge badge--' + track.id, track.label));
        gridEl.appendChild(head);
      });

      for (let m = dayStartMin; m < dayEndMin; m += 30) {
        const isHour = m % 60 === 0;
        const label = el('div', 'schedule-grid__time' + (isHour ? ' schedule-grid__time--hour' : ''), minutesToHm(m));
        const row = 2 + Math.round((m - dayStartMin) / SLOT_MIN);
        label.style.gridRow = row + ' / span ' + Math.round(30 / SLOT_MIN);
        gridEl.appendChild(label);
      }

      SESSIONS.forEach((session) => {
        const isGeneral = session.track === 'general';
        const trackIndex = isGeneral ? -1 : TRACKS.findIndex((t) => t.id === session.track);
        if (!isGeneral && trackIndex === -1) return;
        const start = toMinutes(session.start);
        const end = session.end ? toMinutes(session.end) : start + 30;
        const rowStart = 2 + Math.round((start - dayStartMin) / SLOT_MIN);
        const rowEnd = 2 + Math.round((end - dayStartMin) / SLOT_MIN);

        const card = document.createElement(isGeneral ? 'div' : 'button');
        if (!isGeneral) card.type = 'button';
        card.className = isGeneral ? 'schedule-marker' : 'session-card session-card--' + session.track;
        if (!isGeneral && end - start <= 5) card.classList.add('session-card--tiny');
        else if (!isGeneral && end - start <= 15) card.classList.add('session-card--short');
        else if (!isGeneral && end - start <= 30) card.classList.add('session-card--mid');
        card.style.gridRow = rowStart + ' / ' + rowEnd;
        if (isGeneral) {
          card.style.gridColumn = '2 / span ' + TRACKS.length;
          card.appendChild(el('span', 'schedule-marker__time', formatRange(session.start, session.end)));
          card.appendChild(el('span', 'schedule-marker__title', session.title));
        } else {
          card.dataset.sessionId = session.id;
          card.dataset.track = session.track;
          card.style.gridColumn = String(trackIndex + 2);
          card.setAttribute('aria-haspopup', 'dialog');
          card.appendChild(el('span', 'session-card__time', formatRange(session.start, session.end)));
          card.appendChild(el('span', 'session-card__title', session.title));
          if (session.speaker) card.appendChild(el('span', 'session-card__speaker', session.speaker));
        }
        gridEl.appendChild(card);
      });
    }

    function minutesToHm(m) {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    }

    /* ── Mobile list — grouped by start time, not a squeezed grid ────── */
    function buildMobile() {
      mobileEl.innerHTML = '';
      const sorted = SESSIONS.slice().sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      const groups = [];
      sorted.forEach((session) => {
        const last = groups[groups.length - 1];
        if (last && last.start === session.start) last.items.push(session);
        else groups.push({ start: session.start, items: [session] });
      });

      groups.forEach((group) => {
        const groupEl = el('div', 'schedule-mobile__group');
        const realSessions = group.items.filter((s) => s.track !== 'general').length;
        const timeLabel = realSessions > 1
          ? group.start + ' — ' + realSessions + ' sessions in parallel'
          : group.start;
        groupEl.appendChild(el('p', 'schedule-mobile__group-time', timeLabel));

        const list = el('div', 'schedule-mobile__list');
        group.items.forEach((session) => {
          const isGeneral = session.track === 'general';
          const track = TRACKS.find((t) => t.id === session.track);
          const card = document.createElement(isGeneral ? 'div' : 'button');
          if (isGeneral) {
            card.className = 'schedule-mobile-marker';
            card.appendChild(el('span', 'schedule-mobile-marker__meta', formatRange(session.start, session.end)));
            card.appendChild(el('span', 'schedule-mobile-marker__title', session.title));
          } else {
            card.type = 'button';
            card.className = 'schedule-mobile-card schedule-mobile-card--' + session.track;
            card.dataset.sessionId = session.id;
            card.dataset.track = session.track;
            card.setAttribute('aria-haspopup', 'dialog');
            card.appendChild(el('span', 'schedule-mobile-card__meta', formatRange(session.start, session.end) + (track ? ' · ' + track.label : '')));
            card.appendChild(el('span', 'schedule-mobile-card__title', session.title));
            if (session.speaker) card.appendChild(el('span', 'schedule-mobile-card__speaker', session.speaker));
          }
          list.appendChild(card);
        });
        groupEl.appendChild(list);
        mobileEl.appendChild(groupEl);
      });
    }

    /* ── Track filters (All / Auditorium / Workshop / Exhibition / Cocktail) ──
       Cross-track markers have no data-track, so they're untouched by
       any filter — a coffee break matters no matter which track you
       picked. */
    function initFilters() {
      const buttons = document.querySelectorAll('.schedule-filter');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          const filter = btn.dataset.filter;
          appEl.querySelectorAll('[data-track]').forEach((card) => {
            card.classList.toggle('is-dimmed', filter !== 'all' && card.dataset.track !== filter);
          });
        });
      });
    }

    /* ── "Now" line — only during the event itself ────────────────────── */
    function updateNowLine() {
      const existing = gridEl.querySelector('.schedule-now-line');
      if (existing) existing.remove();

      const now = new Date();
      const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
      const minutes = now.getHours() * 60 + now.getMinutes();
      if (todayStr !== EVENT_DATE || minutes < dayStartMin || minutes > dayEndMin) {
        if (nowBtn) nowBtn.hidden = true;
        return;
      }

      const row = 2 + Math.round((minutes - dayStartMin) / SLOT_MIN);
      const line = el('div', 'schedule-now-line');
      line.style.gridRow = String(row);
      gridEl.appendChild(line);
      if (nowBtn) nowBtn.hidden = false;
    }

    /* ── Session detail modal ─────────────────────────────────────────── */
    function initModal() {
      const byId = new Map(SESSIONS.map((s) => [s.id, s]));
      initSimpleModal({
        triggers: appEl.querySelectorAll('.session-card, .schedule-mobile-card'),
        modal: document.getElementById('session-modal'),
        closeBtn: document.getElementById('session-modal-close'),
        onOpen: (trigger) => {
          const session = byId.get(trigger.dataset.sessionId);
          if (!session) return;
          const track = TRACKS.find((t) => t.id === session.track);
          const trackEl = document.getElementById('session-modal-track');
          trackEl.textContent = [track && track.label, session.type].filter(Boolean).join(' · ');
          trackEl.className = 'badge badge--' + session.track;
          document.getElementById('session-modal-time').textContent = formatRange(session.start, session.end);
          document.getElementById('session-modal-title').textContent = session.title;
          document.getElementById('session-modal-speaker').textContent = session.speaker || '';
          const descEl = document.getElementById('session-modal-desc');
          descEl.textContent = '';
          (session.description || '').split('||').forEach((para) => {
            const text = para.trim();
            if (!text) return;
            descEl.appendChild(el('p', null, text));
          });
        },
      });
    }

    buildGrid();
    buildMobile();
    initFilters();
    initModal();
    updateNowLine();
    window.setInterval(updateNowLine, 60000);
    if (nowBtn) {
      nowBtn.addEventListener('click', () => {
        const line = gridEl.querySelector('.schedule-now-line');
        if (line) line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  /* ── Google Maps embeds: click-to-activate ─────────────────────────
     The map iframe is already there (native loading="lazy" defers the
     actual fetch until it's scrolled near), just visually blurred behind
     a frosted-glass overlay with pointer-events disabled — so scrolling
     past it never gets captured by the map's own scroll/zoom handling.
     Clicking the overlay removes it and hands control to the map. ──── */
  function initMapEmbeds() {
    document.querySelectorAll('.js-map-embed').forEach((el) => {
      const btn = el.querySelector('.map-embed__activate');
      const iframe = el.querySelector('iframe');
      if (!btn || !iframe) return;
      btn.addEventListener('click', () => {
        if (iframe.dataset.src && !iframe.getAttribute('src')) iframe.src = iframe.dataset.src;
        btn.remove();
        iframe.style.pointerEvents = 'auto';
      }, { once: true });
    });
  }

  /* ── Ambient background videos: only fetch/play once scrolled into
     view (these are muted highlight loops, not essential content — no
     reason to spend bandwidth/battery on them before they're seen), and
     never autoplay at all for prefers-reduced-motion. Poster image covers
     both the pre-load and reduced-motion cases. ─────────────────────── */
  function initAmbientVideo() {
    const videos = document.querySelectorAll('.js-ambient-video');
    if (!videos.length) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    if (!('IntersectionObserver' in window)) {
      videos.forEach((v) => { v.muted = true; v.preload = 'auto'; v.play().catch(() => {}); });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (!video.src && video.dataset.src) video.src = video.dataset.src;
          video.muted = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    videos.forEach((v) => observer.observe(v));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initAnnouncement();
    initMobileMenu();
    initNavDropdown();
    initSamePageAnchors();
    initCounters();
    initReveal();
    initBackToTop();
    initSmoothScroll();
    initTabs();
    initGallery();
    initAutoScrollCarousels();
    initForms();
    initFooterYear();
    initEmptyEditionModal();
    initLinkedInModal();
    initSponsorModal();
    initSpeakerModal();
    initSchedule();
    initMapEmbeds();
    initAmbientVideo();
  });
})();
