/* DOERAK — game registry, slot machine, picker logic. */
(function (global) {

  const Registry = {
    list() { return Object.values(window.DOERAK_GAMES || {}); },
    byId(id) { return (window.DOERAK_GAMES || {})[id]; },

    /* Pick the next game.
     * - intensity-weighted random
     * - skip games picked in last N rounds
     * - cap "long" games to 1 per ~5
     * - favor "sociale" every 6-8 rounds for a breather
     */
    pickNext(history, intensity) {
      const all = this.list();
      const recentLong = history.slice(-5).some(id => {
        const g = this.byId(id); return g && g.long;
      });
      const idsRecent = history.slice(-4);
      const sinceSociale = (() => {
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i] === 'sociale') return history.length - 1 - i;
        }
        return 999;
      })();

      // Sociale forced breather
      if (sinceSociale > 7) {
        return this.byId('sociale');
      }

      const candidates = all.filter(g => {
        if (idsRecent.includes(g.id)) return false;
        if (g.long && recentLong) return false;
        return true;
      });

      const weighted = [];
      candidates.forEach(g => {
        const w = (g.weight && g.weight[intensity]) || 1.0;
        const slots = Math.max(1, Math.round(w * 10));
        for (let i = 0; i < slots; i++) weighted.push(g);
      });
      return weighted[Math.floor(Math.random() * weighted.length)];
    }
  };

  /* Slot machine — full screen takeover, lands on a target name (the game name). */
  function slotMachine(rootEl, candidates, finalName, onDone) {
    rootEl.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'slotmachine';
    wrap.innerHTML = `
      <div class="label-top">Volgend spel</div>
      <div class="reel-frame">
        <div class="reel"></div>
      </div>`;
    rootEl.appendChild(wrap);

    const reel = wrap.querySelector('.reel');
    // pad list with the final at the end
    const ITEM_H = 80;
    const padding = 18; // items above the final to pre-roll
    const pool = [];
    for (let i = 0; i < padding; i++) pool.push(U.pick(candidates));
    pool.push(finalName);

    pool.forEach(name => {
      const n = document.createElement('div');
      n.className = 'name';
      n.textContent = name;
      reel.appendChild(n);
    });

    // initial position so the first item is centered
    reel.style.transform = `translateY(-${ITEM_H / 2}px)`;
    reel.classList.add('spinning');
    AudioFX.whoosh();

    // tick sounds during reel
    let tickCount = 0;
    const tickInt = setInterval(() => {
      AudioFX.slotClick();
      tickCount++;
      if (tickCount > 24) clearInterval(tickInt);
    }, 100);

    // animate to land
    const totalItems = pool.length;
    const finalY = -((totalItems - 1) * ITEM_H + ITEM_H / 2);
    requestAnimationFrame(() => {
      reel.style.transition = 'transform 2400ms cubic-bezier(0.18, 0.85, 0.22, 1)';
      reel.style.transform = `translateY(${finalY}px)`;
    });

    setTimeout(() => {
      reel.classList.remove('spinning');
      reel.classList.add('landing');
    }, 1700);

    setTimeout(() => {
      reel.classList.remove('landing');
      reel.classList.add('landed');
      // mark final
      const last = reel.querySelector('.name:last-child');
      if (last) last.classList.add('target');
      AudioFX.boom();
      U.flash('fire');
      clearInterval(tickInt);
    }, 2400);

    setTimeout(() => {
      onDone();
    }, 3200);
  }

  global.DoerakGames = Registry;
  global.DoerakSlot = slotMachine;
})(window);
