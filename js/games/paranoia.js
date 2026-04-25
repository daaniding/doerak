/* Paranoia — secret question, answer aloud. Group can ask "what was the question?". */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.paranoia = {
    id: 'paranoia',
    name: 'PARANOIA',
    desc: 'Eén ziet de vraag, antwoordt hardop met een naam. Wie wil weten wat de vraag was, drinkt.',
    long: false,
    weight: { chill: 1.0, normaal: 1.1, heftig: 1.2 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const target = U.pick(players);
      const tpl = U.pick(window.DOERAK_DATA.paranoia);
      const question = U.fillTemplate(tpl, { players });

      const root = U.el('div', { class: 'game' });
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'PARANOIA' }),
        U.el('div', { class: 'gh-tag', text: 'PSYCHOLOGISCHE WAR' })
      ));
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      // Step 1: hand to target
      function step1() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'kicker', text: 'GEEF DE TELEFOON AAN' }));
        body.appendChild(U.el('div', { class: 'sociale-reason', text: target }));
        body.appendChild(U.el('div', { class: 'paranoia-question', style: { fontSize: '15px', color: 'var(--ink-bone-dim)', textAlign: 'center', marginTop: '24px' },
          text: 'Lees de vraag in stilte, zeg je antwoord (een naam) hardop. Niemand mag de vraag horen.' }));
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'IK BEN ' + target,
          onClick: () => { AudioFX.beep(); step2(); }
        }));
      }

      function step2() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'paranoia-question', text: question }));
        body.appendChild(U.el('div', { class: 'gh-tag', style: { color: 'var(--ink-cyan)', textAlign: 'center', marginTop: '24px' },
          text: 'ZEG JE ANTWOORD HARDOP — NOG NIET DOORKLIKKEN' }));
        footer.appendChild(U.el('button', {
          class: 'btn full', text: 'GEZEGD',
          onClick: () => step3()
        }));
      }

      function step3() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'gh-name', style: { textAlign: 'center' }, text: 'WIL IEMAND DE VRAAG WETEN?' }));
        const drinkAsk = U.buildDrinkInstruction(3, availableDrinks, intensity);
        const drinkNamed = U.buildDrinkInstruction(2, availableDrinks, intensity);
        body.appendChild(U.el('div', { class: 'sociale-reason',
          html: `<strong>JA</strong>: vraag wordt geopenbaard. Vragensteller ${drinkAsk}.<br><strong>NEE</strong>: de genoemde persoon ${drinkNamed}.` }));
        const row = U.el('div', { class: 'row', style: { gap: '8px', justifyContent: 'stretch' } });
        row.appendChild(U.el('button', {
          class: 'btn full danger', text: 'JA, ONTHUL',
          onClick: () => {
            body.innerHTML = '';
            body.appendChild(U.el('div', { class: 'kicker orange', text: 'DE VRAAG WAS' }));
            body.appendChild(U.el('div', { class: 'paranoia-question', text: question }));
            body.appendChild(U.el('div', { class: 'mlt-points', html: `Vragensteller ${drinkAsk}` }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
            AudioFX.reveal(); U.flash('fire');
          }
        }));
        row.appendChild(U.el('button', {
          class: 'btn full cyan', text: 'NEE, LATEN',
          onClick: () => {
            body.innerHTML = '';
            body.appendChild(U.el('div', { class: 'kicker', text: 'DE GENOEMDE PERSOON' }));
            body.appendChild(U.el('div', { class: 'mlt-points', html: drinkNamed }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full', text: 'VOLGENDE RONDE', onClick: () => ctx.next() }));
            AudioFX.softBeep();
          }
        }));
        footer.appendChild(row);
      }

      step1();
    }
  };
})();
