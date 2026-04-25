/* Categorie Timer — 8 sec per turn to name an item, no repeats. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.categorieTimer = {
    id: 'categorieTimer',
    name: 'CATEGORIE TIMER',
    desc: '8 seconden om iets in deze categorie te noemen. Geen herhaling.',
    long: false,
    weight: { chill: 1.0, normaal: 1.1, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const cat = U.pick(window.DOERAK_DATA.categorieen);
      let order = U.shuffle(players.slice());
      let i = 0;
      let rounds = 0;
      const SECONDS = 8;
      let remaining = SECONDS;
      let interval = null;
      const drinkFail = U.buildDrinkInstruction(4, availableDrinks, intensity);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'CATEGORIE TIMER' }),
        U.el('div', { class: 'gh-tag', text: '8 SECONDEN' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      const catEl = U.el('div', { class: 'cat-cat', text: cat });
      const whoEl = U.el('div', { class: 'cat-turn' });
      const timerEl = U.el('div', { class: 'cat-timer' });
      body.appendChild(catEl); body.appendChild(whoEl); body.appendChild(timerEl);

      const row = U.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } });
      row.appendChild(U.el('button', {
        class: 'btn cyan', text: 'GENOEMD',
        onClick: () => { AudioFX.softBeep(); turn(); }
      }));
      row.appendChild(U.el('button', {
        class: 'btn danger', text: 'GEFAALD',
        onClick: () => failTurn()
      }));
      body.appendChild(row);

      footer.appendChild(U.el('button', { class: 'btn small ghost', text: 'STOPPEN', onClick: () => ctx.next() }));

      function turn() {
        clearInterval(interval);
        const p = order[i % order.length];
        whoEl.textContent = p + ' — jouw beurt';
        remaining = SECONDS;
        timerEl.textContent = remaining;
        timerEl.classList.remove('shake', 'hard');
        interval = setInterval(() => {
          remaining--;
          timerEl.textContent = remaining;
          AudioFX.tick();
          if (remaining <= 3) U.shake(timerEl, false, 1000);
          if (remaining <= 0) failTurn();
        }, 1000);
        i++;
        if (i >= order.length) { rounds++; i = 0; }
      }

      function failTurn() {
        clearInterval(interval);
        AudioFX.lose(); U.flash('fire');
        const p = order[((i - 1) % order.length + order.length) % order.length];
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'kicker orange', text: 'GEFAALD' }));
        body.appendChild(U.el('div', { class: 'sociale-reason', html: `<strong>${p}</strong>, ${drinkFail}` }));
        if (rounds >= 3) {
          const drinkWin = U.buildDrinkInstruction(3, availableDrinks, intensity);
          body.appendChild(U.el('div', { class: 'gh-tag', style: { color: 'var(--ink-cyan)' }, text: `OOK: ANDEREN OVERLEEFDEN 3 RONDES — ELK MAG IEMAND ${drinkWin.toUpperCase()} GEVEN` }));
        }
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }

      turn();
      ctx.cleanup = () => clearInterval(interval);
    }
  };
})();
