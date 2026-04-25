/* DOERAK — main controller. Pack-based session, screen routing, onboarding. */
(function () {

  const APP = document.getElementById('app');

  /* === Packs (replaces duration timer) === */
  const PACKS = [
    { id: 'kort',      name: 'KORT',        rounds: 5,  desc: 'Snelle warm-up · ±10 min' },
    { id: 'klassiek',  name: 'KLASSIEKER',  rounds: 10, desc: 'De doerak-pakketje · ±20 min' },
    { id: 'marathon',  name: 'MARATHON',    rounds: 20, desc: 'Hele avond ontsporen · ±40 min' },
    { id: 'avond',     name: 'HELE AVOND',  rounds: 0,  desc: 'Geen limiet, jij stopt' }
  ];
  function packById(id) { return PACKS.find(p => p.id === id) || PACKS[1]; }

  /* === State === */
  const initialState = () => ({
    screen: 'welcome',
    onboarded: !!localStorage.getItem('doerak.onboarded'),
    players: [],
    availableDrinks: [],
    pack: null,                // 'kort' / 'klassiek' / 'marathon' / 'avond'
    intensity: 'normaal',
    voorspelling: null,
    seating: [],
    history: [],
    activeRules: [],
    sessionStart: null,
    paused: false,
    stats: { mostLikelyPicks: {} },
    eindscherm: null
  });

  let state = DoerakStorage.load() || initialState();

  function persist() { DoerakStorage.save(state); }
  function reset() { state = initialState(); DoerakStorage.clear(); }

  /* === Per-game color theme === */
  const GAME_THEMES = {
    tijdsbom: 'coral', reactietest: 'yellow', mostLikelyTo: 'blush',
    mostLikelyBomb: 'coral', imposter: 'mint', drunkocracy: 'coral',
    twentyone: 'blush', buzz: 'yellow', categorieTimer: 'coral',
    waterval: 'sky', blindeKeuze: 'mint', regelRoulette: 'yellow',
    buddy: 'coral', dubbelPech: 'coral', uitdelen: 'mint', guess5: 'yellow'
  };
  function setTheme(t) {
    if (t) document.body.setAttribute('data-theme', t);
    else   document.body.removeAttribute('data-theme');
  }

  /* === Mount helper === */
  function mount(builder) {
    const olds = APP.querySelectorAll('.screen');
    const next = U.el('div', { class: 'screen entering' });
    APP.appendChild(next);
    builder(next);
    olds.forEach((old, i) => {
      old.classList.remove('entering');
      if (i < olds.length - 1) { old.remove(); return; }
      old.classList.add('exiting');
      setTimeout(() => old.remove(), 280);
    });
    setTimeout(() => next.classList.remove('entering'), 380);
  }

  function go(screen) {
    state.screen = screen;
    persist();
    routeRender();
  }

  function routeRender() {
    switch (state.screen) {
      case 'welcome':       return renderWelcome();
      case 'onboarding':    return renderOnboarding();
      case 'setup-players': return renderSetupPlayers();
      case 'setup-drinks':  return renderSetupDrinks();
      case 'setup-pack':    return renderSetupPack();
      case 'setup-intens':  return renderSetupIntens();
      case 'voorspelling':  return renderVoorspelling();
      case 'zitplaatsen':   return renderZitplaatsen();
      case 'gameloop':      return renderGameloop();
      case 'eindscherm':    return renderEindscherm();
      default:              return renderWelcome();
    }
  }

  /* === 1. WELCOME === */
  function renderWelcome() {
    setTheme(null);
    mount(s => {
      s.classList.add('welcome');
      s.appendChild(U.el('div', { class: 'marker', text: 'NL · 18+ · ★' }));
      s.appendChild(U.el('div', { class: 'marker right', text: '16 GAMES' }));

      // floating decorative SVGs
      ['cup', 'sparkle', 'confetti', 'bottle'].forEach((d, i) => {
        const div = U.el('div', { class: 'welcome-deco d' + (i+1) });
        div.innerHTML = DOERAK_ICONS.deco[d]();
        s.appendChild(div);
      });

      // Mascot
      const mascotWrap = U.el('div', { class: 'welcome-mascot-wrap' });
      mascotWrap.innerHTML = DOERAK_ICONS.mascot();
      const mascotSvg = mascotWrap.querySelector('svg');
      mascotSvg.classList.add('welcome-mascot');
      s.appendChild(mascotSvg);

      // Title with stamped letters
      const title = U.el('h1', { class: 'welcome-title' });
      const letters = ['D', 'O', 'E', 'R', 'A', 'K'];
      letters.forEach((l, i) => {
        const span = U.el('span', { class: 'l letter-stamp', 'data-l': l });
        span.textContent = l;
        span.style.animationDelay = (i * 0.06) + 's';
        title.appendChild(span);
      });
      s.appendChild(title);

      s.appendChild(U.el('div', { class: 'welcome-tag', text: 'drink. doe. doerak.' }));

      const stack = U.el('div', { class: 'btn-stack' });
      const session = DoerakStorage.load();
      const hasSession = session && session.players && session.players.length >= 3 && session.screen !== 'welcome' && session.screen !== 'eindscherm';

      stack.appendChild(U.el('button', {
        class: 'btn full primary', text: 'NIEUW SPEL',
        onClick: () => { AudioFX.unlock(); AudioFX.beep(); reset(); go(state.onboarded ? 'setup-players' : 'onboarding'); }
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

  /* === ONBOARDING (3 cards) === */
  function renderOnboarding() {
    setTheme(null);
    let step = 0;
    const cards = [
      {
        icon: 'mascot',
        title: 'EÉN TELEFOON',
        body: 'Eén telefoon, jullie groep eromheen. Lees voor wat er staat, doe wat het zegt, drink wat je krijgt.'
      },
      {
        icon: 'pass',
        title: 'GEEF DOOR',
        body: 'Vaak is er één speler aan de beurt. Geef de telefoon door als de naam op het scherm verschijnt — geen spieken.'
      },
      {
        icon: 'glass',
        title: 'DRINK MET MATEN',
        body: 'De app schaalt slokken aan jouw drank en intensiteit. 18+. Niemand drinkt zich kapot.'
      }
    ];

    function render() {
      mount(s => {
        s.classList.add('onboarding');
        const prog = U.el('div', { class: 'onboard-progress' });
        cards.forEach((_, i) => {
          const dot = U.el('div', { class: 'dot' + (i === step ? ' active' : i < step ? ' done' : '') });
          prog.appendChild(dot);
        });
        s.appendChild(prog);

        const c = cards[step];
        const card = U.el('div', { class: 'onboard-card' });
        const vis = U.el('div', { class: 'vis' });
        if (c.icon === 'mascot') vis.innerHTML = DOERAK_ICONS.mascot();
        else if (c.icon === 'pass') vis.innerHTML = DOERAK_ICONS.game.mostLikelyTo();
        else if (c.icon === 'glass') vis.innerHTML = DOERAK_ICONS.deco.cup();
        card.appendChild(vis);
        card.appendChild(U.el('h2', { text: c.title }));
        card.appendChild(U.el('div', { class: 'body', text: c.body }));
        s.appendChild(card);

        const footer = U.el('div', { class: 'setup-footer' });
        const back = U.el('button', { class: 'btn ghost small', onClick: () => {
          if (step > 0) { step--; render(); }
          else go('welcome');
        }});
        back.innerHTML = DOERAK_ICONS.ui.arrowBack();
        footer.appendChild(back);
        const nextBtn = U.el('button', {
          class: 'btn primary',
          text: step === cards.length - 1 ? 'LATEN WE GAAN' : 'VERDER',
          onClick: () => {
            AudioFX.beep();
            if (step < cards.length - 1) { step++; render(); }
            else { localStorage.setItem('doerak.onboarded', '1'); state.onboarded = true; persist(); go('setup-players'); }
          }
        });
        footer.appendChild(nextBtn);
        s.appendChild(footer);
      });
    }
    render();
  }

  /* === SETUP === */
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

  function makeBackBtn(target) {
    const b = U.el('button', { class: 'btn ghost small', onClick: () => go(target) });
    b.innerHTML = DOERAK_ICONS.ui.arrowBack();
    return b;
  }
  function makeNextBtn(label, onClick) {
    const b = U.el('button', { class: 'btn primary', onClick });
    b.innerHTML = '<span>' + label + '</span>';
    const arrow = document.createElement('span');
    arrow.innerHTML = DOERAK_ICONS.ui.arrow();
    arrow.querySelector('svg').style.width = '20px';
    arrow.querySelector('svg').style.height = '20px';
    arrow.querySelectorAll('line, path').forEach(p => p.setAttribute('stroke', 'var(--cream)'));
    b.appendChild(arrow);
    return b;
  }

  function renderSetupPlayers() {
    setupShell(1, step => {
      step.appendChild(U.el('div', { class: 'num', text: '01 / SPELERS' }));
      step.appendChild(U.el('h2', { text: 'WIE DRINKT MEE?' }));
      step.appendChild(U.el('p', { text: 'Min 3, max 10 spelers. Geen dubbele namen.' }));

      const inputRow = U.el('div', { class: 'player-input' });
      const inp = U.el('input', { type: 'text', placeholder: 'Naam...', maxLength: 16 });
      const addBtn = U.el('button', { class: 'btn primary' });
      addBtn.innerHTML = DOERAK_ICONS.ui.plus();
      addBtn.querySelectorAll('line').forEach(l => l.setAttribute('stroke', 'var(--cream)'));
      inputRow.appendChild(inp); inputRow.appendChild(addBtn);
      step.appendChild(inputRow);

      const list = U.el('div', { class: 'player-list' });
      step.appendChild(list);

      const footer = U.el('div', { class: 'setup-footer' });
      const back = makeBackBtn('welcome');
      const nextBtn = makeNextBtn('VERDER', () => { AudioFX.beep(); go('setup-drinks'); });
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
        if (state.players.find(n => n.toLowerCase() === v.toLowerCase())) { inp.value = ''; return; }
        state.players.push(v);
        inp.value = ''; persist(); refresh();
        AudioFX.softBeep();
      }
      addBtn.addEventListener('click', add);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
    });
  }

  function renderSetupDrinks() {
    setupShell(2, step => {
      step.appendChild(U.el('div', { class: 'num', text: '02 / DRANK' }));
      step.appendChild(U.el('h2', { text: 'WAT STAAT ER OP TAFEL?' }));
      step.appendChild(U.el('p', { text: 'Kies 1 of meer — dit bepaalt alle drinkopdrachten.' }));

      const opts = [
        { id: 'bier', label: 'BIER', desc: 'Pilsje · IPA · alles', icon: 'bier' },
        { id: 'wijn', label: 'WIJN', desc: 'Rood · wit · rosé', icon: 'wijn' },
        { id: 'sterk', label: 'STERK', desc: 'Tequila · vodka · whiskey · shots', icon: 'sterk' }
      ];
      const wrap = U.el('div', { class: 'drink-options' });
      step.appendChild(wrap);

      function refresh() {
        wrap.innerHTML = '';
        opts.forEach(o => {
          const active = state.availableDrinks.includes(o.id);
          const card = U.el('div', { class: 'drink-option' + (active ? ' active' : '') });
          const iconWrap = U.el('div', { class: 'icon-wrap' });
          iconWrap.innerHTML = DOERAK_ICONS.drink[o.icon]();
          card.appendChild(iconWrap);
          card.appendChild(U.el('div', { class: 'text' },
            U.el('div', { class: 'name', text: o.label }),
            U.el('div', { class: 'desc', text: o.desc })
          ));
          const check = U.el('div', { class: 'check' });
          check.innerHTML = DOERAK_ICONS.ui.check();
          card.appendChild(check);
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
      const back = makeBackBtn('setup-players');
      const nextBtn = makeNextBtn('VERDER', () => { AudioFX.beep(); go('setup-pack'); });
      footer.appendChild(back); footer.appendChild(nextBtn);
      step.appendChild(footer);

      function update() { nextBtn.disabled = state.availableDrinks.length === 0; }
      update();
    });
  }

  function renderSetupPack() {
    setupShell(3, step => {
      step.appendChild(U.el('div', { class: 'num', text: '03 / PAKKET' }));
      step.appendChild(U.el('h2', { text: 'HOEVEEL RONDES?' }));
      step.appendChild(U.el('p', { text: 'Kies een pakket. Geen rondes meer = eindscherm.' }));

      const list = U.el('div', { class: 'pack-list' });
      step.appendChild(list);

      function refresh() {
        list.innerHTML = '';
        PACKS.forEach(p => {
          const active = state.pack === p.id;
          const card = U.el('div', { class: 'pack-card' + (active ? ' active' : '') });
          card.appendChild(U.el('div', { class: 'num', text: p.rounds === 0 ? '∞' : p.rounds }));
          card.appendChild(U.el('div', { class: 'text' },
            U.el('div', { class: 'name', text: p.name }),
            U.el('div', { class: 'desc', text: p.desc })
          ));
          card.addEventListener('click', () => {
            AudioFX.softBeep();
            state.pack = p.id; persist(); refresh(); update();
          });
          list.appendChild(card);
        });
      }
      refresh();

      const footer = U.el('div', { class: 'setup-footer' });
      const back = makeBackBtn('setup-drinks');
      const nextBtn = makeNextBtn('VERDER', () => { AudioFX.beep(); go('setup-intens'); });
      footer.appendChild(back); footer.appendChild(nextBtn);
      step.appendChild(footer);

      function update() { nextBtn.disabled = !state.pack; }
      update();
    });
  }

  function renderSetupIntens() {
    setupShell(4, step => {
      step.appendChild(U.el('div', { class: 'num', text: '04 / VIBE' }));
      step.appendChild(U.el('h2', { text: 'HOE HEFTIG?' }));
      step.appendChild(U.el('p', { text: 'Schaalt drank en kleurt content.' }));

      const opts = [
        { id: 'chill',   label: 'CHILL',   sub: 'Gezellig · rustig · geen pijn' },
        { id: 'normaal', label: 'NORMAAL', sub: 'Goeie avond · morgen gewoon op' },
        { id: 'heftig',  label: 'HEFTIG',  sub: 'Doerak modus · gewaarschuwd' }
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
      const back = makeBackBtn('setup-pack');
      const nextBtn = makeNextBtn('VOORSPEL', () => { AudioFX.beep(); go('voorspelling'); });
      footer.appendChild(back); footer.appendChild(nextBtn);
      step.appendChild(footer);
    });
  }

  /* === Vote flow (shared between voorspelling + eindscherm) === */
  function renderVoteFlow({ heading, blurb, onDone, exitTo }) {
    let i = 0;
    const votes = {};
    const tally = {};

    function next() {
      mount(s => {
        s.classList.add('vote-screen');
        if (i >= state.players.length) return reveal(s);
        const voter = state.players[i];
        s.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: heading }));
        s.appendChild(U.el('div', { class: 'who-turn', text: voter }));
        s.appendChild(U.el('div', { class: 'pass-instruction', text: blurb }));
        const list = U.el('div', { class: 'target-list' });
        state.players.forEach(p => {
          list.appendChild(U.el('button', {
            class: 'target-btn', text: p,
            onClick: async () => {
              AudioFX.softBeep();
              const ok = await U.confirm(p, { kicker: 'STEM JE OP DEZE PERSOON?' });
              if (!ok) return;
              votes[voter] = p;
              tally[p] = (tally[p] || 0) + 1;
              i++; next();
            }
          }));
        });
        s.appendChild(list);
        if (exitTo) {
          const back = makeBackBtn(exitTo);
          back.style.alignSelf = 'flex-start';
          s.appendChild(back);
        }
      });
    }

    function reveal(s) {
      s.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'STEMMEN BINNEN' }));
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
          let max = 0, winner = null;
          for (const k in tally) if (tally[k] > max) { max = tally[k]; winner = k; }
          stage.appendChild(U.el('div', { class: 'reveal-name' },
            document.createTextNode(winner),
            U.el('div', { class: 'num', text: max + ' / ' + total + ' STEMMEN' })
          ));
          const nextBtn = makeNextBtn('VERDER', () => onDone({ winner, votes, tally }));
          s.appendChild(nextBtn);
        }
      }, 350);
    }
    next();
  }

  function renderVoorspelling() {
    setTheme('blush');
    renderVoteFlow({
      heading: 'GEEF ANONIEM JE GOK DOOR',
      blurb: 'Wie wordt vannacht het meest dronken? Privé.',
      exitTo: 'setup-intens',
      onDone: ({ winner, votes }) => {
        state.voorspelling = { winner, votes };
        persist();
        go('zitplaatsen');
      }
    });
  }

  /* === ZITPLAATSEN === */
  function renderZitplaatsen() {
    setTheme('mint');
    if (!state.seating.length || state.seating.length !== state.players.length) {
      state.seating = U.shuffle(state.players);
      persist();
    }
    mount(s => {
      s.classList.add('seating');
      s.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'ZITVOLGORDE' }));
      s.appendChild(U.el('h2', { style: { color: 'var(--ink)', textAlign: 'center', textShadow: '4px 4px 0 var(--coral)' }, text: 'JE BUREN VAN VANAVOND' }));
      const tableWrap = U.el('div', { class: 'seating-table' });
      tableWrap.appendChild(U.el('div', { class: 'table-disc' }));
      state.seating.forEach((p, idx) => {
        const angle = (idx / state.seating.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 38;
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
      s.appendChild(U.el('p', { style: { textAlign: 'center', color: 'var(--ink)', opacity: 0.7, fontWeight: 800 },
        text: 'Onthoud dit — sommige games gebruiken je buren.' }));

      const footer = U.el('div', { class: 'setup-footer' });
      footer.appendChild(U.el('button', { class: 'btn ghost small', text: 'OPNIEUW LOTEN',
        onClick: () => { state.seating = U.shuffle(state.players); persist(); routeRender(); } }));
      footer.appendChild(makeNextBtn('START', () => {
        state.sessionStart = Date.now();
        state.history = [];
        state.activeRules = [];
        state.stats = { mostLikelyPicks: {} };
        persist();
        AudioFX.boom();
        go('gameloop');
      }));
      s.appendChild(footer);
    });
  }

  /* === GAME LOOP === */
  let activeGameCleanup = null;

  function renderGameloop() {
    AudioFX.unlock();
    mount(s => {
      s.classList.add('gameloop');

      const tb = U.el('div', { class: 'topbar' });
      const left = U.el('div', { class: 'row' },
        U.el('span', { class: 'pill yellow', text: roundLabel() }),
      );
      const right = U.el('div', { class: 'row' });
      const pauseBtn = U.el('button', { class: 'pause-btn', 'aria-label': 'Pauze' });
      pauseBtn.innerHTML = DOERAK_ICONS.ui.pause();
      pauseBtn.addEventListener('click', () => showPauseMenu());
      right.appendChild(pauseBtn);
      tb.appendChild(left); tb.appendChild(right);
      s.appendChild(tb);

      const ribbon = U.el('div', { class: 'rules-ribbon', id: 'rules-ribbon' });
      s.appendChild(ribbon);
      renderRules(ribbon);

      const stage = U.el('div', { class: 'stage' });
      s.appendChild(stage);

      pickAndPlay(stage, makeGameCtx(stage));
    });
  }

  function roundLabel() {
    const pack = packById(state.pack);
    const r = state.history.length;
    if (pack.rounds === 0) return 'RONDE ' + (r + 1);
    return 'RONDE ' + Math.min(r + 1, pack.rounds) + ' / ' + pack.rounds;
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
      ribbonEl.appendChild(U.el('span', { class: 'rule-chip' + (r.color === 'orange' || r.color === 'coral' ? ' coral' : ' yellow'), text: r.text }));
    });
  }

  function makeGameCtx(stage) {
    return {
      players: state.players,
      availableDrinks: state.availableDrinks,
      intensity: state.intensity,
      history: state.history,
      addRule(text, color = 'yellow', expiresInRounds = -1) {
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
        state.activeRules = state.activeRules.filter(r => {
          if (r.expiresInRounds < 0) return true;
          return (state.history.length + 1 - r.addedAtRound) < r.expiresInRounds;
        });
        renderRules();
        // Pack end check
        const pack = packById(state.pack);
        if (pack.rounds > 0 && state.history.length >= pack.rounds) {
          go('eindscherm');
          return;
        }
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
    setTheme(GAME_THEMES[game.id] || 'coral');
    const pill = document.querySelector('.topbar .pill.yellow');
    if (pill) pill.textContent = roundLabel();

    const candidates = DoerakGames.list().map(g => g.name);
    DoerakSlot(stage, candidates, game.name, () => {
      stage.innerHTML = '';
      const view = U.el('div', { class: 'game-view' });
      stage.appendChild(view);
      showIntro(view, game, () => {
        view.innerHTML = '';
        apiCtx.cleanup = null;
        try {
          game.start(view, apiCtx);
          activeGameCleanup = () => apiCtx.cleanup && apiCtx.cleanup();
        } catch (e) {
          console.error('game error', e);
          view.appendChild(U.el('div', { class: 'card', text: 'Game crashte. Volgende ronde.' }));
          view.appendChild(U.el('button', { class: 'btn full primary', text: 'VOLGENDE', onClick: () => apiCtx.next() }));
        }
      });
    });
  }

  function showIntro(view, game, onStart) {
    view.innerHTML = '';
    const wrap = U.el('div', { class: 'game-intro' });
    const heroIcon = U.el('div', { class: 'game-icon-hero' });
    if (DOERAK_ICONS.game[game.id]) heroIcon.innerHTML = DOERAK_ICONS.game[game.id]();
    wrap.appendChild(heroIcon);
    wrap.appendChild(U.el('div', { class: 'badge', text: 'NU SPELEN' }));
    wrap.appendChild(U.el('div', { class: 'gname', text: game.name }));
    wrap.appendChild(U.el('div', { class: 'gdesc', text: game.desc }));
    wrap.appendChild(U.el('button', { class: 'btn full primary', text: 'START', onClick: () => { AudioFX.beep(); onStart(); } }));
    view.appendChild(wrap);
  }

  function showPauseMenu() {
    const screen = APP.querySelector('.screen');
    if (screen.querySelector('.pause-overlay')) return;
    const overlay = U.el('div', { class: 'pause-overlay' });
    const card = U.el('div', { class: 'card' });
    card.appendChild(U.el('h2', { text: 'PAUZE' }));
    const stack = U.el('div', { class: 'stack tight', style: { marginTop: '16px' } });
    stack.appendChild(U.el('button', { class: 'btn full primary', text: 'DOORGAAN', onClick: () => overlay.remove() }));
    stack.appendChild(U.el('button', { class: 'btn full mint', text: 'STOP & EINDSCHERM',
      onClick: () => { overlay.remove(); go('eindscherm'); } }));
    stack.appendChild(U.el('button', { class: 'btn full ghost', text: 'NIEUW SPEL',
      onClick: () => { reset(); go('welcome'); } }));
    card.appendChild(stack);
    overlay.appendChild(card);
    screen.appendChild(overlay);
  }

  /* === EINDSCHERM === */
  function renderEindscherm() {
    if (activeGameCleanup) { try { activeGameCleanup(); } catch (e) {} activeGameCleanup = null; }
    setTheme('yellow');

    renderVoteFlow({
      heading: 'WIE WERD HET MEEST DRONKEN?',
      blurb: 'Eerlijk en anoniem.',
      onDone: ({ winner, votes, tally }) => {
        state.eindscherm = { winner, votes, tally };
        persist();
        renderEindCard();
      }
    });
  }

  function renderEindCard() {
    setTheme('yellow');
    mount(s => {
      s.classList.add('endscreen');
      const winner = state.eindscherm.winner;
      const predicted = state.voorspelling?.winner;
      const correct = winner === predicted;

      const card = U.el('div', { class: 'end-card' });
      // Winner section
      const trophyDiv = U.el('div', { style: { width: '64px', height: '64px', flexShrink: 0 } });
      trophyDiv.innerHTML = DOERAK_ICONS.ui.trophy();
      const winnerRow = U.el('div', { class: 'winner-row' });
      winnerRow.appendChild(trophyDiv);
      card.appendChild(winnerRow);
      card.appendChild(U.el('div', { class: 'kicker yellow', style: { alignSelf: 'center' }, text: 'MEEST DRONKEN' }));
      card.appendChild(U.el('div', { class: 'winner-name', text: winner }));

      // Prediction outcome
      if (correct) {
        card.appendChild(U.el('div', { class: 'body-card', html: '<strong>Voorspeld!</strong> Niemand drinkt extra.' }));
      } else {
        const drink = U.buildDrinkInstruction(5, state.availableDrinks, state.intensity);
        const wrongVoters = Object.entries(state.voorspelling?.votes || {})
          .filter(([_, v]) => v === predicted).map(([k]) => k);
        card.appendChild(U.el('div', { class: 'body-card',
          html: `Voorspeld: <strong>${predicted || '?'}</strong>. Mis. ${wrongVoters.length ? wrongVoters.join(', ') + ' ' + drink + '.' : ''}` }));
      }

      // Stats
      card.appendChild(buildStatRow('RONDES', state.history.length));
      const longest = state.history.reduce((a, b) => a + (DoerakGames.byId(b)?.long ? 1 : 0), 0);
      card.appendChild(buildStatRow('LONG GAMES', longest));
      const mlt = state.stats?.mostLikelyPicks || {};
      const mltSorted = Object.entries(mlt).sort((a, b) => b[1] - a[1]);
      if (mltSorted.length) {
        card.appendChild(buildStatRow('MOST LIKELY KING', `${mltSorted[0][0]} (${mltSorted[0][1]}×)`));
      }
      card.appendChild(buildStatRow('REGELS ACTIEF', state.activeRules.length));
      card.appendChild(U.el('div', { class: 'kicker cream', style: { alignSelf: 'center', marginTop: '8px' }, text: 'DOERAK · ' + (new Date()).toLocaleDateString('nl-NL') }));

      s.appendChild(card);
      s.appendChild(U.el('div', { class: 'share-hint', text: '📸 Maak een screenshot — deel naar de groepschat' }));

      const footer = U.el('div', { class: 'setup-footer', style: { marginTop: 'auto' } });
      footer.appendChild(U.el('button', {
        class: 'btn ghost small', text: 'NIEUWE RONDE',
        onClick: () => {
          state.history = [];
          state.activeRules = [];
          state.eindscherm = null;
          state.voorspelling = null;
          state.sessionStart = Date.now();
          state.stats = { mostLikelyPicks: {} };
          persist();
          go('voorspelling');
        }
      }));
      footer.appendChild(U.el('button', {
        class: 'btn primary', text: 'NIEUW SPEL',
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

  /* === BOOT === */
  function boot() {
    if (state.screen === 'gameloop' && (!state.players.length || !state.availableDrinks.length || !state.pack)) {
      reset();
      state.screen = 'welcome';
    }
    routeRender();
  }
  boot();
  window.addEventListener('beforeunload', persist);
})();
