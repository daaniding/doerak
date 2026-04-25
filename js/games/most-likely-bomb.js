/* Most Likely To + Tijdsbom — pass phone with hidden timer, holder must answer. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.mostLikelyBomb = {
    id: 'mostLikelyBomb',
    name: 'MOST LIKELY :: BOMB',
    desc: 'Geef door tijdens het tikken. Wie hem heeft als ie afgaat, beantwoordt zelf.',
    long: false,
    weight: { chill: 0.9, normaal: 1.0, heftig: 1.1 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const [n1, n2] = U.pickTwo(players);
      const tpl = U.pick(window.DOERAK_DATA.mostLikelyTo);
      const question = U.fillTemplate(tpl, { players, seedNames: { name1: n1, name2: n2 } });

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'MLT :: BOMB' }),
        U.el('div', { class: 'gh-tag', text: 'GEEF DOOR' })
      ));
      const body = U.el('div', { class: 'game-body' });
      body.appendChild(U.el('div', { class: 'mlt-question', html: question }));
      const bomb = U.el('div', { class: 'bomb' },
        U.el('div', { class: 'bomb-circle' }),
        U.el('div', { class: 'bomb-fuse' }),
        U.el('div', { class: 'skull', text: '☠' })
      );
      body.appendChild(bomb);
      root.appendChild(body);
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      const totalMs = U.randInt(20000, 40000);
      const start = Date.now();
      const tInt = setInterval(() => {
        AudioFX.tick();
        const remaining = totalMs - (Date.now() - start);
        if (remaining < 5000) bomb.classList.add('danger');
        if (remaining < 3000) U.shake(root, true, 200);
        if (remaining <= 0) {
          clearInterval(tInt);
          AudioFX.boom();
          U.flash('fire');
          U.shake(root, true, 500);
          body.innerHTML = '';
          body.appendChild(U.el('div', { class: 'bomb-result', text: 'BOEM' }));
          const drink = U.buildDrinkInstruction(4, availableDrinks, intensity);
          const refuseDrink = U.buildDrinkInstruction(6, availableDrinks, intensity);
          const msg = U.el('div', { class: 'bomb-message' });
          msg.innerHTML = `Wie hem nu vasthoudt: beantwoord de vraag over jezelf<br><strong style="color:var(--ink-orange)">${drink}</strong><br><span style="font-size:13px;color:var(--ink-cyan)">Weiger? ${refuseDrink}</span>`;
          body.appendChild(msg);
          footer.innerHTML = '';
          footer.appendChild(U.el('button', {
            class: 'btn full', text: 'VOLGENDE RONDE',
            onClick: () => ctx.next()
          }));
        }
      }, 1000);

      ctx.cleanup = () => clearInterval(tInt);
    }
  };
})();
