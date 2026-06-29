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
- **Export/Import** JSON, exemplu „Hotel Sinaia" cu un click.

## Cum rulezi

Deschide `index.html` (prezentare) sau direct `app.html` (aplicația). Apasă **„Încarcă exemplu (Hotel Sinaia)"** ca să vezi tot fluxul → **„Generează memoriu PDF"**.

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

Stingere ✓ · **Apă ✓** (Qzi,med→Kzi→Kor→branșament, rezervor consum, hidrofor) → apoi, același tipar determinist: **canalizare** (menajeră/pluvială), **electrice** (Pi→Pa→trafo, grup electrogen), **gaze** (q=P/(PCI·η)), **termice/HVAC** (CTA, recuperare), **detecție**, **desfumare** — compuse într-un memoriu unic de racordare utilități + dimensionare.

Teste apă: `node dimensionare/calc-apa.test.js` (11/11, calibrate pe Hotel Sinaia: Qzi,med 74,5; Qmax,zi 104; Qmax,orar 8,7 mc/h / 2,4 l/s; rezervor consum 110 mc; hidrofor 57 mCA).

## Limitări conștiente (faza curentă)

- Tabelul Anexa 7 (qee hidranți exteriori) e redus la benzile uzuale, cu punctul confirmat din memoriu (stab. II, 20-50k m³ → 10 l/s); se extinde cu valorile complete.
- Numărul de capete sprinkler și calculul hidraulic complet (SR EN 12845 cap. 13) sunt orientative la faza DTAC — se confirmă la PT, cum notează și memoriul real.
