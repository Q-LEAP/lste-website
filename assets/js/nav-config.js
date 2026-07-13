/* ============================================================
   LSTE – Nav Configuration & Dynamic Renderer
   Supports two modes: 'sponsors' (default) and 'visitors'
   Switch via Admin Panel (Ctrl+Shift+A) or ?admin URL param
   ============================================================ */

(function () {
  'use strict';

  /* ── Mode configuration ─────────────────────────────────────── */
  var MODES = {

    sponsors: {
      label: 'Sponsors Mode',
      items: [
        { label: 'Sponsors & Partners',  href: 'sponsors/index.html' },
        { label: 'Become a Sponsor',     href: 'become-a-sponsor/index.html', badge: 'Join us' },
        {
          label: 'About the Event', href: 'about/index.html',
          children: [
            { label: 'About the LSTE',    href: 'about/index.html' },
            { label: 'Previous Editions', href: 'previous-editions/index.html' },
            { label: 'Gallery',           href: 'gallery/index.html' },
            { label: 'Press',             href: 'press/index.html' },
            { label: 'Contact us',        href: 'contact/index.html' }
          ]
        },
        { label: 'Call for Speakers', href: 'call-for-speakers/index.html' }
      ],
      cta: { label: 'Become a Sponsor', href: 'become-a-sponsor/index.html', icon: 'fa-star' }
    },

    visitors: {
      label: 'Visitors Mode',
      items: [
        { label: 'Book Your Ticket', href: 'ticket/index.html', badge: 'Free' },
        { label: 'Programme',        href: 'schedule/index.html' },
        { label: 'Speakers',         href: 'speakers/index.html' },
        {
          label: 'Practical Info', href: 'venue/index.html',
          children: [
            { label: 'How to Come',    href: 'venue/index.html' },
            { label: 'Venue & Parking',href: 'venue/index.html' },
            { label: 'Programme',      href: 'schedule/index.html' },
            { label: 'Contact us',     href: 'contact/index.html' }
          ]
        },
        {
          label: 'About the Event', href: 'about/index.html',
          children: [
            { label: 'About the LSTE',    href: 'about/index.html' },
            { label: 'Previous Editions', href: 'previous-editions/index.html' },
            { label: 'Gallery',           href: 'gallery/index.html' },
            { label: 'Press',             href: 'press/index.html' }
          ]
        }
      ],
      cta: { label: 'Get a Ticket', href: 'ticket/index.html', icon: 'fa-hand-point-right' }
    }
  };

  /* ── Detect page depth from stylesheet link ─────────────────── */
  function getDepth() {
    var link = document.querySelector('link[href*="assets/css/styles.css"]');
    if (!link) return 0;
    return ((link.getAttribute('href') || '').match(/\.\.\//g) || []).length;
  }

  /* ── Build relative path for this page's depth ─────────────── */
  function resolve(href, depth) {
    return '../'.repeat(depth) + href;
  }

  /* ── Render desktop nav ─────────────────────────────────────── */
  function renderDesktop(cfg, depth) {
    var nav = document.getElementById('mega-menu-main');
    if (!nav) return;
    nav.innerHTML = cfg.items.map(function (item) {
      var href = resolve(item.href, depth);
      if (item.children) {
        return (
          '<li class="mega-menu-item mega-menu-item-has-children">' +
            '<a class="mega-menu-link" href="' + href + '" aria-haspopup="true" aria-expanded="false">' +
              item.label + '<span class="mega-indicator" aria-hidden="true"></span>' +
            '</a>' +
            '<ul class="mega-sub-menu">' +
              item.children.map(function (c) {
                return '<li class="mega-menu-item"><a class="mega-menu-link" href="' + resolve(c.href, depth) + '">' + c.label + '</a></li>';
              }).join('') +
            '</ul>' +
          '</li>'
        );
      }
      var badge = item.badge ? ' <span class="nav-badge">' + item.badge + '</span>' : '';
      return '<li class="mega-menu-item"><a class="mega-menu-link" href="' + href + '">' + item.label + badge + '</a></li>';
    }).join('');
  }

  /* ── Render CTA button ──────────────────────────────────────── */
  function renderCta(cfg, depth) {
    var btn = document.querySelector('.header-ticket-btn');
    if (!btn || !cfg.cta) return;
    btn.href = resolve(cfg.cta.href, depth);
    btn.innerHTML = '<i class="fas ' + cfg.cta.icon + '" aria-hidden="true"></i> ' + cfg.cta.label;
  }

  /* ── Render mobile nav ──────────────────────────────────────── */
  function renderMobile(cfg, depth) {
    var list = document.querySelector('.mobile-nav-list');
    if (!list) return;
    var ctaHref = resolve(cfg.cta.href, depth);
    list.innerHTML =
      cfg.items.map(function (item) {
        var href = resolve(item.href, depth);
        if (item.children) {
          return (
            '<li class="has-submenu">' +
              '<a href="' + href + '">' + item.label + ' <span class="mobile-sub-toggle" aria-hidden="true">&#9660;</span></a>' +
              '<ul class="mobile-submenu">' +
                item.children.map(function (c) {
                  return '<li><a href="' + resolve(c.href, depth) + '">' + c.label + '</a></li>';
                }).join('') +
              '</ul>' +
            '</li>'
          );
        }
        return '<li><a href="' + href + '">' + item.label + '</a></li>';
      }).join('') +
      '<li><a href="' + ctaHref + '" class="btn"><i class="fas ' + cfg.cta.icon + '" aria-hidden="true"></i> ' + cfg.cta.label + '</a></li>';
  }

  /* ── Render announcement banner ─────────────────────────────── */
  function setAnnH(px) {
    document.documentElement.style.setProperty('--ann-h', px + 'px');
  }

  function renderAnnouncement() {
    var existing = document.getElementById('lste-announcement');
    var stored;
    try { stored = JSON.parse(localStorage.getItem('lste-announcement') || 'null'); } catch (e) { stored = null; }

    if (!stored || !stored.enabled || !stored.text) {
      if (existing) existing.remove();
      setAnnH(0);
      return;
    }
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'lste-announcement';
      existing.setAttribute('role', 'status');
      document.body.insertAdjacentElement('afterbegin', existing);
    }
    existing.innerHTML =
      '<span>' + stored.text + '</span>' +
      '<button class="ann-close" aria-label="Close announcement">&#215;</button>';

    existing.querySelector('.ann-close').addEventListener('click', function () {
      setAnnH(0);
      existing.remove();
    });

    requestAnimationFrame(function () { setAnnH(existing.offsetHeight); });
  }

  /* ── Main render ────────────────────────────────────────────── */
  function render() {
    var mode = localStorage.getItem('lste-nav-mode') || 'sponsors';
    var cfg  = MODES[mode] || MODES.sponsors;
    var depth = getDepth();

    renderDesktop(cfg, depth);
    renderCta(cfg, depth);
    renderMobile(cfg, depth);
    renderAnnouncement();
  }

  /* ── Public API (used by admin.js) ─────────────────────────── */
  window.LSTE = window.LSTE || {};
  window.LSTE.navModes    = MODES;
  window.LSTE.renderNav   = render;
  window.LSTE.setNavMode  = function (mode) {
    localStorage.setItem('lste-nav-mode', mode);
    render();
    if (window.LSTE.reinitMobileMenu) window.LSTE.reinitMobileMenu();
  };
  window.LSTE.setAnnouncement = function (text, enabled) {
    localStorage.setItem('lste-announcement', JSON.stringify({ text: text, enabled: !!enabled }));
    renderAnnouncement();
  };

  /* ── Run ────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

})();
