/* Juffen — manual play. Group plays Juffen IRL, app records who drank.
 * Replaces previous Buzz mechanic — app doesn't try to count along.
 * Each drink registered for promille tracking. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.buzz = {
    id: 'buzz',
    name: 'JUFFEN',
    desc: 'Klassiek juffen aan tafel. Tap wie er foutgaat.',
    howto: [
      'Tel om de beurt op (1, 2, 3, ...).',
      'Bij multiples van 7 of getallen mét 7: zeg "juf".',
      'Foutje? Tap je naam — slok wordt geregistreerd voor de promille-meter.'
    ],
    long: false,
    weight: { chill: 0.7, normaal: 1.0, heftig: 1.2 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const counts = {};
      players.forEach(p => counts[p] = 0);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'JUFFEN' }),
        U.el('div', { class: 'gh-tag', text: 'TAP WIE DRINKT' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      body.appendChild(U.el('div', { class: 'kicker mint', style: { alignSelf: 'center' }, text: 'SPEEL HET POTJE' }));
      body.appendChild(U.el('div', { class: 'body-card',
        html: 'Klassieke juffen. Op multiples van 7 of getallen mét 7: zeg <strong>"juf"</strong>. Foutje? Tap je naam hieronder.' }));

      const list = U.el('div', { class: 'tap-tally' });
      function refresh() {
        list.innerHTML = '';
        players.forEach(p => {
          const row = U.el('div', { class: 'tap-row', onClick: () => {
            counts[p]++;
            ctx.trackDrink(p, 1);
            AudioFX.softBeep();
            row.classList.add('flash');
            setTimeout(() => row.classList.remove('flash'), 240);
            refresh();
          }});
          row.appendChild(U.el('div', { class: 'tap-name', text: p }));
          row.appendChild(U.el('div', { class: 'tap-count', text: counts[p] || '0' }));
          list.appendChild(row);
        });
      }
      refresh();
      body.appendChild(list);

      footer.appendChild(U.el('button', {
        class: 'btn full primary', text: 'KLAAR',
        onClick: () => { AudioFX.beep(); ctx.next(); }
      }));
    }
  };
})();
