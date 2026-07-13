/* ============================================================
   LSTE – Hidden Admin Panel
   Access: Ctrl+Shift+A  OR  navigate to any page with #qlp-admin-2026
   Then enter the admin password.
   Password hash: SHA-256 — change PASSWORD_HASH + ADMIN_FRAGMENT below.
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────── */
  /* Change these two values to update access credentials         */
  var ADMIN_FRAGMENT  = 'qlp-admin-2026';
  var PASSWORD_HASH   = 'aae617758df69270ce7879b9c5cc1cfca41ec228886bbeb333e9e4c6ff5737c9';
  /* Default password is: LSTE2026  — change it after first login */

  /* ── SHA-256 via Web Crypto ─────────────────────────────────── */
  function sha256(str) {
    return crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(str))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
  }

  /* ── Session auth ───────────────────────────────────────────── */
  function isAuthenticated() {
    return sessionStorage.getItem('lste-admin-auth') === '1';
  }
  function setAuthenticated() {
    sessionStorage.setItem('lste-admin-auth', '1');
  }
  function clearAuthenticated() {
    sessionStorage.removeItem('lste-admin-auth');
  }

  /* ── URL trigger ────────────────────────────────────────────── */
  function isAdminUrl() {
    try {
      if (window.location.hash === '#' + ADMIN_FRAGMENT) return true;
      if (new URLSearchParams(window.location.search).has('admin')) return true;
      return false;
    } catch (e) {
      return window.location.hash === '#' + ADMIN_FRAGMENT;
    }
  }

  /* ── Keyboard trigger ───────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      toggle();
    }
  });

  /* ── Password gate HTML ─────────────────────────────────────── */
  function buildAuthHTML() {
    return [
      '<div class="adm-header">',
        '<strong>⚙ LSTE Admin</strong>',
        '<button class="adm-close" aria-label="Fermer">&#215;</button>',
      '</div>',
      '<div class="adm-body">',
        '<section class="adm-section">',
          '<h3>Accès sécurisé</h3>',
          '<p class="adm-hint">Entrez le mot de passe pour accéder aux paramètres du site.</p>',
          '<div class="adm-auth-row">',
            '<input type="password" id="adm-password" class="adm-password-input"',
            '  placeholder="Mot de passe" autocomplete="current-password" autofocus>',
            '<button class="adm-btn adm-btn--save" id="adm-auth-btn">Valider</button>',
          '</div>',
          '<p class="adm-auth-error" id="adm-auth-error" role="alert"></p>',
        '</section>',
        '<section class="adm-section adm-section--footer">',
          '<p><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> pour ouvrir / fermer ce panel.</p>',
        '</section>',
      '</div>'
    ].join('');
  }

  /* ── Admin controls HTML ────────────────────────────────────── */
  function buildHTML() {
    var mode = localStorage.getItem('lste-nav-mode') || 'sponsors';
    var ann;
    try { ann = JSON.parse(localStorage.getItem('lste-announcement') || '{}'); } catch (e) { ann = {}; }

    return [
      '<div class="adm-header">',
        '<strong>⚙ LSTE Admin</strong>',
        '<button class="adm-close" aria-label="Fermer">&#215;</button>',
      '</div>',
      '<div class="adm-body">',

        '<section class="adm-section">',
          '<h3>Mode Navigation</h3>',
          '<p class="adm-hint">Détermine quels liens apparaissent dans la barre de navigation.</p>',
          '<div class="adm-modes">',
            '<button class="adm-mode-btn' + (mode === 'sponsors' ? ' active' : '') + '" data-mode="sponsors">',
              '🤝 Mode Sponsors',
            '</button>',
            '<button class="adm-mode-btn' + (mode === 'visitors' ? ' active' : '') + '" data-mode="visitors">',
              '🎟 Mode Visiteurs',
            '</button>',
          '</div>',
          '<p class="adm-mode-desc" id="adm-mode-desc"></p>',
        '</section>',

        '<section class="adm-section">',
          '<h3>Bannière d\'annonce</h3>',
          '<label class="adm-check-label">',
            '<input type="checkbox" id="adm-ann-on"' + (ann.enabled ? ' checked' : '') + '>',
            'Afficher la bannière en haut du site',
          '</label>',
          '<textarea id="adm-ann-text" rows="2" placeholder="ex: Les inscriptions sont ouvertes !">',
            (ann.text || ''),
          '</textarea>',
          '<button class="adm-btn adm-btn--save" id="adm-ann-save">Enregistrer</button>',
        '</section>',

        '<section class="adm-section adm-section--footer">',
          '<p>Les changements s\'appliquent immédiatement (localStorage).<br>',
          '<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> pour fermer.</p>',
          '<button class="adm-btn adm-logout" id="adm-logout">Se déconnecter</button>',
        '</section>',

      '</div>'
    ].join('');
  }

  /* ── Mode description ───────────────────────────────────────── */
  var MODE_DESC = {
    sponsors: 'Sponsors & Partners, Devenir Sponsor, À propos, Call for Speakers',
    visitors: 'Réserver un billet, Programme, Speakers, Infos pratiques, À propos'
  };

  function updateModeDesc(el, mode) {
    var desc = el.querySelector('#adm-mode-desc');
    if (desc) desc.textContent = 'Nav : ' + (MODE_DESC[mode] || '');
  }

  /* ── Password validation ────────────────────────────────────── */
  function checkPassword(el, password) {
    if (!password) return;
    var errEl = el.querySelector('#adm-auth-error');
    var btn   = el.querySelector('#adm-auth-btn');
    if (btn) { btn.disabled = true; btn.textContent = '…'; }

    sha256(password).then(function (h) {
      if (h === PASSWORD_HASH) {
        setAuthenticated();
        el.innerHTML = buildHTML();
        bindAdminEvents(el);
        var first = el.querySelector('button, input, textarea');
        if (first) first.focus();
      } else {
        if (errEl) { errEl.textContent = 'Mot de passe incorrect.'; }
        if (btn)   { btn.disabled = false; btn.textContent = 'Valider'; }
        var input = el.querySelector('#adm-password');
        if (input) { input.value = ''; input.focus(); }
      }
    }).catch(function () {
      if (errEl) errEl.textContent = 'Erreur de validation (contexte non sécurisé ?).';
      if (btn)   { btn.disabled = false; btn.textContent = 'Valider'; }
    });
  }

  /* ── Event binding ──────────────────────────────────────────── */
  function bindAuthEvents(el) {
    el.querySelector('.adm-close').addEventListener('click', hide);
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

    var btn   = el.querySelector('#adm-auth-btn');
    var input = el.querySelector('#adm-password');
    if (btn)   btn.addEventListener('click', function () { checkPassword(el, input ? input.value : ''); });
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') checkPassword(el, input.value);
    });
  }

  function bindAdminEvents(el) {
    el.querySelector('.adm-close').addEventListener('click', hide);
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

    el.querySelectorAll('.adm-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        el.querySelectorAll('.adm-mode-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var m = btn.dataset.mode;
        updateModeDesc(el, m);
        if (window.LSTE && window.LSTE.setNavMode) window.LSTE.setNavMode(m);
      });
    });

    var saveBtn = el.querySelector('#adm-ann-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var enabled = el.querySelector('#adm-ann-on').checked;
        var text    = el.querySelector('#adm-ann-text').value.trim();
        if (window.LSTE && window.LSTE.setAnnouncement) window.LSTE.setAnnouncement(text, enabled);
        saveBtn.textContent = 'Enregistré ✓';
        saveBtn.classList.add('saved');
        setTimeout(function () {
          saveBtn.textContent = 'Enregistrer';
          saveBtn.classList.remove('saved');
        }, 1800);
      });
    }

    var logoutBtn = el.querySelector('#adm-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        clearAuthenticated();
        el.innerHTML = buildAuthHTML();
        bindAuthEvents(el);
        var input = el.querySelector('#adm-password');
        if (input) input.focus();
      });
    }

    updateModeDesc(el, localStorage.getItem('lste-nav-mode') || 'sponsors');
  }

  /* ── Panel state ────────────────────────────────────────────── */
  var panel   = null;
  var visible = false;

  function show() {
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'lste-admin-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'LSTE Admin Panel');
      panel.setAttribute('aria-modal', 'true');
      document.body.appendChild(panel);
    }

    if (isAuthenticated()) {
      panel.innerHTML = buildHTML();
      bindAdminEvents(panel);
    } else {
      panel.innerHTML = buildAuthHTML();
      bindAuthEvents(panel);
    }

    panel.classList.add('open');
    visible = true;

    var first = panel.querySelector('input[type="password"], button');
    if (first) first.focus();
  }

  function hide() {
    if (panel) panel.classList.remove('open');
    visible = false;
  }

  function toggle() {
    if (visible) hide(); else show();
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    if (isAdminUrl()) show();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
