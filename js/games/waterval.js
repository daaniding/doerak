/* Waterval — start drinks, others drink in order, no one stops before person before. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.waterval = {
    id: 'waterval',
    name: 'WATERVAL',
    desc: 'Eén start, de rest volgt om de beurt. Niemand stopt voor de persoon voor je.',
    long: false,
    weight: { chill: 0.7, normaal: 0.9, heftig: 1.1 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const start = U.pick(players);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'WATERVAL' }),
        U.el('div', { class: 'gh-tag', text: 'KETTING' })
      ));
      const body = U.el('div', { class: 'game-body center' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      // visualize seating circle
      const wrap = U.el('div', { class: 'water-circle' });
      const startIdx = players.indexOf(start);
      const ordered = players.slice(startIdx).concat(players.slice(0, startIdx));
      ordered.forEach((p, idx) => {
        const angle = (idx / ordered.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 42;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const seat = U.el('div', {
          class: 'seat' + (p === start ? ' start' : ''),
          style: { left: x + '%', top: y + '%', transform: 'translate(-50%, -50%)' },
          text: p
        });
        wrap.appendChild(seat);
      });
      body.appendChild(wrap);
      const drink = U.buildDrinkInstruction(1, availableDrinks, intensity);
      body.appendChild(U.el('div', { class: 'sociale-reason',
        html: `<strong>${start}</strong> start. De rest volgt richting de klok. Niemand stopt voor de persoon vóór je.<br><span style="color:var(--ink-cyan)">Basis per persoon: ${drink}</span>` }));

      footer.appendChild(U.el('button', { class: 'btn full', text: 'KLAAR', onClick: () => { AudioFX.beep(); ctx.next(); } }));
    }
  };
})();
