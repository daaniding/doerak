/* Snel Antwoord — random speler krijgt random vraag, 3 sec om te antwoorden.
 * Groep beoordeelt: goed / niet goed. Niet goed = drinkt. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.snelAntwoord = {
    id: 'snelAntwoord',
    name: 'FLITS',
    desc: 'Random vraag, 3 seconden om te antwoorden. Te traag of slecht? Drinken.',
    howto: [
      'Random speler krijgt random vraag.',
      '3 seconden countdown — geen tijd om te denken.',
      'Groep beoordeelt: GOED of NIET GOED.'
    ],
    long: false,
    weight: { chill: 1.0, normaal: 1.2, heftig: 1.2 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const target = U.pick(players);
      const question = U.pick(window.DOERAK_DATA.snelAntwoord);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'FLITS' }),
        U.el('div', { class: 'gh-tag', text: '3 SECONDEN' })
      ));
      const body = U.el('div', { class: 'game-body center' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'AAN HET WOORD' }));
      body.appendChild(U.el('div', { class: 'pass-name', text: target }));
      body.appendChild(U.el('div', { class: 'mlt-question', text: question }));
      const big = U.el('div', { class: 'guess-num', text: '3' });
      body.appendChild(big);

      let n = 3;
      let int;
      U.turnPopup(target, 'KRIJGT EEN VRAAG').then(() => {
        AudioFX.tick();
        int = setInterval(tick, 1000);
      });
      function tick() {
        n--;
        AudioFX.tick();
        big.textContent = n > 0 ? n : 'NU!';
        if (n <= 1) U.shake(big, true, 800);
        if (n < 0) {
          clearInterval(int);
          AudioFX.boom();
          big.textContent = 'KLAAR';
          showResult();
        }
      }
      ctx.cleanup = () => { if (int) clearInterval(int); };

      function showResult() {
        footer.innerHTML = '';
        const drinkBad = U.buildDrinkInstruction(3, availableDrinks, intensity);
        const row = U.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' } });
        row.appendChild(U.el('button', {
          class: 'btn mint', text: 'GOED',
          onClick: () => {
            body.appendChild(U.el('div', { class: 'mlt-points', html: `<strong>${target}</strong> ontkomt eraan` }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full primary', text: 'VOLGENDE', onClick: () => ctx.next() }));
          }
        }));
        row.appendChild(U.el('button', {
          class: 'btn danger', text: 'NIET GOED',
          onClick: () => {
            ctx.trackDrink(target, 3);
            body.appendChild(U.el('div', { class: 'mlt-points', html: `<strong>${target}</strong>, ${drinkBad}` }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full primary', text: 'VOLGENDE', onClick: () => ctx.next() }));
          }
        }));
        footer.appendChild(row);
      }
    }
  };
})();
