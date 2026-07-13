/* ============================================================
   LSTE – Main JavaScript
   Countdown | Navigation | Tabs | Gallery | Forms | Animations
   ============================================================ */

(function () {
  'use strict';

  /* ── Countdown Timer ───────────────────────────────────────── */
  function initCountdown() {
    const els = document.querySelectorAll('[data-countdown]');
    if (!els.length) return;

    // November 26 2026 13:00 Luxembourg time (UTC+1)
    const TARGET = new Date('2026-11-26T13:00:00+01:00').getTime();

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const now  = Date.now();
      const diff = TARGET - now;

      if (diff <= 0) {
        els.forEach(el => {
          const d = el.querySelector('[data-cd-days]');
          const h = el.querySelector('[data-cd-hours]');
          const m = el.querySelector('[data-cd-minutes]');
          const s = el.querySelector('[data-cd-seconds]');
          if (d) d.textContent = '00';
          if (h) h.textContent = '00';
          if (m) m.textContent = '00';
          if (s) s.textContent = '00';
        });
        return;
      }

      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000)  / 60000);
      const seconds = Math.floor((diff % 60000)    / 1000);

      els.forEach(el => {
        const d = el.querySelector('[data-cd-days]');
        const h = el.querySelector('[data-cd-hours]');
        const mn = el.querySelector('[data-cd-minutes]');
        const s = el.querySelector('[data-cd-seconds]');
        if (d)  d.textContent  = pad(days);
        if (h)  h.textContent  = pad(hours);
        if (mn) mn.textContent = pad(minutes);
        if (s)  s.textContent  = pad(seconds);
      });

      setTimeout(tick, 1000);
    }

    tick();
  }

  /* ── Sticky Header ─────────────────────────────────────────── */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  /* ── Mobile Menu (mega-toggle-animated-slider) ─────────────── */
  function initMobileMenu() {
    const toggle = document.querySelector('.mega-toggle-animated');
    const panel  = document.querySelector('.mobile-nav-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Event delegation – works after nav-config.js re-renders the list
    panel.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;

      if (a.matches('.has-submenu > a')) {
        const li = a.closest('.has-submenu');
        if (!li.classList.contains('open')) {
          e.preventDefault();
          li.classList.add('open');
        }
        return;
      }

      // Close panel on any regular link click
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  }

  /* Expose so nav-config can call after re-render */
  function reinitMobileMenu() { initMobileMenu(); }

  /* ── Schedule Tabs ─────────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll('.tabs-component').forEach(component => {
      const navBtns  = component.querySelectorAll('.tabs-nav__item button, .tabs-nav__btn');
      const panels   = component.querySelectorAll('.tab-panel');

      function activate(index) {
        navBtns.forEach((b, i) => b.classList.toggle('active', i === index));
        panels.forEach((p, i) => p.classList.toggle('active', i === index));
      }

      navBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => activate(i));
      });

      activate(0);
    });
  }

  /* ── Schedule item expand/collapse ────────────────────────── */
  function initScheduleItems() {
    document.querySelectorAll('.schedule-item:not(.break)').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    });
  }

  /* ── Gallery Lightbox ──────────────────────────────────────── */
  function initGallery() {
    const grids = document.querySelectorAll('.gallery-grid');
    if (!grids.length) return;

    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;

    const imgEl   = lightbox.querySelector('.lightbox__img');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn  = lightbox.querySelector('.lightbox__prev');
    const nextBtn  = lightbox.querySelector('.lightbox__next');

    let items = [];
    let current = 0;

    function open(idx) {
      current = idx;
      imgEl.src = items[current].src;
      imgEl.alt = items[current].alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function prev() { current = (current - 1 + items.length) % items.length; imgEl.src = items[current].src; }
    function next() { current = (current + 1) % items.length;              imgEl.src = items[current].src; }

    grids.forEach(grid => {
      const galleryItems = grid.querySelectorAll('.gallery-item');
      galleryItems.forEach((item, idx) => {
        const img = item.querySelector('img');
        items.push({ src: img.dataset.full || img.src, alt: img.alt });
        item.addEventListener('click', () => open(idx));
      });
    });

    closeBtn && closeBtn.addEventListener('click', close);
    prevBtn  && prevBtn.addEventListener('click',  prev);
    nextBtn  && nextBtn.addEventListener('click',  next);

    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    });
  }

  /* ── Contact Form (Formspree) ──────────────────────────────── */
  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const msg = form.querySelector('.form-msg');

    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Honeypot check
      const hp = form.querySelector('.hp-field');
      if (hp && hp.value) return;

      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          if (msg) { msg.textContent = 'Message sent! We will get back to you soon.'; msg.className = 'form-msg success'; }
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        if (msg) { msg.textContent = 'Something went wrong. Please email us at hello@lste.lu'; msg.className = 'form-msg error'; }
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  /* ── Newsletter Form ───────────────────────────────────────── */
  function initNewsletterForm() {
    const forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn   = form.querySelector('button');
        if (!input || !input.value) return;

        btn.disabled = true;
        btn.textContent = '…';

        try {
          const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          if (res.ok) {
            form.innerHTML = '<p style="color:#fff;font-family:var(--font-heading);font-size:18px;">Thanks for subscribing!</p>';
          }
        } catch {
          btn.disabled = false;
          btn.textContent = 'Subscribe';
        }
      });
    });
  }

  /* ── Scroll animations ─────────────────────────────────────── */
  function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up, .fade-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    });
  }

  /* ── Back-to-top ───────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Smooth anchor links ───────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ── Active nav link ───────────────────────────────────────── */
  function initActiveNav() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.mega-menu-link, .mobile-nav-list a').forEach(a => {
      try {
        const href = new URL(a.href, location.href).pathname.replace(/\/$/, '');
        if (href && href === path) {
          a.closest('.mega-menu-item')?.classList.add('mega-current-menu-item');
        }
      } catch (_) {}
    });
  }

  /* ── Init all ──────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initHeader();
    initMobileMenu();
    initTabs();
    initScheduleItems();
    initGallery();
    initContactForm();
    initNewsletterForm();
    initScrollAnimations();
    initBackToTop();
    initSmoothScroll();
    initActiveNav();

    // Expose reinitMobileMenu for nav-config.js
    window.LSTE = window.LSTE || {};
    window.LSTE.reinitMobileMenu = reinitMobileMenu;
  });

})();
