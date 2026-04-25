/* Guess in 5 — name 3 things in 5 seconds. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.guess5 = {
    id: 'guess5',
    name: 'GUESS IN 5',
    desc: 'Noem 3 dingen voordat de tijd op is. 5 seconden, geen langer.',
    long: false,
    weight: { chill: 1.0, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const target = U.pick(players);
      const cat = U.fillTemplate(U.pick(window.DOERAK_DATA.guess5),
        { players, seedNames: { name1: U.pickExcept(players, target) } });

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'GUESS IN 5' }),
        U.el('div', { class: 'gh-tag', text: '5 SECONDEN' })
      ));
      const body = U.el('div', { class: 'game-body center' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      body.appendChild(U.el('div', { class: 'kicker orange', text: 'DE GEKOZENE' }));
      body.appendChild(U.el('div', { class: 'sociale-reason', text: target }));
      body.appendChild(U.el('div', { class: 'mlt-question center', text: 'Noem ' + cat }));
      const big = U.el('div', { class: 'guess-num', text: '5' });
      body.appendChild(big);

      let n = 5;
      const int = setInterval(() => {
        n--;
        AudioFX.tick();
        big.textContent = n > 0 ? n : 'GO';
        if (n <= 1) U.shake(big, true, 1000);
        if (n < 0) {
          clearInterval(int);
          AudioFX.boom();
          big.textContent = 'KLAAR';
          showResult();
        }
      }, 1000);
      ctx.cleanup = () => clearInterval(int);

      function showResult() {
        footer.innerHTML = '';
        const drinkSelf = U.buildDrinkInstruction(4, availableDrinks, intensity);
        const drinkOther = U.buildDrinkInstruction(3, availableDrinks, intensity);
        const row = U.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' } });
        row.appendChild(U.el('button', {
          class: 'btn cyan', text: 'GEHAALD',
          onClick: () => {
            body.appendChild(U.el('div', { class: 'mlt-points', html: `${target} mag iemand kiezen voor ${drinkOther}` }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
          }
        }));
        row.appendChild(U.el('button', {
          class: 'btn danger', text: 'NIET',
          onClick: () => {
            body.appendChild(U.el('div', { class: 'mlt-points', html: `${target} ${drinkSelf}` }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
          }
        }));
        footer.appendChild(row);
      }
    }
  };
})();
