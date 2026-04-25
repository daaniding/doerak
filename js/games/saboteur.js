/* Saboteur — secret role pass-around, then 3 minute free play, then group votes. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.saboteur = {
    id: 'saboteur',
    name: 'SABOTEUR',
    desc: 'Eén speler is de saboteur. 3 minuten free play. Daarna stemmen.',
    long: true,
    weight: { chill: 0.5, normaal: 0.7, heftig: 0.8 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const sab = U.pick(players);
      let i = 0;

      const root = U.el('div', { class: 'game' });
      const header = U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'SABOTEUR' }),
        U.el('div', { class: 'gh-tag', text: 'GEHEIME ROL' })
      );
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(header); root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      function pass() {
        body.innerHTML = ''; footer.innerHTML = '';
        if (i >= players.length) return phaseFreeplay();
        const p = players[i];
        body.appendChild(U.el('div', { class: 'kicker', text: 'GEEF DOOR AAN' }));
        body.appendChild(U.el('div', { class: 'pass-name', text: p }));
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'TOON MIJN ROL',
          onClick: () => showRole(p)
        }));
      }

      function showRole(p) {
        body.innerHTML = '';
        const isSab = (p === sab);
        const card = U.el('div', { class: 'role-card' + (isSab ? ' saboteur' : '') });
        card.textContent = isSab ? 'JIJ BENT DE SABOTEUR' : 'GEEN SABOTEUR';
        body.appendChild(card);
        if (isSab) {
          body.appendChild(U.el('div', { class: 'sociale-reason',
            html: 'Probeer 1x iemand anders te laten drinken zonder gepakt te worden. Wees subtiel.' }));
        }
        footer.innerHTML = '';
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'GEZIEN — DOORGEVEN',
          onClick: () => { i++; pass(); }
        }));
      }

      function phaseFreeplay() {
        body.innerHTML = ''; footer.innerHTML = '';
        let remaining = 180;
        body.appendChild(U.el('div', { class: 'kicker orange', text: 'FREE PLAY' }));
        const tEl = U.el('div', { class: 'hotseat-timer', text: U.fmtTime(remaining) });
        body.appendChild(tEl);
        body.appendChild(U.el('div', { class: 'sociale-reason', html: 'Praat. Drink. Saboteur probeert iemand subtiel te laten drinken.' }));
        const skip = U.el('button', { class: 'btn full ghost', text: 'STEMMEN NU', onClick: () => phaseVote() });
        footer.appendChild(skip);
        const interval = setInterval(() => {
          remaining--;
          tEl.textContent = U.fmtTime(remaining);
          if (remaining <= 0) { clearInterval(interval); phaseVote(); }
        }, 1000);
        ctx.cleanup = () => clearInterval(interval);
      }

      function phaseVote() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'gh-name', style: { textAlign: 'center' }, text: 'WIE IS DE SABOTEUR?' }));
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
        const correct = guess === sab;
        AudioFX[correct ? 'win' : 'lose'](); U.flash(correct ? 'cyan' : 'fire');
        body.appendChild(U.el('div', { class: 'kicker orange', text: 'DE SABOTEUR WAS' }));
        body.appendChild(U.el('div', { class: 'sociale-headline', text: sab }));
        if (correct) {
          const drink = U.buildDrinkInstruction(5, availableDrinks, intensity);
          body.appendChild(U.el('div', { class: 'mlt-points', html: `Goed geraden! ${sab} ${drink}` }));
        } else {
          const drink = U.buildDrinkInstruction(5, availableDrinks, intensity);
          const drink2 = U.buildDrinkInstruction(3, availableDrinks, intensity);
          body.appendChild(U.el('div', { class: 'mlt-points',
            html: `${guess} (verkeerd beschuldigd) ${drink}<br><span style="font-size:18px;color:var(--ink-cyan)">Saboteur kiest iemand voor ${drink2}</span>` }));
        }
        footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
      }

      pass();
    }
  };
})();
