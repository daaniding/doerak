/* DOERAK shared utilities — RNG, names, drink instructions. */
(function (global) {

  const U = {};

  /* --- RNG / array helpers --- */
  U.rand = (max) => Math.floor(Math.random() * max);
  U.randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.pickN = (arr, n) => U.shuffle(arr).slice(0, n);
  U.pickExcept = (arr, except) => {
    const pool = arr.filter(x => x !== except);
    if (!pool.length) return arr[0];
    return U.pick(pool);
  };
  U.pickTwo = (arr) => {
    if (arr.length < 2) return [arr[0], arr[0]];
    const a = U.pick(arr);
    const b = U.pickExcept(arr, a);
    return [a, b];
  };

  /* --- DOM --- */
  U.el = (tag, props = {}, ...children) => {
    const e = document.createElement(tag);
    for (const k in props) {
      if (k === 'class') e.className = props[k];
      else if (k === 'html') e.innerHTML = props[k];
      else if (k === 'text') e.textContent = props[k];
      else if (k === 'style' && typeof props[k] === 'object') Object.assign(e.style, props[k]);
      else if (k.startsWith('on') && typeof props[k] === 'function') {
        e.addEventListener(k.slice(2).toLowerCase(), props[k]);
      } else if (k.startsWith('data-') || k === 'role' || k === 'aria-label') {
        e.setAttribute(k, props[k]);
      } else {
        e[k] = props[k];
      }
    }
    children.flat().forEach(c => {
      if (c == null) return;
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  };

  U.flash = (color = 'fire') => {
    const f = document.getElementById('flash');
    if (!f) return;
    f.classList.remove('fire', 'cyan');
    void f.offsetWidth;
    f.classList.add(color);
    setTimeout(() => f.classList.remove('fire', 'cyan'), 500);
  };

  U.shake = (el, hard = false, ms = 600) => {
    if (!el) return;
    el.classList.add('shake');
    if (hard) el.classList.add('hard');
    setTimeout(() => el.classList.remove('shake', 'hard'), ms);
  };

  /* --- Template substitution -------------------------------------------
   * Tokens supported in content strings:
   *   {{name1}}, {{name2}} — random player picks (different each call)
   *   {{name:Tim}}         — specific player passthrough (used by app.js)
   *   {{drink:N}}          — converted via buildDrinkInstruction
   *   {{anyName}}          — any random player
   *
   * Supplies `players` and a `seedNames` map of pre-picked names.
   * --------------------------------------------------------------------- */
  U.fillTemplate = (template, ctx) => {
    const { players = [], availableDrinks = ['bier'], intensity = 'normaal', seedNames = {} } = ctx || {};
    const used = new Set(Object.values(seedNames));

    const pickFresh = () => {
      const pool = players.filter(p => !used.has(p));
      const pick = (pool.length ? U.pick(pool) : U.pick(players));
      used.add(pick);
      return pick;
    };

    return template
      .replace(/\{\{name1\}\}/g, () => seedNames.name1 || pickFresh())
      .replace(/\{\{name2\}\}/g, () => seedNames.name2 || pickFresh())
      .replace(/\{\{name3\}\}/g, () => seedNames.name3 || pickFresh())
      .replace(/\{\{anyName\}\}/g, () => pickFresh())
      .replace(/\{\{drink:(\d+)\}\}/g, (_, n) => {
        return U.buildDrinkInstruction(parseInt(n, 10), availableDrinks, intensity);
      });
  };

  /* --- Intensity multipliers --- */
  U.intensityMultiplier = (intensity) => {
    return intensity === 'chill' ? 0.7 : intensity === 'heftig' ? 1.4 : 1.0;
  };

  /* --- Drink instruction builder (THE CORE MECHANIC) ---
   * baseAmount: number of "units" the game thinks is appropriate.
   * availableDrinks: array of "bier" | "wijn" | "sterk".
   * intensity: 'chill' | 'normaal' | 'heftig'.
   *
   * Conversion rules from the spec:
   *  - bier  : 1 unit = 1 slok
   *  - wijn  : 1 unit = 1 slok (cap 5)
   *  - sterk : 1 unit ≈ 0.2 shot (5 units = 1 shot)
   *      <=4 units → "X teugje(s) sterk"
   *      5-8       → "1 shot"
   *      9+        → "2 shots" (only on heftig)
   *  - sterk-only → ALL base amounts × 0.6 first to prevent annihilation
   *  - rounding: heftig → ceil, normaal → round, chill → floor
   *  - hard caps: bier 8, wijn 5, shots 2 (only heftig)
   */
  U.buildDrinkInstruction = (baseAmount, availableDrinks, intensity) => {
    const drinks = (availableDrinks && availableDrinks.length) ? availableDrinks : ['bier'];
    const onlySterk = drinks.length === 1 && drinks[0] === 'sterk';

    let amount = baseAmount;
    if (onlySterk) amount *= 0.6;

    amount *= U.intensityMultiplier(intensity);

    const round = (n) => {
      if (intensity === 'heftig') return Math.max(1, Math.ceil(n));
      if (intensity === 'chill')  return Math.max(1, Math.floor(n));
      return Math.max(1, Math.round(n));
    };

    const slokken = (kind) => {
      const cap = kind === 'wijn' ? 5 : 8;
      return Math.min(cap, round(amount));
    };

    const sterkPart = () => {
      const a = round(amount);
      if (a <= 4) {
        const teugjes = Math.max(1, Math.min(3, round(amount * 0.6)));
        return teugjes === 1 ? "neem een teugje sterk" : `neem ${teugjes} teugjes sterk`;
      } else if (a <= 8) {
        return "neem een shot";
      } else {
        if (intensity === 'heftig') return "neem 2 shots";
        return "neem een shot";
      }
    };

    const has = (k) => drinks.includes(k);

    // Singles
    if (drinks.length === 1) {
      if (drinks[0] === 'bier') {
        const n = slokken('bier');
        return `drink ${n} ${n === 1 ? 'slok' : 'slokken'} bier`;
      }
      if (drinks[0] === 'wijn') {
        const n = slokken('wijn');
        return `drink ${n} ${n === 1 ? 'slok' : 'slokken'} wijn`;
      }
      if (drinks[0] === 'sterk') {
        return sterkPart();
      }
    }

    // bier + wijn
    if (has('bier') && has('wijn') && !has('sterk')) {
      const n = slokken('bier');
      return `drink ${n} ${n === 1 ? 'slok' : 'slokken'} (bier of wijn)`;
    }

    // bier + sterk
    if (has('bier') && has('sterk') && !has('wijn')) {
      const n = slokken('bier');
      return `drink ${n} ${n === 1 ? 'slok' : 'slokken'} bier OF ${sterkPart()}`;
    }

    // wijn + sterk
    if (has('wijn') && has('sterk') && !has('bier')) {
      const n = slokken('wijn');
      return `drink ${n} ${n === 1 ? 'slok' : 'slokken'} wijn OF ${sterkPart()}`;
    }

    // bier + wijn + sterk
    const n = slokken('bier');
    return `drink ${n} ${n === 1 ? 'slok' : 'slokken'} bier/wijn OF ${sterkPart()}`;
  };

  /* --- Storage of last 'cooldowns' to avoid same game repeating --- */
  U.recentlyPicked = (history, candidate, withinN = 4) => {
    const tail = history.slice(-withinN);
    return tail.includes(candidate);
  };

  /* --- Format: 1m23s --- */
  U.fmtTime = (sec) => {
    if (sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  global.U = U;
})(window);
