/* DOERAK — custom SVG icon library.
 * One unified style: bold ink outlines, cream/coral/yellow/mint fills.
 * Mascot + per-game illustrations + utility glyphs.
 * All viewBox 0 0 64 64 unless noted; scale via container width/height. */
(function (global) {

  /* ---- Mascot variants for different game moments ---- */
  const mascotDrunk = () => `<svg class="icon mascot" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="68" rx="42" ry="38" fill="var(--ink)"/>
    <path d="M22 38 L18 14 L42 30 Z" fill="var(--ink)"/>
    <path d="M98 38 L102 18 L78 30 Z" fill="var(--ink)"/>
    <path d="M28 30 L24 18 L36 28 Z" fill="var(--purple)"/>
    <path d="M92 30 L96 20 L84 28 Z" fill="var(--purple)"/>
    <ellipse cx="34" cy="80" rx="9" ry="5" fill="var(--coral)" opacity="0.7"/>
    <ellipse cx="86" cy="80" rx="9" ry="5" fill="var(--coral)" opacity="0.7"/>
    <path d="M42 62 Q46 58 50 62 Q46 66 42 62" stroke="var(--cream)" stroke-width="2.5" fill="none"/>
    <path d="M70 62 Q74 58 78 62 Q74 66 70 62" stroke="var(--cream)" stroke-width="2.5" fill="none"/>
    <path d="M56 74 L64 74 L60 80 Z" fill="var(--coral)" stroke="var(--ink)" stroke-width="1.5"/>
    <path d="M48 86 Q56 92 60 86 Q64 92 72 86" stroke="var(--cream)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="92" rx="4" ry="3" fill="var(--coral)"/>
  </svg>`;

  const mascotSurprised = () => `<svg class="icon mascot" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="68" rx="42" ry="38" fill="var(--ink)"/>
    <path d="M22 38 L14 6 L42 28 Z" fill="var(--ink)"/>
    <path d="M98 38 L106 6 L78 28 Z" fill="var(--ink)"/>
    <path d="M26 28 L22 14 L36 26 Z" fill="var(--coral)"/>
    <path d="M94 28 L98 14 L84 26 Z" fill="var(--coral)"/>
    <ellipse cx="34" cy="78" rx="8" ry="5" fill="var(--coral)" opacity="0.55"/>
    <ellipse cx="86" cy="78" rx="8" ry="5" fill="var(--coral)" opacity="0.55"/>
    <circle cx="46" cy="60" r="11" fill="var(--cream)"/>
    <circle cx="48" cy="61" r="5" fill="var(--ink)"/>
    <circle cx="74" cy="60" r="11" fill="var(--cream)"/>
    <circle cx="76" cy="61" r="5" fill="var(--ink)"/>
    <path d="M56 76 L64 76 L60 82 Z" fill="var(--coral)" stroke="var(--ink)" stroke-width="1.5"/>
    <ellipse cx="60" cy="90" rx="5" ry="6" fill="var(--ink-soft)" stroke="var(--cream)" stroke-width="2.5"/>
  </svg>`;

  /* ---- Mascot: DOERAK the cheeky cat (default expression) ----
   * - round head, two triangle ears (one slightly drooped)
   * - one eye open wide, one squinted (drunk wobble)
   * - nose, small smirk + tongue out
   * - whiskers, blushed cheeks
   * - color args customize fur tone */
  const mascot = (opts = {}) => {
    const fur = opts.fur || 'var(--ink)';        // body
    const inner = opts.inner || 'var(--coral)';   // ear inside / nose / cheeks
    const eye = opts.eye || 'var(--cream)';
    const tongue = opts.tongue || 'var(--coral)';
    return `<svg class="icon mascot" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- ears -->
      <path d="M22 38 L18 14 L42 30 Z" fill="${fur}" stroke="${fur}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M98 38 L102 18 L78 30 Z" fill="${fur}" stroke="${fur}" stroke-width="3" stroke-linejoin="round"/>
      <!-- inner ears -->
      <path d="M28 30 L24 18 L36 28 Z" fill="${inner}"/>
      <path d="M92 30 L96 20 L84 28 Z" fill="${inner}"/>
      <!-- head (round) -->
      <ellipse cx="60" cy="68" rx="42" ry="38" fill="${fur}"/>
      <!-- cheek blush -->
      <ellipse cx="34" cy="78" rx="8" ry="5" fill="${inner}" opacity="0.55"/>
      <ellipse cx="86" cy="78" rx="8" ry="5" fill="${inner}" opacity="0.55"/>
      <!-- left eye open -->
      <circle cx="46" cy="62" r="9" fill="${eye}"/>
      <circle cx="48" cy="63" r="4.5" fill="${fur}"/>
      <circle cx="49.5" cy="61.5" r="1.5" fill="${eye}"/>
      <!-- right eye squinted -->
      <path d="M68 62 Q74 67 80 62" stroke="${eye}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- nose -->
      <path d="M56 74 L64 74 L60 80 Z" fill="${inner}" stroke="${fur}" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- mouth + tongue -->
      <path d="M60 80 Q56 86 50 84" stroke="${eye}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M60 80 Q64 86 70 84" stroke="${eye}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="56" cy="86" rx="3" ry="2" fill="${tongue}"/>
      <!-- whiskers -->
      <line x1="14" y1="72" x2="32" y2="72" stroke="${eye}" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="78" x2="32" y2="76" stroke="${eye}" stroke-width="2" stroke-linecap="round"/>
      <line x1="106" y1="72" x2="88" y2="72" stroke="${eye}" stroke-width="2" stroke-linecap="round"/>
      <line x1="104" y1="78" x2="88" y2="76" stroke="${eye}" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  };

  /* Reusable per-game icon shell — all 64x64, ink stroke, varied fills */
  const wrap = (innerSVG, vb = '0 0 64 64', cls = 'icon game-icon') =>
    `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${innerSVG}</svg>`;

  const game = {
    /* 💣 Tijdsbom — bomb body + spark fuse */
    tijdsbom: () => wrap(`
      <circle cx="32" cy="38" r="20" fill="var(--ink)" stroke="var(--ink)" stroke-width="3"/>
      <rect x="29" y="14" width="6" height="10" fill="var(--ink)"/>
      <path d="M35 18 Q44 14 48 8" stroke="var(--coral-deep)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="49" cy="6" r="5" fill="var(--yellow)"/>
      <circle cx="49" cy="6" r="2" fill="var(--coral)"/>
      <circle cx="22" cy="32" r="4" fill="var(--cream)" opacity="0.5"/>
    `),

    /* ⚡ Reactietest — lightning bolt */
    reactietest: () => wrap(`
      <path d="M36 6 L18 36 L30 36 L26 58 L46 28 L34 28 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
    `),

    /* 👉 Most Likely To — pointing hand */
    mostLikelyTo: () => wrap(`
      <path d="M16 24 L16 42 Q16 50 24 50 L46 50 Q54 50 54 42 L54 32 L42 32 L42 24 L34 24 L34 18 Q34 12 28 12 Q22 12 22 18 L22 32 L16 32 Z"
        fill="var(--coral)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <line x1="32" y1="32" x2="32" y2="46" stroke="var(--ink)" stroke-width="2" opacity="0.4"/>
    `),

    /* Most Likely + Bomb */
    mostLikelyBomb: () => wrap(`
      <circle cx="20" cy="42" r="14" fill="var(--ink)" stroke="var(--ink)" stroke-width="3"/>
      <rect x="17" y="22" width="6" height="8" fill="var(--ink)"/>
      <circle cx="28" cy="14" r="4" fill="var(--yellow)"/>
      <path d="M40 28 L40 46 Q40 52 46 52 L56 52 Q60 52 60 46 L60 38 L52 38 L52 28 Z"
        fill="var(--coral)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
    `),

    /* 🕵️ Imposter — magnifying glass */
    imposter: () => wrap(`
      <circle cx="26" cy="26" r="14" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
      <circle cx="26" cy="26" r="7" fill="var(--mint)" opacity="0.5"/>
      <line x1="36" y1="36" x2="54" y2="54" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
      <circle cx="22" cy="22" r="2.5" fill="var(--ink)"/>
      <circle cx="30" cy="22" r="2.5" fill="var(--ink)"/>
    `),

    /* 🤫 Paranoia — shushing finger over lips */
    paranoia: () => wrap(`
      <circle cx="32" cy="32" r="22" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
      <path d="M22 28 Q22 22 28 22 L36 22 Q42 22 42 28" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="32" cy="38" rx="8" ry="3" fill="var(--coral)" stroke="var(--ink)" stroke-width="2.5"/>
      <line x1="32" y1="14" x2="32" y2="44" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="14" r="2.5" fill="var(--ink)"/>
    `),

    /* 🗳️ Drunk-ocracy — ballot box */
    drunkocracy: () => wrap(`
      <rect x="10" y="22" width="44" height="34" fill="var(--coral)" stroke="var(--ink)" stroke-width="3" rx="3"/>
      <rect x="20" y="18" width="24" height="6" fill="var(--ink)"/>
      <rect x="22" y="6" width="20" height="14" fill="var(--cream)" stroke="var(--ink)" stroke-width="3" rx="2"/>
      <line x1="26" y1="11" x2="38" y2="11" stroke="var(--ink)" stroke-width="2"/>
      <line x1="26" y1="15" x2="38" y2="15" stroke="var(--ink)" stroke-width="2"/>
      <line x1="32" y1="34" x2="32" y2="50" stroke="var(--cream)" stroke-width="2.5"/>
    `),

    /* 🔥 Hot Seat — chair with flames */
    hotSeat: () => wrap(`
      <path d="M22 50 L22 38 L42 38 L42 50" fill="var(--coral)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <rect x="20" y="46" width="24" height="6" fill="var(--ink)" rx="1"/>
      <rect x="22" y="50" width="3" height="8" fill="var(--ink)"/>
      <rect x="39" y="50" width="3" height="8" fill="var(--ink)"/>
      <path d="M30 38 Q24 26 28 18 Q30 24 32 22 Q32 14 38 12 Q34 22 40 24 Q44 18 46 22 Q44 30 36 38 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
    `),

    /* 21 — number 21 */
    twentyone: () => wrap(`
      <rect x="8" y="14" width="48" height="36" fill="var(--cream)" stroke="var(--ink)" stroke-width="3" rx="6"/>
      <text x="32" y="42" text-anchor="middle" font-family="Bowlby One, sans-serif" font-size="22" fill="var(--coral)">21</text>
    `),

    /* 🐝 Buzz — bee */
    buzz: () => wrap(`
      <ellipse cx="32" cy="36" rx="18" ry="14" fill="var(--yellow)" stroke="var(--ink)" stroke-width="3"/>
      <path d="M22 30 L22 42 M30 26 L30 46 M38 26 L38 46" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="22" cy="22" rx="8" ry="6" fill="var(--cream)" stroke="var(--ink)" stroke-width="2.5"/>
      <ellipse cx="42" cy="22" rx="8" ry="6" fill="var(--cream)" stroke="var(--ink)" stroke-width="2.5"/>
      <circle cx="44" cy="32" r="2" fill="var(--ink)"/>
      <circle cx="20" cy="32" r="2" fill="var(--ink)"/>
    `),

    /* ⏳ Categorie Timer — hourglass */
    categorieTimer: () => wrap(`
      <rect x="14" y="6" width="36" height="4" fill="var(--ink)"/>
      <rect x="14" y="54" width="36" height="4" fill="var(--ink)"/>
      <path d="M16 10 L48 10 L36 32 L48 54 L16 54 L28 32 Z" fill="var(--cream)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 14 L44 14 L34 30 L30 30 Z" fill="var(--coral)"/>
      <path d="M28 50 L36 50 L33 38 L31 38 Z" fill="var(--coral)"/>
    `),

    /* 🌊 Waterval — wave */
    waterval: () => wrap(`
      <path d="M4 40 Q14 30 24 40 T44 40 T60 40 L60 56 L4 56 Z" fill="var(--sky)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M8 30 Q18 20 28 30 T48 30" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M12 18 Q22 10 32 18 T52 18" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
    `),

    /* 🚪 Blinde Keuze — three doors */
    blindeKeuze: () => wrap(`
      <rect x="6" y="14" width="14" height="40" fill="var(--cream)" stroke="var(--ink)" stroke-width="3" rx="2"/>
      <rect x="25" y="14" width="14" height="40" fill="var(--coral)" stroke="var(--ink)" stroke-width="3" rx="2"/>
      <rect x="44" y="14" width="14" height="40" fill="var(--mint)" stroke="var(--ink)" stroke-width="3" rx="2"/>
      <circle cx="16" cy="36" r="1.5" fill="var(--ink)"/>
      <circle cx="35" cy="36" r="1.5" fill="var(--ink)"/>
      <circle cx="54" cy="36" r="1.5" fill="var(--ink)"/>
    `),

    /* 🎡 Regel Roulette — pie wheel */
    regelRoulette: () => wrap(`
      <circle cx="32" cy="34" r="22" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
      <path d="M32 12 L32 34 L51 23 Z" fill="var(--coral)"/>
      <path d="M51 23 L32 34 L51 45 Z" fill="var(--yellow)"/>
      <path d="M51 45 L32 34 L32 56 Z" fill="var(--mint)"/>
      <path d="M32 56 L32 34 L13 45 Z" fill="var(--sky)"/>
      <path d="M13 45 L32 34 L13 23 Z" fill="var(--coral-soft)"/>
      <path d="M13 23 L32 34 L32 12 Z" fill="var(--yellow-soft)"/>
      <circle cx="32" cy="34" r="4" fill="var(--ink)"/>
      <path d="M32 4 L28 12 L36 12 Z" fill="var(--ink)"/>
    `),

    /* 👯 Buddy — two heads side by side */
    buddy: () => wrap(`
      <circle cx="22" cy="28" r="14" fill="var(--coral)" stroke="var(--ink)" stroke-width="3"/>
      <circle cx="42" cy="28" r="14" fill="var(--mint)" stroke="var(--ink)" stroke-width="3"/>
      <circle cx="18" cy="26" r="2" fill="var(--ink)"/>
      <circle cx="26" cy="26" r="2" fill="var(--ink)"/>
      <circle cx="38" cy="26" r="2" fill="var(--ink)"/>
      <circle cx="46" cy="26" r="2" fill="var(--ink)"/>
      <path d="M18 32 Q22 36 26 32" stroke="var(--ink)" stroke-width="2" fill="none"/>
      <path d="M38 32 Q42 36 46 32" stroke="var(--ink)" stroke-width="2" fill="none"/>
      <path d="M28 50 Q32 46 36 50" stroke="var(--ink)" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),

    /* 😈 Saboteur — devil mask */
    saboteur: () => wrap(`
      <path d="M32 6 L20 18 L8 14 L14 28 Q14 48 32 56 Q50 48 50 28 L56 14 L44 18 Z"
        fill="var(--coral-deep)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="24" cy="30" rx="4" ry="3" fill="var(--yellow)"/>
      <ellipse cx="40" cy="30" rx="4" ry="3" fill="var(--yellow)"/>
      <circle cx="24" cy="30" r="1.5" fill="var(--ink)"/>
      <circle cx="40" cy="30" r="1.5" fill="var(--ink)"/>
      <path d="M22 42 Q32 36 42 42" stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `),

    /* 🍻 Sociale — clinking glasses */
    sociale: () => wrap(`
      <path d="M14 10 L24 10 L24 32 Q24 42 18 42 L20 50 L14 50 Q10 42 12 32 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 10 L50 10 L52 32 Q54 42 48 42 L46 50 L40 50 Q34 42 38 32 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 6 L18 14 L26 14 Z" fill="var(--cream)" stroke="var(--ink)" stroke-width="2"/>
      <path d="M40 6 L38 14 L46 14 Z" fill="var(--cream)" stroke="var(--ink)" stroke-width="2"/>
      <path d="M28 22 L36 22" stroke="var(--coral)" stroke-width="3" stroke-linecap="round"/>
    `),

    /* ✌️ Dubbel Pech — two dice */
    dubbelPech: () => wrap(`
      <rect x="6" y="20" width="22" height="22" fill="var(--coral)" stroke="var(--ink)" stroke-width="3" rx="3" transform="rotate(-8 17 31)"/>
      <rect x="34" y="22" width="24" height="24" fill="var(--mint)" stroke="var(--ink)" stroke-width="3" rx="3" transform="rotate(6 46 34)"/>
      <circle cx="13" cy="27" r="2" fill="var(--ink)" transform="rotate(-8 17 31)"/>
      <circle cx="22" cy="35" r="2" fill="var(--ink)" transform="rotate(-8 17 31)"/>
      <circle cx="42" cy="29" r="2" fill="var(--ink)" transform="rotate(6 46 34)"/>
      <circle cx="50" cy="36" r="2" fill="var(--ink)" transform="rotate(6 46 34)"/>
      <circle cx="46" cy="40" r="2" fill="var(--ink)" transform="rotate(6 46 34)"/>
    `),

    /* 🎁 Uitdelen — gift box */
    uitdelen: () => wrap(`
      <rect x="8" y="22" width="48" height="32" fill="var(--coral)" stroke="var(--ink)" stroke-width="3" rx="2"/>
      <rect x="6" y="18" width="52" height="10" fill="var(--cream)" stroke="var(--ink)" stroke-width="3" rx="2"/>
      <rect x="28" y="18" width="8" height="36" fill="var(--mint)" stroke="var(--ink)" stroke-width="3"/>
      <path d="M28 18 Q22 10 18 12 Q14 16 20 22 Q24 22 28 22"
        fill="var(--mint)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M36 18 Q42 10 46 12 Q50 16 44 22 Q40 22 36 22"
        fill="var(--mint)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
    `),

    /* 🎯 Guess in 5 — target */
    guess5: () => wrap(`
      <circle cx="32" cy="32" r="26" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
      <circle cx="32" cy="32" r="18" fill="var(--coral)" stroke="var(--ink)" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="10" fill="var(--cream)" stroke="var(--ink)" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="4" fill="var(--coral-deep)"/>
      <line x1="44" y1="20" x2="56" y2="8" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
      <path d="M56 8 L52 14 L58 12 Z" fill="var(--ink)"/>
    `),

    /* ⚡ Snel Antwoord — speech bubble + lightning */
    snelAntwoord: () => wrap(`
      <path d="M8 14 L52 14 Q56 14 56 18 L56 38 Q56 42 52 42 L24 42 L14 52 L16 42 L12 42 Q8 42 8 38 Z"
        fill="var(--mint)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M34 18 L24 30 L30 30 L28 40 L40 26 L34 26 L36 18 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
    `),

    /* 🤥 Wie Liegt — Pinocchio nose / mask */
    wieLiegt: () => wrap(`
      <path d="M12 18 L52 18 L48 32 Q48 44 32 50 Q16 44 16 32 Z"
        fill="var(--coral)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="22" cy="28" rx="5" ry="3" fill="var(--cream)" stroke="var(--ink)" stroke-width="2.5"/>
      <ellipse cx="42" cy="28" rx="5" ry="3" fill="var(--cream)" stroke="var(--ink)" stroke-width="2.5"/>
      <circle cx="22" cy="28" r="1.5" fill="var(--ink)"/>
      <circle cx="42" cy="28" r="1.5" fill="var(--ink)"/>
      <path d="M30 36 L52 28 L52 32 L30 40 Z" fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
    `),

    /* 🤝 Beste Vrienden — handshake */
    besteVrienden: () => wrap(`
      <path d="M6 36 L20 22 Q24 18 28 22 L34 28 Q38 32 34 36 L26 44 Q22 48 18 44 Z"
        fill="var(--coral)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M58 36 L44 22 Q40 18 36 22 L30 28 Q26 32 30 36 L38 44 Q42 48 46 44 Z"
        fill="var(--mint)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="3" fill="var(--yellow)" stroke="var(--ink)" stroke-width="2"/>
    `)
  };

  /* Drink type icons (used in setup) */
  const drink = {
    bier: () => wrap(`
      <path d="M16 18 L46 18 L44 56 Q44 60 40 60 L22 60 Q18 60 18 56 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M46 24 L54 24 Q58 24 58 28 L58 44 Q58 48 54 48 L46 48 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="31" cy="20" rx="14" ry="6" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
      <circle cx="22" cy="16" r="3" fill="var(--cream)" stroke="var(--ink)" stroke-width="2"/>
      <circle cx="32" cy="14" r="4" fill="var(--cream)" stroke="var(--ink)" stroke-width="2"/>
      <circle cx="40" cy="16" r="3" fill="var(--cream)" stroke="var(--ink)" stroke-width="2"/>
    `),
    wijn: () => wrap(`
      <path d="M22 8 L42 8 Q42 26 32 32 Q22 26 22 8 Z"
        fill="var(--coral-deep)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <line x1="32" y1="32" x2="32" y2="50" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="32" cy="54" rx="14" ry="3" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
    `),
    sterk: () => wrap(`
      <path d="M16 16 L48 16 L46 28 L44 56 Q44 60 40 60 L24 60 Q20 60 20 56 L18 28 Z"
        fill="var(--coral)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <line x1="18" y1="28" x2="46" y2="28" stroke="var(--ink)" stroke-width="2.5"/>
      <ellipse cx="32" cy="16" rx="16" ry="3" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
    `)
  };

  /* Utility / nav icons */
  const ui = {
    pause: () => wrap(`
      <line x1="22" y1="14" x2="22" y2="50" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
      <line x1="42" y1="14" x2="42" y2="50" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
    `, '0 0 64 64', 'icon ui-icon'),
    play: () => wrap(`
      <path d="M16 12 L52 32 L16 52 Z" fill="var(--ink)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
    `, '0 0 64 64', 'icon ui-icon'),
    arrow: () => wrap(`
      <line x1="12" y1="32" x2="48" y2="32" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>
      <path d="M40 22 L52 32 L40 42" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    `, '0 0 64 64', 'icon ui-icon'),
    arrowBack: () => wrap(`
      <line x1="16" y1="32" x2="52" y2="32" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>
      <path d="M24 22 L12 32 L24 42" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    `, '0 0 64 64', 'icon ui-icon'),
    plus: () => wrap(`
      <line x1="32" y1="14" x2="32" y2="50" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
      <line x1="14" y1="32" x2="50" y2="32" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
    `, '0 0 64 64', 'icon ui-icon'),
    check: () => wrap(`
      <path d="M14 34 L26 46 L52 18" fill="none" stroke="var(--ink)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    `, '0 0 64 64', 'icon ui-icon'),
    star: () => wrap(`
      <path d="M32 6 L40 24 L60 26 L44 38 L50 58 L32 48 L14 58 L20 38 L4 26 L24 24 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
    `, '0 0 64 64', 'icon ui-icon'),
    trophy: () => wrap(`
      <path d="M16 12 L48 12 L46 36 Q46 44 32 46 Q18 44 18 36 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M16 18 L8 18 Q4 18 4 22 L4 28 Q4 32 12 34" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
      <path d="M48 18 L56 18 Q60 18 60 22 L60 28 Q60 32 52 34" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
      <rect x="26" y="46" width="12" height="6" fill="var(--coral)" stroke="var(--ink)" stroke-width="3"/>
      <rect x="20" y="52" width="24" height="6" fill="var(--ink)"/>
    `, '0 0 64 64', 'icon ui-icon')
  };

  /* Decorative party objects floating on welcome */
  const deco = {
    bottle: () => wrap(`
      <rect x="22" y="6" width="20" height="14" fill="var(--coral-deep)" stroke="var(--ink)" stroke-width="3"/>
      <rect x="20" y="20" width="24" height="38" fill="var(--mint)" stroke="var(--ink)" stroke-width="3" rx="3"/>
      <rect x="22" y="32" width="20" height="14" fill="var(--cream)" stroke="var(--ink)" stroke-width="2"/>
      <text x="32" y="42" text-anchor="middle" font-family="Bowlby One,sans-serif" font-size="7" fill="var(--ink)">DKR</text>
    `),
    cup: () => wrap(`
      <path d="M14 16 L50 16 L46 56 Q46 60 42 60 L22 60 Q18 60 18 56 Z"
        fill="var(--coral)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="32" cy="16" rx="18" ry="4" fill="var(--cream)" stroke="var(--ink)" stroke-width="3"/>
      <line x1="22" y1="16" x2="20" y2="56" stroke="var(--cream)" stroke-width="2.5" opacity="0.5"/>
    `),
    confetti: () => wrap(`
      <rect x="12" y="10" width="8" height="3" fill="var(--coral)" transform="rotate(20 16 11)"/>
      <rect x="40" y="14" width="8" height="3" fill="var(--yellow)" transform="rotate(-30 44 15)"/>
      <rect x="50" y="32" width="8" height="3" fill="var(--mint)" transform="rotate(60 54 33)"/>
      <rect x="14" y="36" width="8" height="3" fill="var(--sky)" transform="rotate(-15 18 37)"/>
      <rect x="28" y="48" width="8" height="3" fill="var(--coral)" transform="rotate(45 32 49)"/>
      <circle cx="20" cy="22" r="3" fill="var(--yellow)"/>
      <circle cx="46" cy="46" r="3" fill="var(--coral)"/>
    `),
    sparkle: () => wrap(`
      <path d="M32 8 L36 28 L56 32 L36 36 L32 56 L28 36 L8 32 L28 28 Z"
        fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
    `)
  };

  global.DOERAK_ICONS = { mascot, mascotDrunk, mascotSurprised, game, drink, ui, deco };
})(window);
