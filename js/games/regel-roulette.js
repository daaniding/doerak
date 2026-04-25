/* Regel Roulette — spin a wheel, lock in a rule for the rest of the session. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.regelRoulette = {
    id: 'regelRoulette',
    name: 'HET RAD',
    desc: 'Spin het rad. Wat eruit komt geldt de hele avond.',
    howto: [
      'Tap om te draaien.',
      'De landing geeft je een nieuwe huisregel.',
      'De regel blijft zichtbaar bovenin tijdens alle volgende spellen.'
    ],
    long: false,
    weight: { chill: 0.8, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const candidates = U.pickN(window.DOERAK_DATA.regelRoulette, 12)
        .map(t => U.fillTemplate(t, { players, availableDrinks, intensity }));

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'HET RAD' }),
        U.el('div', { class: 'gh-tag', text: 'DRAAI' })
      ));
      const body = U.el('div', { class: 'game-body center' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      const wheelWrap = U.el('div', { style: { position: 'relative', width: '100%', display: 'grid', placeItems: 'center' } });
      const wheel = U.el('div', { class: 'wheel-frame' });
      wheelWrap.appendChild(U.el('div', { class: 'wheel-pointer' }));
      wheelWrap.appendChild(wheel);
      body.appendChild(wheelWrap);

      const ruleEl = U.el('div', { class: 'wheel-rule', text: 'Tap om te draaien' });
      body.appendChild(ruleEl);

      const spinBtn = U.el('button', {
        class: 'btn full cyan', text: 'DRAAI', onClick: spin
      });
      footer.appendChild(spinBtn);

      function spin() {
        spinBtn.disabled = true;
        const turns = 4 + Math.random() * 3;
        const finalAngle = turns * 360 + Math.random() * 360;
        wheel.style.transform = `rotate(${finalAngle}deg)`;

        // tick sounds during spin
        let i = 0;
        const tickInt = setInterval(() => {
          AudioFX.slotClick();
          i++;
          if (i > 20) clearInterval(tickInt);
        }, 200);

        setTimeout(() => {
          clearInterval(tickInt);
          AudioFX.boom(); U.flash('cyan');
          const rule = U.pick(candidates);
          ruleEl.textContent = rule;
          ctx.addRule(rule, 'orange');
          footer.innerHTML = '';
          footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
        }, 4600);
      }
    }
  };
})();
