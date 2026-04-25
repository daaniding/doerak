/* Imposter Woord — pass-around word reveal, then group debates and votes. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.imposter = {
    id: 'imposter',
    name: 'DE MOL',
    desc: 'Iedereen ziet hetzelfde woord. Behalve één. Vind de mol.',
    howto: [
      'Geef door, ieder ziet zijn eigen woord (de mol ziet iets anders).',
      'Om de beurt zegt iedereen 1 woord dat met het thema te maken heeft.',
      'Stem wie de mol is. Goed = mol drinkt. Mis = jij drinkt.'
    ],
    long: true,
    weight: { chill: 0.5, normaal: 0.7, heftig: 0.7 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const pair = U.pick(window.DOERAK_DATA.imposter);
      const imposter = U.pick(players);
      let i = 0;

      const root = U.el('div', { class: 'game' });
      const header = U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'DE MOL' }),
        U.el('div', { class: 'gh-tag', text: 'GEHEIM WOORD' })
      );
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(header); root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      function showPass() {
        body.innerHTML = ''; footer.innerHTML = '';
        if (i >= players.length) return phaseDiscuss();
        const p = players[i];
        body.appendChild(U.el('div', { class: 'imposter-pass' },
          U.el('div', { class: 'kicker', text: 'GEEF DE TELEFOON AAN' }),
          U.el('div', { class: 'pass-name', text: p })
        ));
        footer.appendChild(U.el('button', {
          class: 'btn full primary', text: 'TOON MIJN WOORD',
          onClick: () => { AudioFX.beep(); showWord(p); }
        }));
        U.turnPopup(p, 'KIJK NU');
      }

      function showWord(p) {
        body.innerHTML = '';
        const word = (p === imposter) ? pair.imp : pair.all;
        const isImp = (p === imposter);
        const card = U.el('div', { class: 'imposter-card' + (isImp ? ' imp' : '') });
        card.appendChild(U.el('div', { class: 'kicker', text: isImp ? 'JIJ BENT...' : 'JOUW WOORD' }));
        card.appendChild(U.el('div', { class: 'word', text: word }));
        if (isImp) card.appendChild(U.el('div', { class: 'gh-tag', style: { background: 'var(--ink)', color: 'var(--yellow)' }, text: 'BLUFF JE WAY THROUGH' }));
        body.appendChild(card);
        footer.innerHTML = '';
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'KLAAR — GEEF DOOR',
          onClick: () => { i++; showPass(); }
        }));
      }

      function phaseDiscuss() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'gh-name', style: { textAlign: 'center' }, text: 'PRAAT' }));
        body.appendChild(U.el('div', { class: 'sociale-reason', html: 'Iedereen om de beurt zegt 1 woord dat met het thema te maken heeft. <br>Twee rondes.' }));
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'KLAAR MET PRATEN — STEMMEN',
          onClick: () => phaseVote()
        }));
      }

      function phaseVote() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'gh-name', style: { textAlign: 'center' }, text: 'WIE IS DE IMPOSTER?' }));
        const grid = U.el('div', { class: 'target-list' });
        players.forEach(p => {
          grid.appendChild(U.el('button', {
            class: 'target-btn', text: p,
            onClick: () => phaseReveal(p)
          }));
        });
        body.appendChild(grid);
      }

      function phaseReveal(guess) {
        body.innerHTML = ''; footer.innerHTML = '';
        const correct = guess === imposter;
        AudioFX[correct ? 'win' : 'lose']();
        U.flash(correct ? 'cyan' : 'fire');
        body.appendChild(U.el('div', { class: 'kicker orange', text: 'IMPOSTER WAS' }));
        body.appendChild(U.el('div', { class: 'sociale-headline', text: imposter }));
        body.appendChild(U.el('div', { class: 'sociale-reason',
          html: `Woord van de groep: <strong>${pair.all}</strong> &mdash; imposter had: <strong>${pair.imp}</strong>` }));
        if (correct) {
          const drink = U.buildDrinkInstruction(5, availableDrinks, intensity);
          body.appendChild(U.el('div', { class: 'mlt-points', html: `${imposter}, ${drink}` }));
        } else {
          const drink = U.buildDrinkInstruction(5, availableDrinks, intensity);
          const drink2 = U.buildDrinkInstruction(3, availableDrinks, intensity);
          body.appendChild(U.el('div', { class: 'mlt-points', html: `${guess} (verkeerd beschuldigd) ${drink}<br><span style="font-size:18px;color:var(--ink-cyan)">${imposter} kiest iemand voor ${drink2}</span>` }));
        }
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }

      showPass();
    }
  };
})();
