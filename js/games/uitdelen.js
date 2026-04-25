/* Uitdelen — one player distributes 5 sips among the group. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.uitdelen = {
    id: 'uitdelen',
    name: 'UITDELEN',
    desc: 'Eén speler heeft de macht — verdeel 5 slokken over de groep.',
    long: false,
    weight: { chill: 0.9, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const dealer = U.pick(players);
      const BUDGET = 5;
      const tally = {};
      players.forEach(p => tally[p] = 0);
      let used = 0;

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'UITDELEN' }),
        U.el('div', { class: 'gh-tag', text: 'VERDEEL' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      body.appendChild(U.el('div', { class: 'kicker orange', text: 'DE BAAS' }));
      body.appendChild(U.el('div', { class: 'pass-name', text: dealer }));
      const budgetEl = U.el('div', { class: 'uit-budget', text: BUDGET });
      body.appendChild(budgetEl);
      const list = U.el('div', { class: 'uit-tally' });
      body.appendChild(list);

      function render() {
        list.innerHTML = '';
        players.forEach(p => {
          const row = U.el('div', { class: 'uit-row' },
            U.el('div', { class: 'nm', text: p })
          );
          const ctrls = U.el('div', { class: 'controls' });
          ctrls.appendChild(U.el('button', {
            class: 'ctrl', text: '−',
            onClick: () => { if (tally[p] > 0) { tally[p]--; used--; render(); } }
          }));
          ctrls.appendChild(U.el('div', { class: 'count', text: tally[p] }));
          ctrls.appendChild(U.el('button', {
            class: 'ctrl', text: '+',
            onClick: () => { if (used < BUDGET) { tally[p]++; used++; render(); } }
          }));
          row.appendChild(ctrls);
          list.appendChild(row);
        });
        budgetEl.textContent = (BUDGET - used);
      }

      const confirmBtn = U.el('button', {
        class: 'btn full', text: 'BEVESTIG',
        onClick: () => {
          if (used !== BUDGET) {
            confirmBtn.textContent = `EERST ${BUDGET - used} TE GAAN`;
            return;
          }
          const lines = players
            .filter(p => tally[p] > 0)
            .map(p => {
              const d = U.buildDrinkInstruction(tally[p], availableDrinks, intensity);
              return `<strong>${p}</strong> — ${d}`;
            }).join('<br>');
          AudioFX.reveal(); U.flash('cyan');
          body.innerHTML = '';
          body.appendChild(U.el('div', { class: 'kicker orange', text: dealer + ' HEEFT BESLOTEN' }));
          body.appendChild(U.el('div', { class: 'sociale-reason', html: lines || 'niemand?' }));
          footer.innerHTML = '';
          footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
        }
      });
      footer.appendChild(confirmBtn);

      render();
    }
  };
})();
