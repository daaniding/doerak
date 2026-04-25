/* Dubbel Pech — two random players share a punishment. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.dubbelPech = {
    id: 'dubbelPech',
    name: 'DUBBEL PECH',
    desc: 'Twee spelers krijgen samen één straf. Loting telt.',
    long: false,
    weight: { chill: 0.9, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const [a, b] = U.pickTwo(players);
      const punishment = U.fillTemplate(U.pick(window.DOERAK_DATA.dubbelPech),
        { players, availableDrinks, intensity, seedNames: { name1: a, name2: b } });

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'DUBBEL PECH' }),
        U.el('div', { class: 'gh-tag', text: 'TWEE LOTEN' })
      ));
      const body = U.el('div', { class: 'game-body center' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      const scroll = U.el('div', { class: 'sociale-headline', style: { fontSize: '36px' }, text: '...' });
      body.appendChild(scroll);
      let i = 0;
      const int = setInterval(() => {
        scroll.textContent = U.pick(players).toUpperCase() + ' & ' + U.pick(players).toUpperCase();
        AudioFX.slotClick();
        i++;
        if (i > 12) {
          clearInterval(int);
          scroll.remove();
          AudioFX.boom(); U.flash('fire');
          body.appendChild(U.el('div', { class: 'dubbel-names' },
            U.el('div', { class: 'nm', text: a }),
            U.el('div', { class: 'plus', style: { fontSize: '28px', color: 'var(--ink-cyan)' }, text: '&' }),
            U.el('div', { class: 'nm', text: b })
          ));
          body.appendChild(U.el('div', { class: 'sociale-reason', html: punishment }));
          footer.innerHTML = '';
          footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
        }
      }, 110);

      ctx.cleanup = () => clearInterval(int);
    }
  };
})();
