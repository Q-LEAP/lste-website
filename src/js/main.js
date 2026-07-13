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

  /* ── Countdown ─────────────────────────────────────────────── */
  function initCountdown() {
    const els = document.querySelectorAll('[data-countdown]');
    if (!els.length) return;
    const TARGET = new Date('2026-11-26T13:00:00+01:00').getTime();
    const pad = (n) => String(n).padStart(2, '0');

    function render(diff) {
      const clamped = Math.max(diff, 0);
      const days = Math.floor(clamped / 86400000);
      const hours = Math.floor((clamped % 86400000) / 3600000);
      const minutes = Math.floor((clamped % 3600000) / 60000);
      const seconds = Math.floor((clamped % 60000) / 1000);
      els.forEach((el) => {
        const d = el.querySelector('[data-cd-days]');
        const h = el.querySelector('[data-cd-hours]');
        const m = el.querySelector('[data-cd-minutes]');
        const s = el.querySelector('[data-cd-seconds]');
        if (d) d.textContent = pad(days);
        if (h) h.textContent = pad(hours);
        if (m) m.textContent = pad(minutes);
        if (s) s.textContent = pad(seconds);
      });
    }

    function tick() {
      const diff = TARGET - Date.now();
      render(diff);
      if (diff > 0) setTimeout(tick, 1000);
    }
    tick();
  }

  /* ── Reveal on scroll ──────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
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
            msg.textContent = form.dataset.successMessage || 'Thank you — we will be in touch soon.';
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

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initAnnouncement();
    initMobileMenu();
    initCountdown();
    initReveal();
    initBackToTop();
    initSmoothScroll();
    initTabs();
    initGallery();
    initForms();
    initFooterYear();
  });
})();
