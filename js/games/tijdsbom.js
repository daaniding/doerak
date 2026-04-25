/* Tijdsbom — phone-pass timer that explodes randomly. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.tijdsbom = {
    id: 'tijdsbom',
    name: 'HETE AARDAPPEL',
    desc: 'De telefoon is heet. Geef door en hoop dat ie niet bij jou ontploft.',
    howto: [
      'Geef de telefoon zo snel mogelijk door.',
      'Een verborgen timer (15-45 sec) tikt af.',
      'Wie hem vasthoudt als ie afgaat — drinkt.'
    ],
    long: false,
    weight: { chill: 1.2, normaal: 1.4, heftig: 1.6 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const drinkText = U.buildDrinkInstruction(3, availableDrinks, intensity);
      const totalMs = U.randInt(15000, 45000);
      const startedAt = Date.now();

      container.innerHTML = '';
      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'TIJDSBOM' }),
        U.el('div', { class: 'gh-tag', text: 'PASS THE BOMB' })
      ));
      const body = U.el('div', { class: 'game-body center' });
      const bombWrap = U.el('div', { class: 'bomb' },
        U.el('div', { class: 'bomb-circle' }),
        U.el('div', { class: 'bomb-fuse' }),
        U.el('div', { class: 'skull', text: '☠' })
      );
      const msg = U.el('div', { class: 'bomb-message' });
      msg.innerHTML = `Geef de telefoon door — wie hem heeft als ie afgaat <span style="color:var(--ink-orange)">${drinkText}</span>`;
      body.appendChild(bombWrap);
      body.appendChild(msg);
      root.appendChild(body);
      container.appendChild(root);

      let interval = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = totalMs - elapsed;
        AudioFX.tick();
        if (remaining < 5000) {
          bombWrap.classList.add('danger');
          U.shake(root, false, 200);
        }
        if (remaining < 3000) {
          U.shake(root, true, 200);
        }
        if (remaining <= 0) {
          clearInterval(interval);
          interval = null;
          AudioFX.boom();
          U.flash('fire');
          U.shake(root, true, 500);
          body.innerHTML = '';
          body.appendChild(U.el('div', { class: 'bomb-result', text: 'BOEM!' }));
          const winnerMsg = U.el('div', { class: 'bomb-message' });
          winnerMsg.innerHTML = `Wie hem nu vasthoudt <strong style="color:var(--ink-orange)">${drinkText}</strong>`;
          body.appendChild(winnerMsg);
          const next = U.el('button', {
            class: 'btn full', text: 'VOLGENDE RONDE',
            onClick: () => { AudioFX.beep(); ctx.next(); }
          });
          const footer = U.el('div', { class: 'game-footer' }, next);
          root.appendChild(footer);
        }
      }, 1000);

      ctx.cleanup = () => { if (interval) clearInterval(interval); };
    }
  };
})();
