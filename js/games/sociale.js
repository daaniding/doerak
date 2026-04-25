/* Sociale — everyone drinks, with a hilariously specific reason. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.sociale = {
    id: 'sociale',
    name: 'SOCIALE',
    desc: 'Iedereen drinkt. Lekker simpel, lekker collectief.',
    long: false,
    breather: true,
    weight: { chill: 1.0, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const tpl = U.pick(window.DOERAK_DATA.sociale);
      const reason = U.fillTemplate(tpl, { players, availableDrinks, intensity });

      const root = U.el('div', { class: 'game' });
      const body = U.el('div', { class: 'game-body center' });
      body.appendChild(U.el('div', { class: 'sociale-headline', text: 'SOCIALE!' }));
      body.appendChild(U.el('div', { class: 'sociale-reason', html: reason }));
      root.appendChild(body);
      const footer = U.el('div', { class: 'game-footer' },
        U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => { AudioFX.beep(); ctx.next(); } })
      );
      root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);
      AudioFX.win();
      U.flash('cyan');
    }
  };
})();
