# SOWILO Dimensionare

**Generator de dimensionare instalații + memoriu tehnic, pornind de la date minime de clădire.**
Construit pentru proiectanți de instalații (PSI), calibrat pe memorii tehnice reale (Hotel Sinaia).

Modulul curent: **Stingere incendiu** (sprinklere, hidranți interiori/exteriori, rezervă intangibilă, grup pompare), conform **P118/1:2025, P118/2-2013 mod. 2018, NP 127:2009, SR EN 12845**.

## Ce face acum (funcțional, fără server)

- **Profil clădire minimal** → calcul automat al sistemelor de stingere.
- **Calcul determinist, verificabil** — fiecare valoare cu formula și articolul de normativ (breviar de calcul).
- **Încadrare în obligativitate** (când e necesar fiecare sistem, cu temei normativ).
- **Rezervor de incendiu** (cumul scenariu cel mai defavorabil) și **grup de pompare**.
- **Cost · Risc · Beneficiu** integrat (estimare CAPEX + atenționări ISU).
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
| `normative.js` | normative curente + praguri de obligativitate |
| `crb.js` | cost · risc · beneficiu |
| `memoriu.js` | construire memoriu tehnic (print-view → PDF) |
| `ai.js` + `netlify/functions/claude.js` | **stratul AI (faza 4)** — completare ipoteze + redactare memoriu (vezi mai jos) |

## Stratul AI (faza 4 — opțional, pregătit)

Aplicația funcționează 100% fără AI. Pentru completarea ipotezelor lipsă și redactarea memoriului în limbaj natural, se folosește Claude (`claude-opus-4-8`):

- **Calculele numerice rămân deterministe** (în `calc-stingere.js`). AI doar propune ipoteze (marcate „de confirmat") și redactează text — nu inventează cifre.
- Cheia API **nu poate sta în browser** → proxy serverless `netlify/functions/claude.js` ține `ANTHROPIC_API_KEY` ca variabilă de mediu.
  - Deploy gratuit pe Netlify: drag & drop folderul; setează `ANTHROPIC_API_KEY` în Site settings → Environment variables.
- **Mod test local (doar pentru tine):** pune cheia ta în consola browserului — `localStorage.setItem('anthropic_key','sk-ant-...')` — și `ai.js` apelează direct API-ul. NU folosi acest mod în producție.

## Roadmap module (până la memoriul complet ca Hotel Sinaia)

Toate specialitățile MEP sunt acum implementate, același tipar determinist (calcul + breviar + memoriu), calibrate pe Hotel Sinaia:

Stingere ✓ · **Apă ✓** · **Canalizare ✓** · **Electrice ✓** · **Gaze ✓** · **Termice/HVAC ✓** · **Ventilație ✓** · **Detecție incendiu ✓** · **Desfumare ✓** — compuse într-un memoriu unic de racordare utilități + dimensionare instalații.

Toate testele de regresie (49 verificări) trec:

```
node dimensionare/calc-stingere.test.js   # 20/20 — sprinklere, hidranți, rezervor 210 m³
node dimensionare/calc-apa.test.js        # 11/11 — Qzi,med 74,5; Qmax,orar 8,7 mc/h; rezervor 110 mc; hidrofor 57 mCA
node dimensionare/calc-utilitati.test.js  #  9/9  — canalizare, electrice (trafo 1250, GE 550 kVA), gaze (PRM 200)
node dimensionare/calc-sisteme.test.js    #  9/9  — termice 904/600 kW, ventilație 5400 mc/h, detecție, desfumare 72000 mc/h
```

## Limitări conștiente (faza curentă)

- Tabelul Anexa 7 (qee hidranți exteriori) e redus la benzile uzuale, cu punctul confirmat din memoriu (stab. II, 20-50k m³ → 10 l/s); se extinde cu valorile complete.
- Numărul de capete sprinkler și calculul hidraulic complet (SR EN 12845 cap. 13) sunt orientative la faza DTAC — se confirmă la PT, cum notează și memoriul real.
