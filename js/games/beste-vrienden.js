/* BESTE VRIENDEN — partner trivia. Twee spelers gelot.
 * Speler A krijgt vraag over Speler B, geeft antwoord, B beoordeelt.
 * Mis = beide drinken. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.besteVrienden = {
    id: 'besteVrienden',
    name: 'BESTE VRIENDEN',
    desc: 'Hoe goed ken je je vrienden? Eén vraag, één antwoord — de ander beoordeelt.',
    howto: [
      'Twee spelers worden geloot.',
      'Speler A krijgt een vraag over Speler B.',
      'B beoordeelt: goed = niemand drinkt. Mis = beide drinken.'
    ],
    long: false,
    weight: { chill: 1.0, normaal: 1.1, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const [a, b] = U.pickTwo(players);
      const question = U.pick(window.DOERAK_DATA.besteVrienden);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'BESTE VRIENDEN' }),
        U.el('div', { class: 'gh-tag', text: 'KEN ELKAAR' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      function step1() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'DUO VAN DE RONDE' }));
        body.appendChild(U.el('div', { class: 'buddy-pair' },
          U.el('div', { class: 'b', text: a }),
          U.el('div', { class: 'plus', text: '×' }),
          U.el('div', { class: 'b', text: b })
        ));
        body.appendChild(U.el('div', { class: 'body-card',
          html: `<strong>${a}</strong> krijgt een vraag over <strong>${b}</strong>.<br>${b} beoordeelt of het klopt.` }));
        footer.appendChild(U.el('button', {
          class: 'btn full primary', text: 'TOON DE VRAAG',
          onClick: () => step2()
        }));
        U.turnPopup(a, 'KRIJGT EEN VRAAG');
      }

      function step2() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: a + ' ANTWOORDT OVER ' + b }));
        const filledQ = question.replace(/\{\{name\}\}/g, b);
        body.appendChild(U.el('div', { class: 'mlt-question', text: filledQ }));
        body.appendChild(U.el('div', { class: 'body-card', text: a + ' geeft een antwoord. Daarna beoordeelt ' + b + '.' }));
        footer.appendChild(U.el('button', {
          class: 'btn full primary', text: a + ' HEEFT GEANTWOORD',
          onClick: () => step3(filledQ)
        }));
      }

      function step3(filledQ) {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: b + ' BEOORDEELT' }));
        body.appendChild(U.el('div', { class: 'mlt-question', text: filledQ }));
        body.appendChild(U.el('div', { class: 'body-card', text: 'Was ' + a + ' z\'n antwoord goed?' }));
        const row = U.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' } });
        row.appendChild(U.el('button', {
          class: 'btn mint', text: 'GOED',
          onClick: () => {
            body.innerHTML = '';
            body.appendChild(U.el('div', { class: 'mlt-points', html: 'Niemand drinkt — ' + a + ' kent ' + b + ' echt!' }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full primary', text: 'VOLGENDE', onClick: () => ctx.next() }));
          }
        }));
        row.appendChild(U.el('button', {
          class: 'btn danger', text: 'NIET GOED',
          onClick: () => {
            const drink = ctx.drink(a, 3);
            ctx.trackDrink(b, 3);
            body.innerHTML = '';
            body.appendChild(U.el('div', { class: 'mlt-points', html: `Beide ${drink}` }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full primary', text: 'VOLGENDE', onClick: () => ctx.next() }));
          }
        }));
        footer.appendChild(row);
      }

      step1();
    }
  };
})();
