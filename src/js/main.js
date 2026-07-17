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
      if (reduceMotion || !target || looksLikeYear) return;

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

  /* ── Theme toggle (light / dark) ───────────────────────────── */
  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    // The inline <head> script already set data-theme before first paint;
    // here we just sync the button and handle clicks.
    function apply(theme) {
      root.setAttribute('data-theme', theme);
      if (!toggle) return;
      const dark = theme === 'dark';
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem('lste-theme', next); } catch (e) { /* private mode */ }
      });
    }
  }

  /* ── AI chat assistant ─────────────────────────────────────── */
  function initChat() {
    const root = document.getElementById('lste-chat');
    if (!root) return;
    const launcher = document.getElementById('chat-launcher');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const log = document.getElementById('chat-log');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    if (!launcher || !panel || !log || !form || !input) return;

    const endpoint = (root.dataset.endpoint || '').trim();
    const history = []; // { role: 'user' | 'assistant', content }
    let releaseFocus = null;
    let busy = false;
    let greeted = false;

    // UI language — the visitor picks it explicitly on first open (see
    // addLangPicker/greet below). Browser locale only seeds the initial guess
    // for the button order; it's overwritten as soon as a choice is made.
    let uiLang = (navigator.language || 'en').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
    let langChosen = false;

    const LANG_PICKER_PROMPT = 'Français 🇫🇷 ou English 🇬🇧 ?';
    const LANG_OPTIONS = [
      { code: 'fr', label: 'Français 🇫🇷' },
      { code: 'en', label: 'English 🇬🇧' },
    ];

    const SUGGESTIONS = {
      en: ['What is LSTE?', 'When & where is it?', 'How do I register?', 'How can I speak?'],
      fr: ['C’est quoi le LSTE ?', 'Quand et où ?', 'Comment s’inscrire ?', 'Comment intervenir ?'],
    };

    const GREETING = {
      en: 'Hi! I’m the LSTE assistant — ask me about dates, tickets, the venue, speaking, sponsoring and more. What would you like to know?',
      fr: 'Bonjour ! Je suis l’assistant du LSTE — pose-moi tes questions sur les dates, les billets, le lieu, comment intervenir ou sponsoriser, etc. Que veux-tu savoir ?',
    };

    const MISS = {
      en: 'I don’t have that exact detail here. You can ask me about dates, tickets, the venue, speaking or sponsoring — or email hello@lste.lu / see /contact/.',
      fr: 'Je n’ai pas ce détail précis ici. Tu peux me demander les dates, les billets, le lieu, comment intervenir ou sponsoriser — ou écrire à hello@lste.lu / voir /contact/.',
    };

    // Lowercase, strip accents, and flatten punctuation (hyphens, apostrophes,
    // "?") to spaces so "qui es-tu ?" and "c'est" match plain keywords.
    function norm(s) {
      return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    }

    // Lightweight FR/EN detector: accented chars or common French tokens → fr.
    function detectLang(text) {
      if (/[àâçéèêëîïôûùü]/i.test(text)) return 'fr';
      const t = ' ' + norm(text) + ' ';
      const fr = [' le ', ' la ', ' les ', ' un ', ' une ', ' des ', ' du ', ' est ', ' quoi', ' ou ', ' quand', ' comment', ' qui ', ' vous', ' tu ', ' je ', ' quel', ' quelle', ' pour ', ' avec ', ' bonjour', ' salut', ' merci', ' gratuit', ' inscri', ' billet', ' lieu', ' repas', ' etes', ' parler', ' conferenc', ' combien', ' prix', ' sponsor', ' etudiant'];
      let n = 0;
      fr.forEach((w) => { if (t.indexOf(w) !== -1) n++; });
      return n >= 1 ? 'fr' : 'en';
    }

    // Curated, bilingual intents used when no backend is configured or a
    // request fails — keeps the widget genuinely useful offline. Keywords are
    // accent-stripped; the best-scoring intent wins.
    const INTENTS = [
      { kw: ['who are you', 'what are you', 'who r u', 'what can you do', 'what do you do', 'who is this', 'your name', 'help me', 'qui es tu', 'es tu', 'qui etes', 'etes vous', 'tu es qui', 'vous etes qui', 'c est quoi ce', 'que sais tu', 'tu fais quoi', 'tu sers a quoi', 'ton nom', 'presente toi'],
        en: 'I’m the LSTE assistant. LSTE — the Luxembourg Software Testing Event — is Luxembourg’s annual one-day conference for software testing and QA professionals (8th edition: 26 November 2026, Hôtel Parc Belle-Vue, Luxembourg City, free to attend). I can help with dates, tickets, the venue, speaking, sponsoring and more. What would you like to know?',
        fr: 'Je suis l’assistant du LSTE. Le LSTE — Luxembourg Software Testing Event — est la conférence annuelle d’une journée dédiée aux professionnels du test logiciel et de la QA au Luxembourg (8e édition : 26 novembre 2026, Hôtel Parc Belle-Vue, Luxembourg-Ville, entrée gratuite). Je peux t’aider sur les dates, les billets, le lieu, comment intervenir ou sponsoriser, etc. Que veux-tu savoir ?' },
      { kw: ['what is lste', 'about lste', 'tell me about', 'what s lste', 'whats lste', 'c est quoi lste', 'c est quoi le lste', 'quoi le lste', 'quoi lste', 'qu est ce que lste', 'a propos', 'presente lste', 'lste c est quoi', 'parle moi'],
        en: 'LSTE (the Luxembourg Software Testing Event) is Luxembourg’s annual one-day conference for software testing & QA professionals — keynotes, talks, live demos, workshops and networking, drawing 300+ attendees. The 8th edition is on 26 November 2026 at Hôtel Parc Belle-Vue, Luxembourg City, free to attend. More: /about/',
        fr: 'Le LSTE (Luxembourg Software Testing Event) est la conférence annuelle d’une journée dédiée aux professionnels du test logiciel et de la QA au Luxembourg — keynotes, talks, démos, ateliers et networking, avec 300+ participants. La 8e édition a lieu le 26 novembre 2026 à l’Hôtel Parc Belle-Vue, Luxembourg-Ville, entrée gratuite. Plus d’infos : /about/' },
      { kw: ['when', 'date', 'where', 'venue', 'location', 'address', 'quand', 'ou ', 'lieu', 'adresse', 'endroit'],
        en: 'LSTE 2026 is on 26 November 2026, 08:30–18:00, at the Conference Center of Hôtel Parc Belle-Vue, 5 Avenue Marie-Thérèse, L-2132 Luxembourg. More: /venue/',
        fr: 'Le LSTE 2026 a lieu le 26 novembre 2026, de 08h30 à 18h00, au Conference Center de l’Hôtel Parc Belle-Vue, 5 Avenue Marie-Thérèse, L-2132 Luxembourg. Plus d’infos : /venue/' },
      { kw: ['register', 'registration', 'ticket', 'sign up', 'attend', 'inscri', 'billet', 's inscrire', 'participer'],
        en: 'The conference is free to attend — register here: /register/. An optional Tutorial Pass (a hands-on half-day workshop) is €250 + VAT.',
        fr: 'La conférence est gratuite — inscris-toi ici : /register/. Un Tutorial Pass optionnel (atelier pratique d’une demi-journée) coûte 250 € + TVA.' },
      { kw: ['free', 'price', 'cost', 'how much', 'fee', 'gratuit', 'prix', 'cout', 'combien', 'tarif', 'payer'],
        en: 'Attending the conference is free (a networking lunch and coffee breaks are included). The optional Tutorial Pass is €250 + VAT. See /register/.',
        fr: 'Assister à la conférence est gratuit (un déjeuner networking et les pauses café sont inclus). Le Tutorial Pass optionnel coûte 250 € + TVA. Voir /register/.' },
      { kw: ['lunch', 'food', 'eat', 'meal', 'coffee', 'repas', 'dejeuner', 'manger', 'nourriture', 'cafe'],
        en: 'Yes — a networking lunch and coffee breaks are included with every ticket, at no cost. See /register/.',
        fr: 'Oui — un déjeuner networking et les pauses café sont inclus avec chaque billet, sans frais. Voir /register/.' },
      { kw: ['speaker', 'speak', 'talk', 'cfp', 'submit', 'call for', 'present', 'parler', 'conferenc', 'intervenir', 'proposer'],
        en: 'We welcome talk proposals (keynote, talk or workshop) until 30 September 2026 — submit yours here: /become-a-speaker/',
        fr: 'Nous accueillons les propositions (keynote, talk ou atelier) jusqu’au 30 septembre 2026 — propose la tienne ici : /become-a-speaker/' },
      { kw: ['sponsor', 'partner', 'exhibit', 'partenaire', 'sponsoriser', 'stand'],
        en: 'Interested in sponsoring? See the tiers on /sponsors/ and the “Sponsor With Us” info on /resources/, or email hello@lste.lu.',
        fr: 'Envie de sponsoriser ? Vois les formules sur /sponsors/ et la rubrique « Sponsor With Us » sur /resources/, ou écris à hello@lste.lu.' },
      { kw: ['park', 'parking', 'car', 'train', 'bus', 'get there', 'travel', 'voiture', 'acces', 'venir', 'transport', 'se garer'],
        en: 'Free on-site parking is available for guests, right by the Hamilius tram and bus stop in Luxembourg City. Full travel details: /venue/',
        fr: 'Un parking gratuit est disponible sur place, juste à côté de l’arrêt Hamilius (tram et bus) à Luxembourg-Ville. Tous les détails d’accès : /venue/' },
      { kw: ['student', 'academic', 'university', 'etudiant', 'academique', 'universite'],
        en: 'Students and academics can attend free with a valid student ID (application required, limited seats). Apply when registering: /register/',
        fr: 'Étudiants et académiques peuvent participer gratuitement avec une carte d’étudiant valide (candidature requise, places limitées). Postule lors de l’inscription : /register/' },
      { kw: ['language', 'langue', 'english', 'anglais', 'francais', 'spoken'],
        en: 'The event is held in English.',
        fr: 'L’événement se déroule en anglais.' },
      { kw: ['speakers', 'lineup', 'who is speaking', 'programme', 'program', 'schedule', 'agenda', 'conferenciers', 'orateurs', 'programmes'],
        en: 'You can see past speakers on /speakers/ and the programme on /schedule/. The detailed 2026 programme is published closer to the event.',
        fr: 'Tu peux voir les intervenants sur /speakers/ et le programme sur /schedule/. Le programme détaillé 2026 sera publié plus près de l’événement.' },
      { kw: ['contact', 'email', 'reach', 'phone', 'contacter', 'joindre', 'ecrire'],
        en: 'You can reach the team at hello@lste.lu or via /contact/.',
        fr: 'Tu peux contacter l’équipe à hello@lste.lu ou via /contact/.' },
      { kw: ['thanks', 'thank you', 'thx', 'merci', 'super', 'parfait', 'great'],
        en: 'You’re welcome! Anything else about LSTE I can help with?',
        fr: 'Avec plaisir ! Autre chose sur le LSTE ?' },
      { kw: ['hello', 'hi ', 'hey', 'bonjour', 'salut', 'coucou', 'yo '],
        en: 'Hi! Ask me anything about LSTE — dates, tickets, the venue, speaking or sponsoring.',
        fr: 'Bonjour ! Pose-moi tes questions sur le LSTE — dates, billets, lieu, intervenir ou sponsoriser.' },
    ];

    function fallbackAnswer(text) {
      // Once the visitor has picked a language, honour it for every reply
      // rather than re-guessing per message.
      const lang = langChosen ? uiLang : detectLang(text);
      const q = ' ' + norm(text) + ' ';
      let best = null;
      let bestScore = 0;
      INTENTS.forEach((it) => {
        let score = 0;
        it.kw.forEach((kw) => { if (q.indexOf(norm(kw)) !== -1) score++; });
        if (score > bestScore) { bestScore = score; best = it; }
      });
      return best ? best[lang] : MISS[lang];
    }

    // Escape HTML, then linkify — in a single pass so an internal path that
    // happens to sit inside a full URL isn't double-matched. Handles external
    // URLs (https://…), emails, and internal site paths (/foo/).
    function render(text) {
      const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const pattern = /(https?:\/\/[^\s<]+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\/[a-z0-9\-/]+\/)/gi;
      return esc.replace(pattern, (match) => {
        if (/^https?:\/\//i.test(match)) return '<a href="' + match + '" target="_blank" rel="noopener">' + match + '</a>';
        if (match.indexOf('@') !== -1) return '<a href="mailto:' + match + '">' + match + '</a>';
        return '<a href="' + match + '">' + match + '</a>';
      });
    }

    function addMessage(role, text) {
      const el = document.createElement('div');
      el.className = 'chat-msg chat-msg--' + (role === 'user' ? 'user' : 'bot');
      el.innerHTML = render(text);
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }

    function addSuggestions() {
      const wrap = document.createElement('div');
      wrap.className = 'chat-suggestions';
      SUGGESTIONS[uiLang].forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = s;
        b.addEventListener('click', () => { if (!busy) { input.value = s; submit(); } });
        wrap.appendChild(b);
      });
      log.appendChild(wrap);
    }

    function addLangPicker() {
      const wrap = document.createElement('div');
      wrap.className = 'chat-suggestions';
      LANG_OPTIONS.forEach((opt) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = opt.label;
        b.addEventListener('click', () => {
          if (langChosen) return;
          langChosen = true;
          uiLang = opt.code;
          wrap.remove();
          showGreeting();
        });
        wrap.appendChild(b);
      });
      log.appendChild(wrap);
    }

    function showGreeting() {
      // Localise the input placeholder + header status to the chosen language.
      if (uiLang === 'fr') {
        input.setAttribute('placeholder', 'Pose une question sur le LSTE…');
        const status = panel.querySelector('.chat-header__status');
        if (status) status.textContent = 'Pose-moi tes questions sur l’événement';
      }
      addMessage('bot', GREETING[uiLang]);
      addSuggestions();
    }

    function greet() {
      if (greeted) return;
      greeted = true;
      // Ask for a language first — the assistant must not assume one.
      addMessage('bot', LANG_PICKER_PROMPT);
      addLangPicker();
    }

    function typingIndicator() {
      const el = document.createElement('div');
      el.className = 'chat-msg chat-msg--bot';
      el.innerHTML = '<span class="chat-typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>';
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }

    async function streamReply(bubble) {
      // Streams SSE from the Worker. Returns the accumulated text.
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error('bad response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const delta = JSON.parse(payload);
            if (typeof delta === 'string') {
              acc += delta;
              bubble.innerHTML = render(acc);
              log.scrollTop = log.scrollHeight;
            }
          } catch { /* ignore keep-alives / non-JSON */ }
        }
      }
      if (!acc) throw new Error('empty reply');
      return acc;
    }

    async function submit() {
      const text = input.value.trim();
      if (!text || busy) return;
      busy = true;
      if (sendBtn) sendBtn.disabled = true;
      // If the visitor types before picking a language (skipping the flag
      // buttons), infer it from their message so they're never stuck.
      if (!langChosen) {
        langChosen = true;
        uiLang = detectLang(text);
        const picker = log.querySelector('.chat-suggestions');
        if (picker) picker.remove();
      }
      addMessage('user', text);
      history.push({ role: 'user', content: text });
      input.value = '';
      input.style.height = 'auto';

      const typing = typingIndicator();

      if (!endpoint) {
        // No backend configured — use the curated fallback.
        const answer = fallbackAnswer(text);
        typing.remove();
        addMessage('bot', answer);
        history.push({ role: 'assistant', content: answer });
        busy = false; if (sendBtn) sendBtn.disabled = false;
        return;
      }

      try {
        typing.innerHTML = '';
        const answer = await streamReply(typing);
        history.push({ role: 'assistant', content: answer });
      } catch {
        typing.remove();
        const answer = fallbackAnswer(text);
        addMessage('bot', answer);
        history.push({ role: 'assistant', content: answer });
      } finally {
        busy = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      }
    }

    function open() {
      panel.hidden = false;
      // next frame so the transition runs
      requestAnimationFrame(() => panel.classList.add('is-open'));
      launcher.setAttribute('aria-expanded', 'true');
      greet();
      releaseFocus = trapFocus(panel, close);
      input.focus();
    }
    function close() {
      panel.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      const done = () => { panel.hidden = true; panel.removeEventListener('transitionend', done); };
      panel.addEventListener('transitionend', done);
      // fallback in case transitions are disabled (reduced motion)
      setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 300);
      if (releaseFocus) { releaseFocus(); releaseFocus = null; }
    }

    launcher.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);

    form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });

    // Enter to send, Shift+Enter for newline; auto-grow the textarea.
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }

  /* ── QA-themed empty state for editions with no archive ───────── */
  function initEmptyEditionModal() {
    const triggers = document.querySelectorAll('.js-empty-edition');
    const modal = document.getElementById('empty-edition-modal');
    if (!triggers.length || !modal) return;
    const closeBtn = document.getElementById('empty-edition-close');
    const messageEl = document.getElementById('empty-edition-message');
    let releaseFocus = null;

    const JOKES = [
      'Looks like this edition escaped our regression tests.',
      "Even our testers couldn't find any archives for this one.",
      "404: recap not found. We've logged a bug and moved on.",
      'This edition shipped to production, but the archives never made it past QA.',
      'We searched high and low — this recap is still stuck in a "pending review" state.',
    ];

    function close() {
      modal.hidden = true;
      if (releaseFocus) { releaseFocus(); releaseFocus = null; }
    }

    triggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const year = btn.dataset.edition || 'this edition';
        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
        messageEl.textContent = joke + ' (LSTE ' + year + ')';
        modal.hidden = false;
        releaseFocus = trapFocus(modal, close);
        closeBtn.focus();
      });
    });

    closeBtn && closeBtn.addEventListener('click', close);
    modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initAnnouncement();
    initMobileMenu();
    initNavDropdown();
    initCountdown();
    initCounters();
    initReveal();
    initBackToTop();
    initSmoothScroll();
    initTabs();
    initGallery();
    initForms();
    initFooterYear();
    initTheme();
    initChat();
    initEmptyEditionModal();
  });
})();
