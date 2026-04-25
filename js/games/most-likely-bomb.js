/* KETTINGVRAAG — phone-pass with rotating questions + hidden timer.
 * BoomIt-style: vragen blijven komen elke ~10 sec, geef door, wie hem heeft als de timer afgaat
 * antwoordt zelf op de huidige vraag + drinkt. Iets langer dan de oude variant. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.mostLikelyBomb = {
    id: 'mostLikelyBomb',
    name: 'KETTINGVRAAG',
    desc: 'Vragen blijven komen. Geef door. Wie hem heeft als de tijd op is moet zelf antwoorden + drinkt.',
    howto: [
      'Vragen rouleren elke ~10 seconden.',
      'Geef de telefoon door tijdens het tikken.',
      'Wie hem heeft als de timer afgaat: beantwoord huidige vraag over jezelf + drinkt.'
    ],
    long: true,
    weight: { chill: 0.9, normaal: 1.1, heftig: 1.2 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'KETTINGVRAAG' }),
        U.el('div', { class: 'gh-tag', text: 'GEEF DOOR' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      // Question display (rotating)
      const questionEl = U.el('div', { class: 'kv-question' });
      body.appendChild(questionEl);

      // Bomb visual
      const bomb = U.el('div', { class: 'bomb' },
        U.el('div', { class: 'bomb-circle' }),
        U.el('div', { class: 'bomb-fuse' }),
        U.el('div', { class: 'skull-svg' })
      );
      bomb.querySelector('.skull-svg').innerHTML = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="30" r="18" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/><circle cx="24" cy="28" r="4" fill="var(--ink)"/><circle cx="40" cy="28" r="4" fill="var(--ink)"/><path d="M24 42 L26 38 L30 42 L32 38 L34 42 L38 38 L40 42" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/></svg>';
      body.appendChild(bomb);

      const passLabel = U.el('div', { class: 'kv-pass-label', text: 'GEEF DOOR' });
      body.appendChild(passLabel);

      const totalMs = U.randInt(35000, 55000);   // 35-55 sec — iets langer dan oude versie
      const startedAt = Date.now();
      let currentQuestion = '';
      function rotateQuestion() {
        const tpl = U.pick(window.DOERAK_DATA.mostLikelyTo);
        const [n1, n2] = U.pickTwo(players);
        currentQuestion = U.fillTemplate(tpl, { players, seedNames: { name1: n1, name2: n2 } });
        questionEl.textContent = currentQuestion;
        questionEl.classList.remove('flash');
        void questionEl.offsetWidth;
        questionEl.classList.add('flash');
        AudioFX.softBeep();
      }
      rotateQuestion();
      const rotateInt = setInterval(rotateQuestion, 10000);

      const tInt = setInterval(() => {
        AudioFX.tick();
        const remaining = totalMs - (Date.now() - startedAt);
        if (remaining < 8000) bomb.classList.add('danger');
        if (remaining < 4000) U.shake(root, true, 200);
        if (remaining <= 0) {
          clearInterval(tInt);
          clearInterval(rotateInt);
          AudioFX.boom();
          U.flash('fire');
          U.shake(root, true, 500);
          body.innerHTML = '';
          body.appendChild(U.el('div', { class: 'bomb-result', text: 'BOEM' }));
          body.appendChild(U.el('div', { class: 'kv-question', style: { animation: 'none' }, text: currentQuestion }));
          const drink = U.buildDrinkInstruction(4, availableDrinks, intensity);
          const refuseDrink = U.buildDrinkInstruction(6, availableDrinks, intensity);
          body.appendChild(U.el('div', { class: 'body-card',
            html: `Wie hem nu vasthoudt: <strong>antwoord over jezelf</strong> + ${drink}.<br><span style="font-size:13px;opacity:0.7">Weiger? ${refuseDrink}.</span>` }));
          footer.innerHTML = '';
          footer.appendChild(U.el('button', {
            class: 'btn full primary', text: 'VOLGENDE RONDE',
            onClick: () => ctx.next()
          }));
        }
      }, 1000);

      ctx.cleanup = () => { clearInterval(tInt); clearInterval(rotateInt); };
    }
  };
})();
