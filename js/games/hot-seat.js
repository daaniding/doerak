/* Hot Seat — one player answers everything for 60 seconds. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.hotSeat = {
    id: 'hotSeat',
    name: 'HOT SEAT',
    desc: '60 seconden lang beantwoordt één speler alle vragen. Weigeren kost.',
    long: true,
    weight: { chill: 0.6, normaal: 0.8, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const target = U.pick(players);
      let refusals = 0;
      const total = 60;
      let remaining = total;

      const root = U.el('div', { class: 'game' });
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'HOT SEAT' }),
        U.el('div', { class: 'gh-tag', text: 'AL HEEFT WAARHEID' })
      ));
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      const spotlight = U.el('div', { class: 'hotseat-spotlight' },
        U.el('div', { class: 'kicker orange', text: 'IN DE STOEL' }),
        U.el('div', { class: 'target', text: target })
      );
      const timer = U.el('div', { class: 'hotseat-timer', text: total });
      const sug = U.el('div', { class: 'hotseat-suggestion' });
      const refusalsDisp = U.el('div', { class: 'gh-tag', style: { textAlign: 'center' }, text: 'WEIGERINGEN: 0 / 3' });

      body.appendChild(spotlight);
      body.appendChild(timer);
      body.appendChild(sug);
      body.appendChild(refusalsDisp);

      const cycleSuggestion = () => {
        const tpl = U.pick(window.DOERAK_DATA.hotSeat);
        sug.textContent = U.fillTemplate(tpl, { players, seedNames: { name1: U.pickExcept(players, target) } });
      };
      cycleSuggestion();

      const drinkRefuse = U.buildDrinkInstruction(2, availableDrinks, intensity);
      const drinkExtra = U.buildDrinkInstruction(5, availableDrinks, intensity);

      const row = U.el('div', { class: 'hotseat-actions' });
      row.appendChild(U.el('button', {
        class: 'btn danger', text: 'WEIGER',
        onClick: () => {
          refusals++;
          AudioFX.lose();
          refusalsDisp.textContent = `WEIGERINGEN: ${refusals} / 3`;
          if (refusals >= 3) {
            stop();
            body.appendChild(U.el('div', { class: 'mlt-points', html: `${target} weigerde 3x. Bovenop: ${drinkExtra}.` }));
          }
        }
      }));
      row.appendChild(U.el('button', {
        class: 'btn cyan', text: 'BEANTWOORD',
        onClick: () => { AudioFX.softBeep(); cycleSuggestion(); }
      }));
      footer.appendChild(row);

      let suggestionInt = setInterval(cycleSuggestion, 15000);
      let countdown = setInterval(() => {
        remaining--;
        timer.textContent = remaining;
        if (remaining <= 5) AudioFX.tick();
        if (remaining <= 3) U.shake(timer, false, 1000);
        if (remaining <= 0) stop();
      }, 1000);

      function stop() {
        clearInterval(suggestionInt); clearInterval(countdown);
        timer.textContent = 'KLAAR';
        AudioFX.boom(); U.flash('cyan');
        footer.innerHTML = '';
        const drinkPer = U.buildDrinkInstruction(refusals * 2 || 1, availableDrinks, intensity);
        if (refusals > 0 && refusals < 3) {
          body.appendChild(U.el('div', { class: 'mlt-points', html: `${target} weigerde ${refusals}x. ${drinkPer}.` }));
        }
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }

      ctx.cleanup = () => { clearInterval(suggestionInt); clearInterval(countdown); };
    }
  };
})();
