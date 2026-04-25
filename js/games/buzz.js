/* Buzz — count up, say BUZZ on multiples of 7 or numbers containing 7. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.buzz = {
    id: 'buzz',
    name: 'BUZZ',
    desc: 'Tel op. Op multiples van 7 of getallen mét 7: zeg BUZZ.',
    long: false,
    weight: { chill: 0.9, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      let count = 1;
      let turnIdx = U.rand(players.length);
      const drinkWrong = U.buildDrinkInstruction(2, availableDrinks, intensity);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'BUZZ' }),
        U.el('div', { class: 'gh-tag', text: 'MULTIPLES VAN 7' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      const whoEl = U.el('div', { class: 'cat-turn' });
      const numEl = U.el('div', { class: 'buzz-num' });
      const rules = U.el('div', { class: 'buzz-rules center', text: 'Multiples 7  •  Bevat een 7  •  ZEG BUZZ' });
      const actions = U.el('div', { class: 'buzz-actions' });
      body.appendChild(whoEl); body.appendChild(numEl); body.appendChild(rules); body.appendChild(actions);

      function update() {
        whoEl.textContent = players[turnIdx] + ' is aan de beurt';
        numEl.textContent = count;
      }

      actions.appendChild(U.el('button', {
        class: 'btn cyan', text: 'GETAL/BUZZ GEZEGD',
        onClick: () => {
          AudioFX.softBeep();
          if (count >= 50) return finish();
          count++;
          turnIdx = (turnIdx + 1) % players.length;
          update();
        }
      }));
      actions.appendChild(U.el('button', {
        class: 'btn danger', text: 'FOUT (' + drinkWrong + ')',
        onClick: () => {
          AudioFX.lose(); U.flash('fire');
          count = 1;
          turnIdx = (turnIdx + 1) % players.length;
          update();
        }
      }));

      footer.appendChild(U.el('button', { class: 'btn small ghost', text: 'STOPPEN', onClick: () => ctx.next() }));

      function finish() {
        body.innerHTML = ''; footer.innerHTML = '';
        const drink = U.buildDrinkInstruction(3, availableDrinks, intensity);
        AudioFX.win(); U.flash('cyan');
        body.appendChild(U.el('div', { class: 'sociale-headline', text: '50!' }));
        body.appendChild(U.el('div', { class: 'sociale-reason', html: `Iedereen behalve <strong>${players[(turnIdx + players.length - 1) % players.length]}</strong>: ${drink}` }));
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }

      update();
    }
  };
})();
