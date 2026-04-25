/* Drunk-ocracy — anonymous voting, minority drinks. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.drunkocracy = {
    id: 'drunkocracy',
    name: 'DRUNK-OCRACY',
    desc: 'Iedereen stemt anoniem. Minderheid drinkt. 50/50 = iedereen drinkt.',
    long: false,
    weight: { chill: 1.0, normaal: 1.0, heftig: 0.9 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const item = U.pick(window.DOERAK_DATA.drunkocracy);
      const [n1] = U.pickTwo(players);
      const fillOpts = item.opts.map(o => U.fillTemplate(o, { players, seedNames: { name1: n1 } }));
      const question = U.fillTemplate(item.q, { players, seedNames: { name1: n1 } });
      const votes = new Array(fillOpts.length).fill(0);
      const choices = []; // per voter
      let i = 0;

      const root = U.el('div', { class: 'game' });
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'DRUNK-OCRACY' }),
        U.el('div', { class: 'gh-tag', text: 'STEMRECHT' })
      ));
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      function pass() {
        body.innerHTML = ''; footer.innerHTML = '';
        if (i >= players.length) return reveal();
        const voter = players[i];
        body.appendChild(U.el('div', { class: 'kicker', text: 'GEHEIM STEMMEN — GEEF DOOR AAN' }));
        body.appendChild(U.el('div', { class: 'pass-name', text: voter }));
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'IK BEN ' + voter,
          onClick: () => doVote(voter)
        }));
      }

      function doVote(voter) {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'mlt-question', text: question }));
        const list = U.el('div', { class: 'dock-vote' });
        fillOpts.forEach((opt, idx) => {
          list.appendChild(U.el('button', {
            class: 'dock-opt', text: opt,
            onClick: () => {
              votes[idx]++;
              choices.push(idx);
              i++;
              AudioFX.softBeep();
              pass();
            }
          }));
        });
        body.appendChild(list);
      }

      function reveal() {
        body.innerHTML = ''; footer.innerHTML = '';
        AudioFX.reveal(); U.flash('cyan');
        body.appendChild(U.el('div', { class: 'kicker orange', text: 'UITSLAG' }));
        body.appendChild(U.el('div', { class: 'mlt-question', text: question }));
        const max = Math.max(...votes);
        const total = votes.reduce((a, b) => a + b, 0);
        fillOpts.forEach((opt, idx) => {
          const row = U.el('div', { style: { marginTop: '8px' } },
            U.el('div', { class: 'row spread' },
              U.el('div', { class: 'gh-name', style: { fontSize: '20px' }, text: opt }),
              U.el('div', { class: 'gh-tag', text: votes[idx] + ' / ' + total })
            ),
            U.el('div', { class: 'dock-result-bar' })
          );
          body.appendChild(row);
          requestAnimationFrame(() => {
            row.querySelector('.dock-result-bar > i, .dock-result-bar')
              .insertAdjacentHTML('afterbegin','');
            const bar = row.querySelector('.dock-result-bar');
            const fill = U.el('i');
            bar.appendChild(fill);
            requestAnimationFrame(() => fill.style.width = (votes[idx] / total * 100).toFixed(0) + '%');
          });
        });

        // determine minority
        const tied = votes.filter(v => v === max).length > 1;
        let lossText;
        if (tied) {
          const drink = U.buildDrinkInstruction(2, availableDrinks, intensity);
          lossText = `Gelijkspel — iedereen ${drink}`;
        } else {
          const losers = [];
          choices.forEach((c, idx) => { if (votes[c] !== max) losers.push(players[idx]); });
          const drink = U.buildDrinkInstruction(3, availableDrinks, intensity);
          lossText = losers.length
            ? `Minderheid: <strong>${losers.join(', ')}</strong> — ${drink}`
            : `Iedereen unaniem — geen drank`;
        }
        const ver = U.el('div', { class: 'mlt-points', html: lossText, style: { marginTop: '16px' } });
        body.appendChild(ver);
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }

      pass();
    }
  };
})();
