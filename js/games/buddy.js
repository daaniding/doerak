/* Buddy System — two players become buddies for 3 rounds, share drinks. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.buddy = {
    id: 'buddy',
    name: 'BUDDY SYSTEM',
    desc: 'Twee spelers worden buddies — wat de één drinkt, drinkt de ander ook.',
    long: false,
    weight: { chill: 1.0, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players } = ctx;
      const [a, b] = U.pickTwo(players);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'BUDDY SYSTEM' }),
        U.el('div', { class: 'gh-tag', text: 'LOTING' })
      ));
      const body = U.el('div', { class: 'game-body center' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      // mock loting scroll
      const scroll = U.el('div', { class: 'sociale-headline', style: { fontSize: '40px' }, text: 'LOTING...' });
      body.appendChild(scroll);
      let i = 0;
      const interval = setInterval(() => {
        scroll.textContent = U.pick(players).toUpperCase() + ' / ' + U.pick(players).toUpperCase();
        AudioFX.slotClick();
        i++;
        if (i > 14) {
          clearInterval(interval);
          scroll.remove();
          AudioFX.boom(); U.flash('cyan');
          showPair();
        }
      }, 120);

      function showPair() {
        body.innerHTML = '';
        const pair = U.el('div', { class: 'buddy-pair' },
          U.el('div', { class: 'b', text: a }),
          U.el('div', { class: 'plus', text: '+' }),
          U.el('div', { class: 'b', text: b })
        );
        body.appendChild(pair);
        body.appendChild(U.el('div', { class: 'sociale-reason', html: 'Voor de volgende <strong>3 rondes</strong> drinken jullie samen — wat de één drinkt, drinkt de ander ook.' }));
        ctx.addRule(`${a} + ${b} = BUDDIES (3 rondes)`, 'cyan', 3);
        footer.innerHTML = '';
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }

      ctx.cleanup = () => clearInterval(interval);
    }
  };
})();
