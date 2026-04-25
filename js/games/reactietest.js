/* Reactietest — tap when screen turns green. 3 attempts each, slowest drinks most. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.reactietest = {
    id: 'reactietest',
    name: 'GROEN LICHT',
    desc: 'Tap zodra het scherm groen wordt. Slootste van de groep krijgt de meeste slokken.',
    howto: [
      'Iedereen krijgt 3 beurten.',
      'Wacht tot het scherm groen wordt en tap zo snel mogelijk.',
      'Te vroeg = direct slokken. Top 3 traagste drinkt aan het eind.'
    ],
    long: false,
    weight: { chill: 1.0, normaal: 1.0, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const ATTEMPTS_PER = 3;
      const results = {}; // name -> [ms, ms, ms]
      players.forEach(p => results[p] = []);

      let queue = [];
      players.forEach(p => { for (let i = 0; i < ATTEMPTS_PER; i++) queue.push(p); });
      queue = U.shuffle(queue);

      const root = U.el('div', { class: 'game' });
      const header = U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'GROEN LICHT' }),
        U.el('div', { class: 'gh-tag', text: 'TAP OP GROEN' })
      );
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(header); root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      let timer = null, armedAt = 0, status = 'idle', current = null;

      function intro() {
        body.innerHTML = '';
        if (queue.length === 0) return showLeaderboard();
        current = queue.shift();
        U.turnPopup(current, 'JOUW BEURT').then(() => {
          body.appendChild(U.el('div', { class: 'mlt-question center', text: `${current}, tap om te starten` }));
          body.appendChild(U.el('div', { class: 'reactie-stage', text: 'TAP HIER' }));
          const stage = body.querySelector('.reactie-stage');
          stage.addEventListener('pointerdown', () => {
            AudioFX.beep();
            arm(stage);
          }, { once: true });
        });
      }

      function arm(stage) {
        stage.classList.add('armed');
        stage.textContent = 'Wacht...';
        status = 'armed';
        const delay = U.randInt(1000, 5000);
        timer = setTimeout(() => {
          stage.classList.remove('armed');
          stage.classList.add('go');
          stage.textContent = 'NU!';
          armedAt = performance.now();
          status = 'go';
          AudioFX.softBeep();
        }, delay);
        const onTap = () => {
          if (status === 'armed') {
            // too early
            clearTimeout(timer);
            stage.classList.remove('armed');
            stage.classList.add('fail');
            stage.textContent = 'TE VROEG';
            const drink = U.buildDrinkInstruction(4, availableDrinks, intensity);
            results[current].push(99999);
            AudioFX.lose();
            footer.innerHTML = '';
            footer.appendChild(U.el('div', { style: { textAlign: 'center', flex: 1 }, html: `<strong>${current}</strong> ${drink}` }));
            footer.appendChild(U.el('button', {
              class: 'btn small', text: 'OK', onClick: () => { footer.innerHTML = ''; intro(); }
            }));
          } else if (status === 'go') {
            const ms = Math.round(performance.now() - armedAt);
            results[current].push(ms);
            AudioFX.win();
            stage.textContent = `${ms} ms`;
            stage.style.fontSize = '64px';
            footer.innerHTML = '';
            footer.appendChild(U.el('button', {
              class: 'btn full primary', text: 'VOLGENDE',
              onClick: () => { footer.innerHTML = ''; intro(); }
            }));
          }
          stage.removeEventListener('pointerdown', onTap);
        };
        stage.addEventListener('pointerdown', onTap);
      }

      function showLeaderboard() {
        body.innerHTML = '';
        const totals = players.map(p => ({
          name: p,
          best: Math.min(...results[p])
        })).sort((a, b) => b.best - a.best);

        body.appendChild(U.el('div', { class: 'gh-name', style: { textAlign: 'center' }, text: 'EINDSTAND' }));
        const lb = U.el('div', { class: 'reactie-leaderboard' });
        totals.forEach((t, i) => {
          let drink = '';
          if (i === 0) drink = U.buildDrinkInstruction(3, availableDrinks, intensity);
          else if (i === 1) drink = U.buildDrinkInstruction(2, availableDrinks, intensity);
          else if (i === 2) drink = U.buildDrinkInstruction(1, availableDrinks, intensity);
          const row = U.el('div', { class: 'row' },
            U.el('div', { class: 'nm', text: t.name }),
            U.el('div', { class: 'ms', text: t.best === 99999 ? 'TE VROEG' : t.best + ' ms' })
          );
          if (drink) {
            ctx.trackDrink(t.name, i === 0 ? 3 : i === 1 ? 2 : 1);
            row.appendChild(U.el('div', { class: 'ms', style: { color: 'var(--coral-deep)' }, text: drink }));
          }
          lb.appendChild(row);
        });
        body.appendChild(lb);
        footer.innerHTML = '';
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'VOLGENDE RONDE',
          onClick: () => { AudioFX.beep(); ctx.next(); }
        }));
      }

      intro();
      ctx.cleanup = () => { if (timer) clearTimeout(timer); };
    }
  };
})();
