/* PWA: service worker, install prompt, indikator offline, bottom nav (mobile). */
(function () {
  'use strict';
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        reg.addEventListener('updatefound', function () {
          var w = reg.installing;
          if (w) w.addEventListener('statechange', function () {
            if (w.state === 'installed' && navigator.serviceWorker.controller && typeof toast === 'function') {
              toast('Versi baru tersedia. Muat ulang aplikasi untuk memperbarui.', 'info');
            }
          });
        });
      }).catch(function () {});
    });
  }

  var banner = document.createElement('div');
  banner.id = 'pwaBanner';
  banner.textContent = 'Anda sedang offline — data tidak dapat dimuat/disimpan.';
  document.body.appendChild(banner);
  function net() { banner.classList.toggle('show', !navigator.onLine); }
  window.addEventListener('online', net); window.addEventListener('offline', net); net();

  var deferred = null;
  var btn = document.createElement('button');
  btn.id = 'pwaInstall'; btn.className = 'btn btn-primary'; btn.textContent = '📲 Pasang Aplikasi';
  document.body.appendChild(btn);
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; btn.classList.add('show'); });
  btn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; btn.classList.remove('show'); });
  });
  window.addEventListener('appinstalled', function () { btn.classList.remove('show'); });

  /* Bottom nav (hanya tampil <=900px lewat CSS) */
  var nav = document.createElement('nav');
  nav.id = 'bottomNav'; nav.className = 'hidden';
  document.body.appendChild(nav);
  var PREF = ['dashboard', 'customers', 'reservations', 'leads', 'outreach', 'pos'];
  function build() {
    if (typeof App === 'undefined' || !App.user || typeof ROUTES === 'undefined') { nav.classList.add('hidden'); return; }
    var allowed = ROUTES.filter(function (r) { return r.roles.indexOf(App.user.role) >= 0; });
    var pick = [];
    PREF.forEach(function (k) { var r = allowed.filter(function (x) { return x.key === k; })[0]; if (r && pick.length < 4) pick.push(r); });
    allowed.forEach(function (r) { if (pick.length < 4 && pick.indexOf(r) < 0) pick.push(r); });
    nav.innerHTML = pick.map(function (r) {
      return '<a role="button" data-route="' + r.key + '"><span>' + r.icon + '</span><span>' + r.title + '</span></a>';
    }).join('') + '<a role="button" data-menu="1"><span>☰</span><span>Menu</span></a>';
    nav.classList.remove('hidden');
    mark();
  }
  function mark() {
    var cur = (typeof App !== 'undefined') ? App.currentRoute : '';
    Array.prototype.forEach.call(nav.querySelectorAll('a[data-route]'), function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === cur);
    });
  }
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    if (a.getAttribute('data-menu')) { toggleSidebar(); return; }
    navigate(a.getAttribute('data-route'));
  });
  var shell = document.getElementById('appShell');
  function sync() {
    if (!shell || shell.classList.contains('hidden')) { nav.classList.add('hidden'); return; }
    if (nav.classList.contains('hidden') || !nav.firstChild) build(); else mark();
  }
  if (shell) new MutationObserver(sync).observe(shell, { attributes: true, attributeFilter: ['class'] });
  var oh = window.handleRoute;
  if (typeof oh === 'function') window.handleRoute = function () { var r = oh.apply(this, arguments); sync(); mark(); return r; };
})();
