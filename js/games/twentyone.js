/* 21 — count to 21 in turn. Whoever says 21 makes a rule. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.twentyone = {
    id: 'twentyone',
    name: '21',
    desc: 'Tel om de beurt naar 21. Wie 21 zegt, maakt een nieuwe regel.',
    long: true,
    weight: { chill: 0.6, normaal: 0.8, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      let turnIdx = U.rand(players.length);
      let count = 1;
      const drinkWrong = U.buildDrinkInstruction(2, availableDrinks, intensity);

      const root = U.el('div', { class: 'game twentyone' });
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: '21' }),
        U.el('div', { class: 'gh-tag', text: 'TEL TOT 21' })
      ));
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      const whoEl = U.el('div', { class: 'who' });
      const numEl = U.el('div', { class: 'target-num' });
      const keypad = U.el('div', { class: 'keypad' });
      body.appendChild(whoEl); body.appendChild(numEl); body.appendChild(keypad);

      function update() {
        whoEl.textContent = players[turnIdx] + ' zegt...';
        numEl.textContent = count;
      }

      function nextTurn() {
        turnIdx = (turnIdx + 1) % players.length;
        update();
      }

      keypad.appendChild(U.el('button', {
        class: 'btn cyan', text: 'GEZEGD',
        onClick: () => {
          AudioFX.softBeep();
          if (count >= 21) return ruleStep();
          count++;
          nextTurn();
        }
      }));
      keypad.appendChild(U.el('button', {
        class: 'btn danger', text: 'FOUT',
        onClick: () => {
          AudioFX.lose();
          U.flash('fire');
          count = 1;
          nextTurn();
        }
      }));

      footer.appendChild(U.el('button', {
        class: 'btn small ghost', text: 'STOPPEN',
        onClick: () => ctx.next()
      }));

      function ruleStep() {
        body.innerHTML = ''; footer.innerHTML = '';
        AudioFX.win(); U.flash('cyan');
        body.appendChild(U.el('div', { class: 'kicker orange', text: 'DE WINNAAR MAAKT DE REGEL' }));
        body.appendChild(U.el('div', { class: 'pass-name', text: players[turnIdx] }));

        const quick = U.el('div', { class: 'quick-rules' });
        const suggestions = U.pickN(window.DOERAK_DATA.regelRoulette, 4);
        suggestions.forEach(s => {
          const fill = U.fillTemplate(s, { players, availableDrinks, intensity });
          const c = U.el('button', {
            class: 'chip', text: fill,
            onClick: () => addRule(fill)
          });
          quick.appendChild(c);
        });
        body.appendChild(U.el('div', { class: 'kicker', text: 'KIES UIT...' }));
        body.appendChild(quick);

        body.appendChild(U.el('div', { class: 'kicker', text: 'OF VERZIN ZELF', style: { marginTop: '12px' } }));
        const ri = U.el('div', { class: 'ruleinput' });
        const inp = U.el('input', { type: 'text', placeholder: 'Eigen regel...' });
        ri.appendChild(inp);
        ri.appendChild(U.el('button', {
          class: 'btn small', text: 'OK',
          onClick: () => { if (inp.value.trim()) addRule(inp.value.trim()); }
        }));
        body.appendChild(ri);
        footer.appendChild(U.el('button', { class: 'btn full ghost', text: 'OVERSLAAN', onClick: () => ctx.next() }));
      }

      function addRule(text) {
        ctx.addRule(text, 'cyan');
        AudioFX.win();
        ctx.next();
      }

      update();
    }
  };
})();
