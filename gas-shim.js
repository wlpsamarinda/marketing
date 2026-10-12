/* Shim google.script.run -> fetch ke Google Apps Script Web App (doPost gateway).
 * Body dikirim sebagai text/plain agar tidak memicu CORS preflight. */
(function () {
  'use strict';
  var cfg = window.WMC_CONFIG || {};

  function makeRunner(ok, fail) {
    var target = {
      withSuccessHandler: function (fn) { return makeRunner(fn, fail); },
      withFailureHandler: function (fn) { return makeRunner(ok, fn); },
      withUserObject: function () { return makeRunner(ok, fail); }
    };
    return new Proxy(target, {
      get: function (t, name) {
        if (typeof name !== 'string') return undefined;
        if (name in t) return t[name];
        if (name === 'then') return undefined; // jangan dianggap thenable
        return function () {
          call(name, Array.prototype.slice.call(arguments), ok, fail);
        };
      }
    });
  }

  function call(fn, args, ok, fail) {
    ok = ok || function () {};
    fail = fail || function (e) { console.error(e); };
    if (!cfg.GAS_URL) {
      fail(new Error('GAS_URL belum diisi di config.js'));
      return;
    }
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, cfg.TIMEOUT_MS || 60000) : null;
    fetch(cfg.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args }),
      redirect: 'follow',
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.text();
    }).then(function (txt) {
      if (timer) clearTimeout(timer);
      var data;
      try { data = JSON.parse(txt); }
      catch (e) { throw new Error('Respons server bukan JSON (cek deployment GAS: akses "Anyone")'); }
      ok(data);
    }).catch(function (err) {
      if (timer) clearTimeout(timer);
      fail(err);
    });
  }

  window.google = window.google || {};
  window.google.script = { run: makeRunner(null, null), host: { close: function () {}, setHeight: function () {}, setWidth: function () {} } };
})();
