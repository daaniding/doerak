/* Cheers to the Governor — manual play. Group plays IRL, app records drinks
 * and lets the winner add a session-wide rule. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.twentyone = {
    id: 'twentyone',
    name: 'CHEERS TO THE GOVERNOR',
    desc: 'Tel met de groep tot 21. Wie 21 zegt maakt een nieuwe regel. Tap wie drinkt bij fouten.',
    long: false,
    weight: { chill: 0.6, normaal: 0.9, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const counts = {};
      players.forEach(p => counts[p] = 0);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'CHEERS' }),
        U.el('div', { class: 'gh-tag', text: 'TEL TOT 21' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'CHEERS TO THE GOVERNOR' }));
      body.appendChild(U.el('div', { class: 'body-card',
        html: 'Tel om de beurt naar 21. Bij fouten: tap die persoon hieronder. Wie <strong>21</strong> zegt mag een regel maken.' }));

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
        class: 'btn full mint', text: 'IEMAND ZEI 21',
        onClick: () => ruleStep()
      }));
      footer.appendChild(U.el('button', {
        class: 'btn primary', text: 'KLAAR',
        onClick: () => { AudioFX.beep(); ctx.next(); }
      }));

      function ruleStep() {
        body.innerHTML = ''; footer.innerHTML = '';
        AudioFX.win(); U.flash('lime');
        body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'NIEUWE REGEL' }));
        body.appendChild(U.el('div', { class: 'body-card',
          html: 'De winnaar maakt een regel die de hele avond geldt. Kies een suggestie of typ zelf.' }));

        const quick = U.el('div', { class: 'quick-rules' });
        const suggestions = U.pickN(window.DOERAK_DATA.regelRoulette, 3);
        suggestions.forEach(s => {
          const fill = U.fillTemplate(s, { players, availableDrinks, intensity });
          quick.appendChild(U.el('button', { class: 'chip', text: fill, onClick: () => addRule(fill) }));
        });
        body.appendChild(quick);

        const ri = U.el('div', { class: 'ruleinput' });
        const inp = U.el('input', { type: 'text', placeholder: 'Eigen regel...' });
        ri.appendChild(inp);
        ri.appendChild(U.el('button', {
          class: 'btn small primary', text: 'OK',
          onClick: () => { if (inp.value.trim()) addRule(inp.value.trim()); }
        }));
        body.appendChild(ri);
        footer.appendChild(U.el('button', { class: 'btn full ghost', text: 'OVERSLAAN', onClick: () => ctx.next() }));
      }

      function addRule(text) {
        ctx.addRule(text, 'coral');
        AudioFX.win();
        ctx.next();
      }
    }
  };
})();
