/* Teste de regresie: Termice, Ventilație, Detecție, Desfumare — pe cifrele Hotel Sinaia.
   Rulare: node dimensionare/calc-sisteme.test.js */
const S = require("./calc-sisteme.js");
let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }
function eq(name, got, exp) { ok(name, got === exp, got + (got === exp ? "" : " (așteptat " + exp + ")")); }

const hotel = { tip: "turism", persoane: 180, nrCamere: 90, arieDesfasurata: 11300,
  acNivel: 1525, nrNiveluriSupraterane: 4, parcaj: { locuri: 120, arieProtejata: 5000, nrNiveluri: 2 } };
const dim = S.dimensionareSisteme(hotel);

// Termice
ok("termice Pînc ≈ 904 kW", Math.abs(dim.termice.Pinc - 904) <= 5, dim.termice.Pinc);
ok("termice Prac ≈ 600 kW (chiller 2×300)", dim.termice.Prac >= 580 && dim.termice.Prac <= 620, dim.termice.Prac);

// Ventilație
eq("ventilație aer camere = 180×30 = 5400 mc/h", dim.ventilatie.aerCamere, 5400);
eq("ventilație recuperare ≥ 75%", dim.ventilatie.recuperare, 75);

// Detecție
eq("detecție bucle (~11.300/6.000)", dim.detectie.loops, 2);
eq("detecție obligatorie (hotel ≥25 camere)", dim.detectie.obligatoriu, true);

// Desfumare
eq("desfumare parcaj = 120×600 (cu sprinklere)", dim.desfumare.Qparcaj, 72000);
eq("desfumare per nivel (2 niveluri)", dim.desfumare.Qpernivel, 36000);
eq("presurizare 2 case scară = 24000 mc/h", dim.desfumare.Qpresurizare, 24000);

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
