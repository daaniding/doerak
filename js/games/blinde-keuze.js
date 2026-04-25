/* Blinde Keuze — three doors, random outcome. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.blindeKeuze = {
    id: 'blindeKeuze',
    name: 'BLINDE KEUZE',
    desc: 'Kies 1 van 3 deuren. Wat erachter zit, weet je pas als hij open is.',
    long: false,
    weight: { chill: 0.9, normaal: 1.0, heftig: 1.2 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const target = U.pick(players);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'BLINDE KEUZE' }),
        U.el('div', { class: 'gh-tag', text: 'KIES EEN DEUR' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      body.appendChild(U.el('div', { class: 'kicker orange', text: 'DE GEKOZENE' }));
      body.appendChild(U.el('div', { class: 'pass-name', text: target }));
      const doors = U.el('div', { class: 'doors' });
      [1, 2, 3].forEach(n => {
        const d = U.el('div', { class: 'door' }, U.el('div', { class: 'num', text: n }));
        d.addEventListener('click', () => choose(d, n));
        doors.appendChild(d);
      });
      body.appendChild(doors);

      function choose(door, n) {
        doors.querySelectorAll('.door').forEach(d => d.style.pointerEvents = 'none');
        const r = Math.random();
        let outcome, content;
        if (r < 0.4) {
          outcome = 'light';
          content = U.fillTemplate(U.pick(window.DOERAK_DATA.blindeKeuze.light),
            { players, availableDrinks, intensity, seedNames: { name1: U.pickExcept(players, target) } });
        } else if (r < 0.8) {
          outcome = 'medium';
          content = U.fillTemplate(U.pick(window.DOERAK_DATA.blindeKeuze.medium),
            { players, availableDrinks, intensity, seedNames: { name1: U.pickExcept(players, target) } });
        } else {
          outcome = 'heavy';
          content = U.fillTemplate(U.pick(window.DOERAK_DATA.blindeKeuze.heavy),
            { players, availableDrinks, intensity, seedNames: { name1: U.pickExcept(players, target) } });
        }
        door.classList.add('opened', 'outcome-' + outcome);
        AudioFX[outcome === 'heavy' ? 'lose' : outcome === 'medium' ? 'reveal' : 'win']();
        U.flash(outcome === 'heavy' ? 'fire' : 'cyan');
        if (outcome === 'heavy') U.shake(root, true, 400);

        body.appendChild(U.el('div', { class: 'blinde-result', html: `<strong>${target}</strong>: ${content}` }));
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }
    }
  };
})();
