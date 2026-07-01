# SOWILO Dimensionare

**Generator de dimensionare instalații + memoriu tehnic, pornind de la date minime de clădire.**
Construit pentru proiectanți de instalații (PSI), calibrat pe memorii tehnice reale (Hotel Sinaia).

Modulul curent: **Stingere incendiu** (sprinklere, hidranți interiori/exteriori, rezervă intangibilă, grup pompare), conform **P118/1:2025, P118/2-2013 mod. 2018, NP 127:2009, SR EN 12845**.

## Ce face acum (funcțional, fără server)

- **Profil clădire minimal** → calcul automat al sistemelor de stingere.
- **Calcul determinist, verificabil** — fiecare valoare cu formula și articolul de normativ (breviar de calcul).
- **Încadrare în obligativitate** (când e necesar fiecare sistem, cu temei normativ).
- **Rezervor de incendiu** (cumul scenariu cel mai defavorabil) și **grup de pompare**.
- **Cost · Risc · Beneficiu extins** — CAPEX pe toate specialitățile (grupat pe trade), cost specific €/m², OPEX (mentenanță) anual, matrice de risc (probabilitate × impact → nivel + măsură) și beneficii cuantificate.
- **Catalog de prețuri editabil** (tab „Firma mea") — ajustezi tarifele la valorile tale; se aplică tuturor proiectelor și se salvează în browser (`sowilo_preturi`).
- **Racordare la utilități + pagină de fezabilitate (Go/No-go)** — din debitele/puterile calculate: ce se solicită fiecărui operator (ATR, avize apă-canal, cerere gaz, ISU), semafor de risc de capacitate, termene-capcană și estimarea garanției de racordare electrică (30 €/kW). Pagina de fezabilitate = un PDF de o pagină, bancabil, pentru dezvoltator/investitor.
- **Export deviz + cantități (Excel/CSV)** — devizul pe specialități + solicitările de racordare, exportabile pentru licitație/ofertare (CSV cu `;` și BOM UTF-8, se deschide direct în Excel RO).
- **Memoriu tehnic PDF** (print-to-PDF, diacritice perfecte), cu logo și atestate.
- **Export/Import** JSON.

## Cum rulezi

Deschide `index.html` (prezentare) sau direct `app.html` (aplicația). Apasă **„+ Proiect nou"**, completează datele minime de clădire (gol = valori implicite) → **„Salvează & calculează"** → **„Generează memoriu PDF"**.

## Corectitudine (teste de regresie)

`calc-stingere.test.js` verifică motorul pe cifrele REALE din memoriul Hotel Sinaia:

```
node dimensionare/calc-stingere.test.js
```

Toate cele 15 verificări trec: sprinklere 15 l/s & rezervă 54 m³, hidranți int. cazare 4,2 l/s, hidranți ext. qee 10 l/s & 108 m³, **rezervor adoptat 210 m³**, încadrare obligativitate etc.

## Structură

| Fișier | Rol |
|--------|-----|
| `index.html`, `app.html`, `style.css`, `app.js` | prezentare + aplicație + orchestrare |
| `calc-stingere.js` (+ `.test.js`) | **motor determinist** stingere (funcții pure, breviar de calcul) |
| `calc-apa.js` (+ `.test.js`) | apă rece (debite, rezervor consum, hidrofor) |
| `calc-canalizare.js` · `calc-electrice.js` · `calc-gaze.js` (+ `calc-utilitati.test.js`) | canalizare menajeră/pluvială, energie electrică (trafo + GE), gaze naturale |
| `calc-sisteme.js` (+ `.test.js`) | termice, ventilație/climatizare, detecție incendiu, desfumare |
| `calc-racordare.js` (+ `.test.js`) | solicitări de racordare (ATR/apă-canal/gaz/ISU), risc de capacitate, garanție electrică |
| `fezabilitate.js` · `export.js` (+ `export.test.js`) | pagină Go/No-go (PDF) · export deviz + cantități (CSV/Excel) |
| `normative.js` | normative curente + praguri de obligativitate |
| `crb.js` (+ `.test.js`) | cost · risc · beneficiu extins (CAPEX pe specialități, OPEX, €/m², matrice de risc) |
| `memoriu.js` | construire memoriu tehnic (print-view → PDF) |
| `ai.js` (+ `.test.js`) + `netlify/functions/claude.js` | **stratul AI** — propunere ipoteze + redactare narativ memoriu (vezi mai jos) |

## Stratul AI (opțional — integrat în UI)

Aplicația funcționează 100% fără AI. Activat, AI face **două** lucruri, folosind Claude (`claude-opus-4-8`):

1. **Propune ipoteze** (buton „✨ Propune ipoteze (AI)" în formularul de proiect) — pentru câmpurile lipsă (nivel stabilitate, volum compartiment, intensitate ploaie, dotări etc.), AI propune valori de pornire cu motivare și nivel de încredere, **marcate „de confirmat"**. Se completează doar câmpurile goale; proiectantul verifică înainte de calcul.
2. **Redactează narativul** (buton „✨ Adaugă narativ (AI)" în rezultate) — pe baza **cifrelor deterministe deja calculate**, AI scrie proza memoriului (descriere, justificarea soluțiilor, concluzii), care apare în PDF.

**REGULĂ ABSOLUTĂ:** AI nu modifică și nu inventează nicio cifră de dimensionare — toate valorile vin din motoarele deterministe. Ieșirile sunt structurate (`output_config.format`, JSON schema), nu text liber.

### Configurare (tab „Firma mea" → „Asistent AI")

- **Proxy serverless (recomandat, pentru site public):** cheia API **nu poate sta în browser** → `netlify/functions/claude.js` ține `ANTHROPIC_API_KEY` ca variabilă de mediu și redirecționează cererile.
  - Deploy gratuit pe Netlify: drag & drop folderul `dimensionare`; setează `ANTHROPIC_API_KEY` în Site settings → Environment variables. Funcția e **zero-dependențe** (Node 18+, `fetch` nativ — fără `npm install`). Endpoint: `/.netlify/functions/claude` (implicit). `netlify.toml` din folder configurează publish + functions.
- **Mod test local (doar pentru tine):** completează cheia ta în câmpul „Cheie API Anthropic". `ai.js` apelează atunci direct API-ul din browser (cu `anthropic-dangerous-direct-browser-access`). **Nu pune cheia pe un site public** — folosește proxy-ul.

Cheile se salvează în `localStorage` (`sowilo_ai_proxy`, `sowilo_anthropic_key`).

## Roadmap module (până la memoriul complet ca Hotel Sinaia)

Toate specialitățile MEP sunt acum implementate, același tipar determinist (calcul + breviar + memoriu), calibrate pe Hotel Sinaia:

Stingere ✓ · **Apă ✓** · **Canalizare ✓** · **Electrice ✓** · **Gaze ✓** · **Termice/HVAC ✓** · **Ventilație ✓** · **Detecție incendiu ✓** · **Desfumare ✓** — compuse într-un memoriu unic de racordare utilități + dimensionare instalații.

Toate testele de regresie (127 verificări) trec:

```
node dimensionare/calc-stingere.test.js   # 20/20 — sprinklere, hidranți, rezervor 210 m³
node dimensionare/calc-apa.test.js        # 11/11 — Qzi,med 74,5; Qmax,orar 8,7 mc/h; rezervor 110 mc; hidrofor 57 mCA
node dimensionare/calc-utilitati.test.js  #  9/9  — canalizare, electrice (trafo 1250, GE 550 kVA), gaze (PRM 200)
node dimensionare/calc-sisteme.test.js    #  9/9  — termice 904/600 kW, ventilație 5400 mc/h, detecție, desfumare 72000 mc/h
node dimensionare/ai.test.js              # 27/27 — strat AI: cereri valide (opus-4-8, fără temperature/budget_tokens), merge ipoteze, rezumat determinist
node dimensionare/crb.test.js             # 25/25 — cost extins (8 specialități, €/m², OPEX), matrice de risc, catalog editabil
node dimensionare/calc-racordare.test.js  # 13/13 — solicitări operatori, garanție electrică 31.530 €, risc capacitate, ISU
node dimensionare/export.test.js          # 13/13 — export CSV (deviz+racordare) + pagină de fezabilitate Go/No-go
```

## Limitări conștiente (faza curentă)

- Tabelul Anexa 7 (qee hidranți exteriori) e redus la benzile uzuale, cu punctul confirmat din memoriu (stab. II, 20-50k m³ → 10 l/s); se extinde cu valorile complete.
- Numărul de capete sprinkler și calculul hidraulic complet (SR EN 12845 cap. 13) sunt orientative la faza DTAC — se confirmă la PT, cum notează și memoriul real.
