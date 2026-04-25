/* DOERAK — main controller. Screen routing, state, game loop orchestration. */
(function () {

  const APP = document.getElementById('app');

  /* ---- State ---- */
  const initialState = () => ({
    screen: 'welcome',
    players: [],
    availableDrinks: [],
    duration: null,           // 30 / 60 / 120 / 999 (hele avond)
    intensity: 'normaal',
    voorspelling: null,       // { winner, votedBy: { name -> name } }
    seating: [],
    history: [],              // game ids played
    activeRules: [],          // [{ id, text, color, expiresAt? }]
    sessionStart: null,
    sessionEnd: null,
    paused: false,
    pauseStart: null,
    pausedTotal: 0,
    stats: { mostLikelyPicks: {} },
    eindscherm: null
  });

  let state = DoerakStorage.load() || initialState();

  function persist() {
    DoerakStorage.save(state);
  }
  function reset() {
    state = initialState();
    DoerakStorage.clear();
  }

  /* ---- Screen mounting ---- */
  function mount(builder) {
    const olds = APP.querySelectorAll('.screen');
    const next = U.el('div', { class: 'screen entering' });
    APP.appendChild(next);
    builder(next);
    olds.forEach((old, i) => {
      old.classList.remove('entering');
      // anything older than the immediate previous gets nuked instantly to avoid stacking
      if (i < olds.length - 1) {
        old.remove();
        return;
      }
      old.classList.add('exiting');
      setTimeout(() => old.remove(), 300);
    });
    setTimeout(() => next.classList.remove('entering'), 400);
  }

  function go(screen) {
    state.screen = screen;
    persist();
    routeRender();
  }

  function routeRender() {
    switch (state.screen) {
      case 'welcome':       return renderWelcome();
      case 'setup-players': return renderSetupPlayers();
      case 'setup-drinks':  return renderSetupDrinks();
      case 'setup-duur':    return renderSetupDuur();
      case 'setup-intens':  return renderSetupIntens();
      case 'voorspelling':  return renderVoorspelling();
      case 'zitplaatsen':   return renderZitplaatsen();
      case 'gameloop':      return renderGameloop();
      case 'eindscherm':    return renderEindscherm();
      default:              return renderWelcome();
    }
  }

  /* Per-game color themes — sets body[data-theme] for vibrant per-game backgrounds. */
  const GAME_THEMES = {
    tijdsbom: 'red', reactietest: 'lime', mostLikelyTo: 'pink',
    mostLikelyBomb: 'red', imposter: 'purple', paranoia: 'purple',
    drunkocracy: 'pink', hotSeat: 'orange', twentyone: 'pink',
    buzz: 'lime', categorieTimer: 'orange', waterval: 'cyan',
    blindeKeuze: 'purple', regelRoulette: 'orange', buddy: 'pink',
    saboteur: 'red', sociale: 'lime', dubbelPech: 'red',
    uitdelen: 'purple', guess5: 'orange'
  };

  function setTheme(t) {
    if (t) document.body.setAttribute('data-theme', t);
    else   document.body.removeAttribute('data-theme');
  }

  /* ---- 1. WELCOME ---- */
  function renderWelcome() {
    setTheme(null);
    mount(s => {
      s.classList.add('welcome');
      s.appendChild(U.el('div', { class: 'marker', text: 'NL · 18+ · ★' }));
      s.appendChild(U.el('div', { class: 'marker right', text: '20 GAMES' }));

      // floating party emoji decorations
      ['🍻','🥂','🎉','🥳'].forEach((em, i) => {
        s.appendChild(U.el('div', { class: 'welcome-emoji e' + (i+1), text: em }));
      });

      const title = U.el('h1', { class: 'welcome-title' });
      const letters = ['D', 'O', 'E', 'R', 'A', 'K'];
      letters.forEach((l, i) => {
        const span = U.el('span', { class: 'l letter-stamp', 'data-l': l });
        span.textContent = l;
        span.style.animationDelay = (i * 0.08) + 's';
        title.appendChild(span);
      });
      s.appendChild(title);

      s.appendChild(U.el('div', { class: 'welcome-tag', text: 'drink. doe. doerak.' }));

      const stack = U.el('div', { class: 'btn-stack' });
      const session = DoerakStorage.load();
      const hasSession = session && session.players && session.players.length >= 3 && session.screen !== 'welcome' && session.screen !== 'eindscherm';

      stack.appendChild(U.el('button', {
        class: 'btn full', text: 'NIEUW SPEL',
        onClick: () => { AudioFX.unlock(); AudioFX.beep(); reset(); go('setup-players'); }
      }));
      if (hasSession) {
        stack.appendChild(U.el('button', {
          class: 'btn full ghost', text: 'VERDER SPELEN',
          onClick: () => { AudioFX.unlock(); AudioFX.beep(); state = session; go(state.screen); }
        }));
      }
      s.appendChild(stack);

      s.appendChild(U.el('div', { class: 'welcome-bottom', text: 'TAP OM TE BEGINNEN · DRINK MET MATEN' }));
    });
  }

  /* ---- 2. SETUP ---- */
  function setupShell(stepN, builder) {
    setTheme(null);
    mount(s => {
      s.classList.add('setup');
      const prog = U.el('div', { class: 'setup-progress' });
      [1, 2, 3, 4].forEach(i => {
        const span = U.el('span');
        if (i < stepN) span.classList.add('done');
        if (i === stepN) span.classList.add('current');
        prog.appendChild(span);
      });
      s.appendChild(prog);
      const step = U.el('div', { class: 'setup-step' });
      s.appendChild(step);
      builder(step);
    });
  }

  function renderSetupPlayers() {
    setupShell(1, step => {
      step.appendChild(U.el('div', { class: 'num', text: '01 / spelers' }));
      step.appendChild(U.el('h2', { text: 'WIE DRINKT MEE?' }));
      step.appendChild(U.el('p', { text: 'Min 3, max 10. Geen dubbele namen.' }));

      const inputRow = U.el('div', { class: 'player-input' });
      const inp = U.el('input', { type: 'text', placeholder: 'Naam...', maxLength: 16 });
      const addBtn = U.el('button', { class: 'btn small', text: '+ ADD' });
      inputRow.appendChild(inp); inputRow.appendChild(addBtn);
      step.appendChild(inputRow);

      const list = U.el('div', { class: 'player-list' });
      step.appendChild(list);

      const footer = U.el('div', { class: 'setup-footer' });
      const back = U.el('button', { class: 'btn ghost small', text: '← TERUG', onClick: () => go('welcome') });
      const nextBtn = U.el('button', { class: 'btn', text: 'VERDER →' });
      footer.appendChild(back); footer.appendChild(nextBtn);
      step.appendChild(footer);

      function refresh() {
        list.innerHTML = '';
        state.players.forEach(p => {
          const chip = U.el('span', {
            class: 'chip removable', text: p,
            onClick: () => { state.players = state.players.filter(n => n !== p); persist(); refresh(); }
          });
          list.appendChild(chip);
        });
        nextBtn.disabled = state.players.length < 3 || state.players.length > 10;
      }
      refresh();

      function add() {
        const v = inp.value.trim();
        if (!v) return;
        if (state.players.length >= 10) return;
        if (state.players.find(n => n.toLowerCase() === v.toLowerCase())) {
          inp.value = ''; return;
        }
        state.players.push(v);
        inp.value = ''; persist(); refresh();
        AudioFX.softBeep();
      }
      addBtn.addEventListener('click', add);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
      nextBtn.addEventListener('click', () => { AudioFX.beep(); go('setup-drinks'); });
    });
  }

  function renderSetupDrinks() {
    setupShell(2, step => {
      step.appendChild(U.el('div', { class: 'num', text: '02 / drank' }));
      step.appendChild(U.el('h2', { text: 'WAT STAAT ER OP TAFEL?' }));
      step.appendChild(U.el('p', { text: 'Kies 1 of meer — dit bepaalt alle drinkopdrachten.' }));

      const opts = [
        { id: 'bier', label: 'BIER', desc: 'Pilsje, IPA, alles' },
        { id: 'wijn', label: 'WIJN', desc: 'Rood, wit, rosé' },
        { id: 'sterk', label: 'STERK', desc: 'Tequila, vodka, whiskey, shots' }
      ];
      const wrap = U.el('div', { class: 'drink-options' });
      step.appendChild(wrap);

      function refresh() {
        wrap.innerHTML = '';
        opts.forEach(o => {
          const active = state.availableDrinks.includes(o.id);
          const card = U.el('div', { class: 'drink-option' + (active ? ' active' : '') });
          card.appendChild(U.el('div', { class: 'icon', text: o.id === 'bier' ? '🍺' : o.id === 'wijn' ? '🍷' : '🥃' }));
          card.appendChild(U.el('div', { class: 'text' },
            U.el('div', { class: 'name', text: o.label }),
            U.el('div', { class: 'desc', text: o.desc })
          ));
          card.appendChild(U.el('div', { class: 'check', text: '✓' }));
          card.addEventListener('click', () => {
            AudioFX.softBeep();
            if (active) state.availableDrinks = state.availableDrinks.filter(x => x !== o.id);
            else state.availableDrinks.push(o.id);
            persist(); refresh(); update();
          });
          wrap.appendChild(card);
        });
      }
      refresh();

      const footer = U.el('div', { class: 'setup-footer' });
      const back = U.el('button', { class: 'btn ghost small', text: '← TERUG', onClick: () => go('setup-players') });
      const nextBtn = U.el('button', { class: 'btn', text: 'VERDER →', onClick: () => { AudioFX.beep(); go('setup-duur'); } });
      footer.appendChild(back); footer.appendChild(nextBtn);
      step.appendChild(footer);

      function update() { nextBtn.disabled = state.availableDrinks.length === 0; }
      update();
    });
  }

  function renderSetupDuur() {
    setupShell(3, step => {
      step.appendChild(U.el('div', { class: 'num', text: '03 / duur' }));
      step.appendChild(U.el('h2', { text: 'HOE LANG?' }));
      step.appendChild(U.el('p', { text: 'Een timer telt af. Wanneer hij op nul staat, krijg je de keuze.' }));

      const opts = [
        { id: 30, label: '30 MIN', sub: 'KORT EN HEET' },
        { id: 60, label: '1 UUR', sub: 'KLASSIEKER' },
        { id: 120, label: '2 UUR', sub: 'EEN AVOND' },
        { id: 999, label: 'HELE AVOND', sub: 'GEEN GRENZEN' }
      ];
      const grid = U.el('div', { class: 'option-grid' });
      step.appendChild(grid);

      function refresh() {
        grid.innerHTML = '';
        opts.forEach(o => {
          const active = state.duration === o.id;
          const card = U.el('div', { class: 'option-card' + (active ? ' active' : '') },
            U.el('div', { class: 'label', text: o.label }),
            U.el('div', { class: 'sub', text: o.sub })
          );
          card.addEventListener('click', () => {
            AudioFX.softBeep();
            state.duration = o.id; persist(); refresh(); update();
          });
          grid.appendChild(card);
        });
      }
      refresh();

      const footer = U.el('div', { class: 'setup-footer' });
      const back = U.el('button', { class: 'btn ghost small', text: '← TERUG', onClick: () => go('setup-drinks') });
      const nextBtn = U.el('button', { class: 'btn', text: 'VERDER →', onClick: () => { AudioFX.beep(); go('setup-intens'); } });
      footer.appendChild(back); footer.appendChild(nextBtn);
      step.appendChild(footer);

      function update() { nextBtn.disabled = !state.duration; }
      update();
    });
  }

  function renderSetupIntens() {
    setupShell(4, step => {
      step.appendChild(U.el('div', { class: 'num', text: '04 / intensiteit' }));
      step.appendChild(U.el('h2', { text: 'HOE HEFTIG?' }));
      step.appendChild(U.el('p', { text: 'Kies de vibe. Dit schaalt drank, weegt games en kleurt content.' }));

      const opts = [
        { id: 'chill', label: 'CHILL', sub: 'GEZELLIG, RUSTIG, GEEN PRINT-OUT' },
        { id: 'normaal', label: 'NORMAAL', sub: 'GOEIE AVOND, MORGEN GEWOON OP' },
        { id: 'heftig', label: 'HEFTIG', sub: 'DOERAK MODUS, JE BENT GEWAARSCHUWD' }
      ];
      const grid = U.el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
      step.appendChild(grid);

      opts.forEach(o => {
        const active = state.intensity === o.id;
        const card = U.el('div', { class: 'option-card' + (active ? ' active' : ''), style: { textAlign: 'left' } },
          U.el('div', { class: 'label', text: o.label }),
          U.el('div', { class: 'sub', text: o.sub })
        );
        card.addEventListener('click', () => {
          AudioFX.softBeep();
          state.intensity = o.id; persist();
          grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        });
        grid.appendChild(card);
      });

      const footer = U.el('div', { class: 'setup-footer' });
      const back = U.el('button', { class: 'btn ghost small', text: '← TERUG', onClick: () => go('setup-duur') });
      const nextBtn = U.el('button', { class: 'btn', text: 'VOORSPELLING →', onClick: () => { AudioFX.beep(); go('voorspelling'); } });
      footer.appendChild(back); footer.appendChild(nextBtn);
      step.appendChild(footer);
    });
  }

  /* ---- 3. VOORSPELLING (and reused for Eindscherm) ---- */
  function renderVoteFlow({ heading, blurb, onDone, exitTo }) {
    let i = 0;
    const votes = {}; // voter -> picked
    const tally = {};

    function next() {
      mount(s => {
        s.classList.add('vote-screen');
        if (i >= state.players.length) return reveal(s);
        const voter = state.players[i];
        s.appendChild(U.el('div', { class: 'kicker orange', text: heading }));
        s.appendChild(U.el('div', { class: 'who-turn', text: voter }));
        s.appendChild(U.el('div', { class: 'pass-instruction', text: blurb }));
        const list = U.el('div', { class: 'target-list' });
        state.players.forEach(p => {
          list.appendChild(U.el('button', {
            class: 'target-btn', text: p,
            onClick: () => {
              AudioFX.softBeep();
              votes[voter] = p;
              tally[p] = (tally[p] || 0) + 1;
              i++; next();
            }
          }));
        });
        s.appendChild(list);
        const footer = U.el('div', { style: { marginTop: '12px' } });
        if (exitTo) {
          footer.appendChild(U.el('button', { class: 'btn small ghost', text: '← TERUG', onClick: () => go(exitTo) }));
        }
        s.appendChild(footer);
      });
    }

    function reveal(s) {
      // dramatic count up then big reveal
      s.appendChild(U.el('div', { class: 'kicker orange', text: 'STEMMEN BINNEN' }));
      const counter = U.el('div', { class: 'reveal-counter', text: '0' });
      const stage = U.el('div', { class: 'reveal-stage' });
      stage.appendChild(counter);
      s.appendChild(stage);

      let count = 0;
      const total = Object.values(votes).length;
      const tickInt = setInterval(() => {
        count++;
        counter.textContent = count;
        AudioFX.tick();
        if (count >= total) {
          clearInterval(tickInt);
          AudioFX.boom(); U.flash('fire');
          stage.innerHTML = '';
          // determine winner
          let max = 0, winner = null;
          for (const k in tally) if (tally[k] > max) { max = tally[k]; winner = k; }
          stage.appendChild(U.el('div', { class: 'reveal-name' },
            document.createTextNode(winner),
            U.el('div', { class: 'num', text: max + ' / ' + total + ' STEMMEN' })
          ));
          const next = U.el('button', { class: 'btn full', text: 'VERDER →',
            onClick: () => onDone({ winner, votes, tally }) });
          s.appendChild(next);
        }
      }, 350);
    }

    next();
  }

  function renderVoorspelling() {
    setTheme('purple');
    renderVoteFlow({
      heading: '🤫 GEEF ANONIEM JE GOK DOOR',
      blurb: 'Wie wordt vannacht het meest dronken? Privé.',
      exitTo: 'setup-intens',
      onDone: ({ winner, votes }) => {
        state.voorspelling = { winner, votes };
        persist();
        go('zitplaatsen');
      }
    });
  }

  /* ---- 4. ZITPLAATSEN ---- */
  function renderZitplaatsen() {
    setTheme('cyan');
    if (!state.seating.length || state.seating.length !== state.players.length) {
      state.seating = U.shuffle(state.players);
      persist();
    }
    mount(s => {
      s.classList.add('seating');
      s.appendChild(U.el('div', { class: 'kicker orange', text: 'ZITVOLGORDE' }));
      s.appendChild(U.el('h2', { text: 'JE BUREN VAN VANAVOND' }));
      const tableWrap = U.el('div', { class: 'seating-table' });
      tableWrap.appendChild(U.el('div', { class: 'table-disc' }));
      state.seating.forEach((p, idx) => {
        const angle = (idx / state.seating.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 40;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const seat = U.el('div', {
          class: 'seat',
          style: { left: x + '%', top: y + '%', transform: 'translate(-50%, -50%)', animationDelay: (idx * 0.08) + 's' },
          text: p
        });
        tableWrap.appendChild(seat);
      });
      s.appendChild(tableWrap);
      s.appendChild(U.el('p', { style: { textAlign: 'center', color: 'var(--ink-bone-dim)' },
        text: 'Onthoud dit — sommige games gebruiken je buren.' }));

      const footer = U.el('div', { class: 'setup-footer' });
      footer.appendChild(U.el('button', { class: 'btn ghost small', text: '← OPNIEUW LOTEN',
        onClick: () => { state.seating = U.shuffle(state.players); persist(); routeRender(); } }));
      footer.appendChild(U.el('button', { class: 'btn', text: 'START GAME →',
        onClick: () => {
          state.sessionStart = Date.now();
          state.sessionEnd = state.sessionStart + (state.duration * 60 * 1000);
          state.history = [];
          state.activeRules = [];
          state.stats = { mostLikelyPicks: {} };
          persist();
          AudioFX.boom();
          go('gameloop');
        } }));
      s.appendChild(footer);
    });
  }

  /* ---- 5. GAME LOOP ---- */
  let loopTimer = null;
  let activeGameCleanup = null;

  function renderGameloop() {
    AudioFX.unlock();
    mount(s => {
      s.classList.add('gameloop');

      // Topbar
      const tb = U.el('div', { class: 'topbar' });
      const left = U.el('div', { class: 'row' },
        U.el('span', { class: 'pill lime', text: '🎲 RONDE ' + (state.history.length + 1) }),
      );
      const right = U.el('div', { class: 'row' });
      const timeEl = U.el('span', { class: 'pill pink', text: '⏱ --:--' });
      const pauseBtn = U.el('button', {
        class: 'btn small ghost', style: { padding: '6px 14px', minHeight: '0', fontSize: '14px' },
        text: '⏸',
        onClick: () => showPauseMenu()
      });
      right.appendChild(timeEl); right.appendChild(pauseBtn);
      tb.appendChild(left); tb.appendChild(right);
      s.appendChild(tb);

      // Rules ribbon
      const ribbon = U.el('div', { class: 'rules-ribbon', id: 'rules-ribbon' });
      s.appendChild(ribbon);
      renderRules(ribbon);

      const stage = U.el('div', { class: 'stage' });
      s.appendChild(stage);

      // Hook for games to add rules
      const apiCtx = makeGameCtx(stage);

      // Update timer
      const updateTime = () => {
        if (state.paused) {
          timeEl.textContent = '⏸ PAUZE';
          return;
        }
        const remainMs = state.sessionEnd - Date.now();
        if (remainMs <= 0) {
          if (!state._timeUpShown) {
            state._timeUpShown = true;
            persist();
            showTimeUp(s);
          }
          timeEl.textContent = '⏱ 0:00';
          return;
        }
        timeEl.textContent = '⏱ ' + U.fmtTime(remainMs / 1000);
      };
      if (loopTimer) clearInterval(loopTimer);
      loopTimer = setInterval(updateTime, 1000);
      updateTime();

      // Start with slot machine into a game
      pickAndPlay(stage, apiCtx);
    });
  }

  function renderRules(ribbonEl) {
    if (!ribbonEl) ribbonEl = document.getElementById('rules-ribbon');
    if (!ribbonEl) return;
    ribbonEl.innerHTML = '';
    if (!state.activeRules.length) {
      ribbonEl.style.display = 'none';
      return;
    }
    ribbonEl.style.display = 'flex';
    state.activeRules.forEach(r => {
      ribbonEl.appendChild(U.el('span', { class: 'rule-chip' + (r.color === 'orange' ? ' orange' : ''), text: r.text }));
    });
  }

  function makeGameCtx(stage) {
    return {
      players: state.players,
      availableDrinks: state.availableDrinks,
      intensity: state.intensity,
      history: state.history,
      addRule(text, color = 'cyan', expiresInRounds = -1) {
        const rule = { text, color, addedAtRound: state.history.length, expiresInRounds };
        state.activeRules.push(rule);
        persist();
        renderRules();
      },
      recordStat(name, value) {
        if (name === 'mostLikelyPick') {
          state.stats.mostLikelyPicks[value] = (state.stats.mostLikelyPicks[value] || 0) + 1;
        }
        persist();
      },
      next: () => {
        // expire rules whose round count ran out
        state.activeRules = state.activeRules.filter(r => {
          if (r.expiresInRounds < 0) return true;
          return (state.history.length + 1 - r.addedAtRound) < r.expiresInRounds;
        });
        renderRules();
        pickAndPlay(stage, makeGameCtx(stage));
      },
      cleanup: null
    };
  }

  function pickAndPlay(stage, apiCtx) {
    if (activeGameCleanup) { try { activeGameCleanup(); } catch (e) {} activeGameCleanup = null; }
    const game = DoerakGames.pickNext(state.history, state.intensity);
    state.history.push(game.id);
    persist();
    setTheme(GAME_THEMES[game.id] || 'pink');
    // refresh ronde counter
    const pill = document.querySelector('.topbar .pill');
    if (pill) pill.textContent = '🎲 RONDE ' + state.history.length;

    // run slot machine using game name as final, with other game names as filler
    const candidates = DoerakGames.list().map(g => g.name);
    DoerakSlot(stage, candidates, game.name, () => {
      stage.innerHTML = '';
      const view = U.el('div', { class: 'game-view' });
      stage.appendChild(view);
      // intro card first
      showIntro(view, game, () => {
        view.innerHTML = '';
        apiCtx.cleanup = null;
        try {
          game.start(view, apiCtx);
          activeGameCleanup = () => apiCtx.cleanup && apiCtx.cleanup();
        } catch (e) {
          console.error('game error', e);
          view.appendChild(U.el('div', { class: 'card', text: 'Oeps — game crashte. Volgende.' }));
          view.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE', onClick: () => apiCtx.next() }));
        }
      });
    });
  }

  const GAME_EMOJI = {
    tijdsbom: '💣', reactietest: '⚡', mostLikelyTo: '👉', mostLikelyBomb: '👉💣',
    imposter: '🕵️', paranoia: '🤫', drunkocracy: '🗳️', hotSeat: '🔥',
    twentyone: '🔢', buzz: '🐝', categorieTimer: '⏳', waterval: '🌊',
    blindeKeuze: '🚪', regelRoulette: '🎡', buddy: '👯', saboteur: '😈',
    sociale: '🍻', dubbelPech: '✌️', uitdelen: '🎁', guess5: '🎯'
  };

  function showIntro(view, game, onStart) {
    view.innerHTML = '';
    const wrap = U.el('div', { class: 'game-intro' });
    wrap.appendChild(U.el('div', { class: 'badge', text: '🎲 NU SPELEN' }));
    const gnameStr = (GAME_EMOJI[game.id] || '✨') + ' ' + game.name;
    wrap.appendChild(U.el('div', { class: 'gname', text: gnameStr }));
    wrap.appendChild(U.el('div', { class: 'gdesc', text: game.desc }));
    wrap.appendChild(U.el('button', { class: 'btn full primary', text: '🚀 START', onClick: () => { AudioFX.beep(); onStart(); } }));
    view.appendChild(wrap);
  }

  function showTimeUp(screen) {
    if (screen.querySelector('.timeup-prompt')) return;
    const overlay = U.el('div', { class: 'timeup-prompt' });
    const card = U.el('div', { class: 'card orange' });
    card.appendChild(U.el('h2', { text: 'TIJD IS OM' }));
    card.appendChild(U.el('p', { style: { color: 'var(--ink-bone-dim)' }, text: 'Laatste ronde, of doorgaan?' }));
    const stack = U.el('div', { class: 'stack tight', style: { marginTop: '16px' } });
    stack.appendChild(U.el('button', {
      class: 'btn full', text: 'NEE — EINDSCHERM',
      onClick: () => { overlay.remove(); go('eindscherm'); }
    }));
    stack.appendChild(U.el('button', {
      class: 'btn full cyan', text: '+10 MIN',
      onClick: () => { state.sessionEnd += 10 * 60 * 1000; state._timeUpShown = false; persist(); overlay.remove(); }
    }));
    stack.appendChild(U.el('button', {
      class: 'btn full ghost', text: 'NOG ÉÉN RONDE',
      onClick: () => { state.sessionEnd = Date.now() + 5 * 60 * 1000; state._timeUpShown = false; persist(); overlay.remove(); }
    }));
    card.appendChild(stack);
    overlay.appendChild(card);
    screen.appendChild(overlay);
  }

  function showPauseMenu() {
    const screen = APP.querySelector('.screen');
    if (screen.querySelector('.pause-overlay')) return;
    const overlay = U.el('div', { class: 'pause-overlay' });
    const card = U.el('div', { class: 'card' });
    card.appendChild(U.el('h2', { text: 'PAUZE' }));
    const stack = U.el('div', { class: 'stack tight', style: { marginTop: '16px' } });
    stack.appendChild(U.el('button', { class: 'btn full', text: 'DOORGAAN', onClick: () => overlay.remove() }));
    stack.appendChild(U.el('button', { class: 'btn full cyan', text: 'STOP & EINDSCHERM',
      onClick: () => { overlay.remove(); go('eindscherm'); } }));
    stack.appendChild(U.el('button', { class: 'btn full ghost', text: 'NIEUW SPEL (ALLES WEG)',
      onClick: () => { reset(); go('welcome'); } }));
    card.appendChild(stack);
    overlay.appendChild(card);
    screen.appendChild(overlay);
  }

  /* ---- 6. EINDSCHERM ---- */
  function renderEindscherm() {
    if (loopTimer) { clearInterval(loopTimer); loopTimer = null; }
    if (activeGameCleanup) { try { activeGameCleanup(); } catch (e) {} activeGameCleanup = null; }
    setTheme('lime');

    renderVoteFlow({
      heading: '🏆 WIE WERD HET MEEST DRONKEN?',
      blurb: 'Eerlijk en anoniem. Geef door.',
      onDone: ({ winner, votes, tally }) => {
        state.eindscherm = { winner, votes, tally };
        persist();
        renderEindStats();
      }
    });
  }

  function renderEindStats() {
    mount(s => {
      s.classList.add('endscreen');
      const winner = state.eindscherm.winner;
      const predicted = state.voorspelling?.winner;
      const correct = winner === predicted;

      s.appendChild(U.el('div', { class: 'kicker orange', text: 'EINDOORDEEL' }));
      s.appendChild(U.el('h1', { class: 'reveal-name', text: winner }));
      s.appendChild(U.el('div', { class: 'gh-tag center', text: correct ? 'EXACT VOORSPELD' : 'NIEMAND HAD HET DOOR' }));

      // Compare to prediction
      const compare = U.el('div', { class: 'card', style: { marginTop: '20px' } });
      if (correct) {
        compare.appendChild(U.el('div', { class: 'sociale-reason', html: `Jullie hadden het door! Niemand drinkt extra.` }));
      } else {
        const drink = U.buildDrinkInstruction(5, state.availableDrinks, state.intensity);
        // find who voted predicted
        const wrongVoters = Object.entries(state.voorspelling?.votes || {})
          .filter(([_, v]) => v === predicted).map(([k]) => k);
        compare.appendChild(U.el('div', { class: 'sociale-reason',
          html: `<strong>${predicted || '?'}</strong> werd het niet. ${wrongVoters.length ? wrongVoters.join(', ') + ' ' + drink : ''}` }));
      }
      s.appendChild(compare);

      // Stats
      const stats = U.el('div', { class: 'card', style: { marginTop: '20px' } });
      stats.appendChild(U.el('h3', { text: 'CIJFERS' }));
      stats.appendChild(buildStatRow('RONDES GESPEELD', state.history.length));
      const longest = state.history.reduce((a, b) => a + (DoerakGames.byId(b)?.long ? 1 : 0), 0);
      stats.appendChild(buildStatRow('LONG-FORMAT GAMES', longest));
      // Most likely champ
      const mlt = state.stats?.mostLikelyPicks || {};
      const mltSorted = Object.entries(mlt).sort((a, b) => b[1] - a[1]);
      if (mltSorted.length) {
        stats.appendChild(buildStatRow('MOST LIKELY KING', `${mltSorted[0][0]} (${mltSorted[0][1]}x)`));
      }
      stats.appendChild(buildStatRow('REGELS ACTIEF', state.activeRules.length));
      s.appendChild(stats);

      const footer = U.el('div', { class: 'setup-footer', style: { marginTop: '20px' } });
      footer.appendChild(U.el('button', {
        class: 'btn ghost small', text: 'NIEUWE RONDE',
        onClick: () => {
          state.history = [];
          state.activeRules = [];
          state.eindscherm = null;
          state.voorspelling = null;
          state.sessionStart = Date.now();
          state.sessionEnd = state.sessionStart + (state.duration * 60 * 1000);
          state._timeUpShown = false;
          state.stats = { mostLikelyPicks: {} };
          persist();
          go('voorspelling');
        }
      }));
      footer.appendChild(U.el('button', {
        class: 'btn', text: 'NIEUW SPEL',
        onClick: () => { reset(); go('welcome'); }
      }));
      s.appendChild(footer);

      AudioFX.win(); U.flash('cyan');
    });
  }

  function buildStatRow(k, v) {
    const r = U.el('div', { class: 'stat-row' });
    r.appendChild(U.el('div', { class: 'k', text: k }));
    r.appendChild(U.el('div', { class: 'v', text: v }));
    return r;
  }

  /* ---- BOOT ---- */
  function boot() {
    if (state.screen === 'gameloop' && (!state.players.length || !state.availableDrinks.length)) {
      reset();
      state.screen = 'welcome';
    }
    routeRender();
  }
  boot();
  window.addEventListener('beforeunload', persist);
})();
