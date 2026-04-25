/* Most Likely To — group points at most-likely person, that person drinks. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.mostLikelyTo = {
    id: 'mostLikelyTo',
    name: 'MOST LIKELY TO',
    desc: 'Op 3 wijst iedereen wie het meest past. Wie de meeste vingers krijgt, drinkt.',
    long: false,
    weight: { chill: 1.0, normaal: 1.2, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const [n1, n2] = U.pickTwo(players);
      const tpl = U.pick(window.DOERAK_DATA.mostLikelyTo);
      const question = U.fillTemplate(tpl, { players, seedNames: { name1: n1, name2: n2 } });

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'MOST LIKELY TO' }),
        U.el('div', { class: 'gh-tag', text: 'WIJS' })
      ));
      const body = U.el('div', { class: 'game-body' });
      body.appendChild(U.el('div', { class: 'mlt-question', html: question }));
      const cd = U.el('div', { class: 'mlt-countdown', text: '3' });
      body.appendChild(cd);
      root.appendChild(body);
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      let n = 3;
      AudioFX.tick();
      const tickInt = setInterval(() => {
        n--;
        if (n > 0) { cd.textContent = n; AudioFX.tick(); }
        else if (n === 0) { cd.textContent = 'WIJS!'; AudioFX.boom(); U.flash('fire'); }
        else {
          clearInterval(tickInt);
          showVote();
        }
      }, 1000);

      function showVote() {
        body.innerHTML = '';
        body.appendChild(U.el('div', { class: 'mlt-question center', text: 'Wie kreeg de meeste vingers?' }));
        const grid = U.el('div', { class: 'target-list' });
        players.forEach(p => {
          grid.appendChild(U.el('button', {
            class: 'target-btn', text: p,
            onClick: async () => {
              AudioFX.softBeep();
              const ok = await U.confirm(p, { kicker: 'KREEG DEZE DE MEESTE?' });
              if (!ok) return;
              declare(p);
            }
          }));
        });
        body.appendChild(grid);
      }

      function declare(name) {
        AudioFX.reveal();
        body.innerHTML = '';
        body.appendChild(U.el('div', { class: 'mlt-question center', text: name }));
        // amount = ~3 typical (game spec said fingers = units, default 3)
        const drink = U.buildDrinkInstruction(3, availableDrinks, intensity);
        body.appendChild(U.el('div', { class: 'mlt-points', html: drink }));
        ctx.recordStat?.('mostLikelyPick', name);
        footer.innerHTML = '';
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'VOLGENDE RONDE',
          onClick: () => { AudioFX.beep(); ctx.next(); }
        }));
      }

      ctx.cleanup = () => clearInterval(tickInt);
    }
  };
})();
