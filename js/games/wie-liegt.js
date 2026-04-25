/* WIE LIEGT — twee waarheden en een leugen, klassieker.
 * Random speler bedenkt 3 dingen over zichzelf (2 waar, 1 leugen),
 * vertelt ze hardop. Groep stemt welke de leugen is. */
(function () {
  window.DOERAK_GAMES = window.DOERAK_GAMES || {};
  window.DOERAK_GAMES.wieLiegt = {
    id: 'wieLiegt',
    name: 'WIE LIEGT',
    desc: 'Vertel 3 dingen over jezelf — 2 waar, 1 leugen. Vinden ze de leugen?',
    howto: [
      'Eén speler verzint 3 dingen over zichzelf: 2 waar, 1 niet.',
      'Vertel ze hardop alsof ze allemaal waar zijn.',
      'Groep stemt welke de leugen is. Mis = drinkers drinken.'
    ],
    long: false,
    weight: { chill: 1.0, normaal: 1.1, heftig: 1.0 },

    start(container, ctx) {
      const { players, availableDrinks, intensity } = ctx;
      const target = U.pick(players);

      const root = U.el('div', { class: 'game' });
      root.appendChild(U.el('div', { class: 'game-header' },
        U.el('div', { class: 'gh-name', text: 'WIE LIEGT' }),
        U.el('div', { class: 'gh-tag', text: '2 WAAR, 1 LEUGEN' })
      ));
      const body = U.el('div', { class: 'game-body' });
      const footer = U.el('div', { class: 'game-footer' });
      root.appendChild(body); root.appendChild(footer);
      container.innerHTML = '';
      container.appendChild(root);

      function step1() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'AAN HET WOORD' }));
        body.appendChild(U.el('div', { class: 'pass-name', text: target }));
        body.appendChild(U.el('div', { class: 'body-card',
          html: 'Bedenk 3 dingen over jezelf:<br><strong>2 waar — 1 leugen</strong>.<br>Vertel ze hardop alsof alles waar is.' }));
        footer.appendChild(U.el('button', {
          class: 'btn full primary', text: 'KLAAR — LAAT GROEP STEMMEN',
          onClick: () => step2()
        }));
        U.turnPopup(target, 'GAAT LIEGEN');
      }

      function step2() {
        body.innerHTML = ''; footer.innerHTML = '';
        body.appendChild(U.el('div', { class: 'kicker coral', style: { alignSelf: 'center' }, text: 'WAS HET ECHT GELOGEN?' }));
        body.appendChild(U.el('div', { class: 'body-card',
          html: `Bespreek met de groep welke claim van <strong>${target}</strong> de leugen was.<br>Wie het mis had drinkt.` }));
        const row = U.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' } });
        row.appendChild(U.el('button', {
          class: 'btn mint', text: 'GROEP RAADDE',
          onClick: () => {
            const drink = ctx.drink(target, 3);
            body.innerHTML = '';
            body.appendChild(U.el('div', { class: 'mlt-points', html: `${target} betrapt — ${drink}` }));
            footer.innerHTML = '';
            footer.appendChild(U.el('button', { class: 'btn full primary', text: 'VOLGENDE', onClick: () => ctx.next() }));
          }
        }));
        row.appendChild(U.el('button', {
          class: 'btn danger', text: 'GROEP HAD MIS',
          onClick: () => {
            const drink = U.buildDrinkInstruction(2, availableDrinks, intensity);
            body.innerHTML = '';
            body.appendChild(U.el('div', { class: 'body-card',
              html: `<strong>${target}</strong> wint! Iedereen behalve ${target} ${drink}` }));
            players.forEach(p => { if (p !== target) ctx.trackDrink(p, 2); });
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
