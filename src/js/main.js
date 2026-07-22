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
    const els = document.querySelectorAll('.stat-value');
    if (!els.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(el) {
      const text = el.textContent.trim();
      const match = text.match(/^([\d,]+)(.*)$/);
      if (!match) return;
      const target = parseInt(match[1].replace(/,/g, ''), 10);
      const suffix = match[2];
      const hasComma = match[1].includes(',');
      const looksLikeYear = suffix === '' && match[1].length === 4 && target > 1900 && target < 2100;
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
        el.textContent = (hasComma ? value.toLocaleString('en-US') : value) + suffix;
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
    initCounters();
    initReveal();
    initBackToTop();
    initSmoothScroll();
    initTabs();
    initGallery();
    initForms();
    initFooterYear();
    initEmptyEditionModal();
    initLinkedInModal();
    initMapEmbeds();
    initAmbientVideo();
  });
})();
