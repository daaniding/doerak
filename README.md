# DOERAK

> Drinkspel voor avonden die ontsporen.

DOERAK is een complete, single-page drinkspel-app voor 3-10 vrienden. 20 minigames, slimme drank-instructies die zich aanpassen aan wat je hebt staan (bier, wijn, sterk of een combinatie), en een esthetiek die op een laat avond op een telefoon op tafel hoort: late-night risograph club flyer — bleeding cyan + flame-orange op warm off-black, halftone grain, misregistered type, rubber-stamped slabs.

## Live spelen

→ **<https://daaniding.github.io/doerak/>** *(GitHub Pages — actief zodra deze branch op main staat)*

Open de URL op je telefoon. Tik. Drink. Met maten.

## Hoe te spelen

1. **Welkom** → tap "NIEUW SPEL".
2. **Setup** (4 stappen)
   - Spelers — 3 t/m 10 namen.
   - Drank — vink aan wat er op tafel staat: BIER, WIJN, STERK (kies meerdere — alle drink-instructies passen zich aan).
   - Duur — 30 min / 1 uur / 2 uur / hele avond.
   - Intensiteit — Chill (×0.7) / Normaal (×1.0) / Heftig (×1.4).
3. **Voorspelling** — geef de telefoon door, iedereen gokt anoniem wie het meest dronken wordt.
4. **Zitplaatsen** — willekeurige zitvolgorde, sommige games gebruiken je buren.
5. **Game loop** — slot machine kiest steeds een nieuwe minigame. Actieve regels van 21 en Regel Roulette blijven boven in beeld.
6. **Eindscherm** — wie werd écht het meest dronken? Wel of niet correct voorspeld? Wie het mis had drinkt extra.

Alles draait lokaal in je browser. Geen account, geen tracker, geen back-end. Refreshen overleeft de sessie via LocalStorage.

## De 20 games

Tijdsbom · Reactietest · Most Likely To · Most Likely + Tijdsbom · Imposter Woord · Paranoia · Drunk-ocracy · Hot Seat · 21 + Regel Tracker · Buzz · Categorie Timer · Waterval · Blinde Keuze · Regel Roulette · Buddy System · Saboteur · Sociale · Dubbel Pech · Uitdelen · Guess in 5

## Drank-systeem

Elke game roept `buildDrinkInstruction(baseAmount, availableDrinks, intensity)` aan — geen hardcoded "drink 3 slokken" ergens.

| Setup | Voorbeeld output (base=4) |
|---|---|
| Alleen bier | `drink 4 slokken bier` |
| Alleen wijn | `drink 4 slokken wijn` (cap 5) |
| Alleen sterk | `neem 2 teugjes sterk` (×0.6 reductie eerst) |
| Bier + sterk | `drink 4 slokken bier OF neem een teugje sterk` |
| Wijn + sterk | `drink 4 slokken wijn OF neem een teugje sterk` |
| Bier + wijn | `drink 4 slokken (bier of wijn)` |
| Bier + wijn + sterk | `drink 4 slokken bier/wijn OF neem een teugje sterk` |

Caps: max 8 slokken bier, 5 slokken wijn, 2 shots (alleen op heftig). Sterk-only krijgt vooraf een ×0.6 multiplier — niemand wordt gesloopt.

## Tech

Vanilla HTML / CSS / JS. Geen frameworks, geen build, geen npm-deps voor de app zelf (puppeteer alleen voor lokale screenshots).

```
index.html
css/main.css        → design tokens, base, riso effects
css/screens.css     → per-screen layout
css/games.css       → per-minigame styling
js/app.js           → screen routing, state, game loop
js/games.js         → game registry, slot machine, picker
js/games/*.js       → 20 minigames, één per file
js/utils.js         → buildDrinkInstruction + helpers
js/audio.js         → Web Audio engine, alle SFX in code gegenereerd
js/storage.js       → LocalStorage wrapper
data/questions.js   → 425+ pieces of content
service-worker.js   → cache-first offline na eerste load
serve.mjs           → tiny dev server (node serve.mjs)
screenshot.mjs      → puppeteer helper
```

## Lokaal draaien

```bash
node serve.mjs
# open http://localhost:3000
```

## Design

Aesthetic: **late-night risograph club flyer**.
- Bleeding cyan (#00d4e6) + flame-orange (#ff5a1f) op warm off-black (#0e0a08)
- Misregistered display-type: Anton + Bebas Neue, met cyan/oranje ghost-offset
- Halftone dot field + SVG noise grain over alles
- Rubber-stamped buttons met layered offset-shadows i.p.v. zachte schaduw
- Geen Inter, geen Roboto, geen system fonts. Geen indigo. Geen flat material.

## Aandachtspunten

- 18+ inhoud. Speel met maten. Werkt offline na eerste load.
- Mobile-first, getest op 375×667 / 390×844 / 412×915.
- Audio unlockt op de eerste tap (browser autoplay policy).
- LocalStorage maakt refreshen veilig — staat blijft staan.

## Licensing

MIT. Doerak attribution graag.
