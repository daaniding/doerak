/* DOERAK localStorage wrapper. Refresh-safe state for the entire session. */
(function (global) {
  const KEY = 'doerak.session.v1';

  const Storage = {
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    save(state) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { /* quota etc — silent */ }
    },
    clear() {
      try { localStorage.removeItem(KEY); } catch (e) {}
    }
  };

  global.DoerakStorage = Storage;
})(window);
