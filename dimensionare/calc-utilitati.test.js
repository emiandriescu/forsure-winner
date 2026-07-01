/* Teste de regresie: Canalizare, Electrice, Gaze — pe cifrele Hotel Sinaia.
   Rulare: node dimensionare/calc-utilitati.test.js */
const CAN = require("./calc-canalizare.js");
const EL = require("./calc-electrice.js");
const GZ = require("./calc-gaze.js");

let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }
function eq(name, got, exp) { ok(name, got === exp, got + (got === exp ? "" : " (așteptat " + exp + ")")); }

const hotel = {
  tip: "turism", persoane: 180, arieDesfasurata: 11300, arieAcoperis: 7500, i_ploaie: 130,
  acNivel: 1525, nrNiveluriSupraterane: 4, parcaj: { locuri: 120 },
  dotari: { mese: 200, piscina_mc: 6 },
};
const apaDebite = { Qmax_zi: 104.3, Qmax_orar_ls: 2.4 };

// --- Canalizare ---
const can = CAN.dimensionareCanalizare(hotel, apaDebite);
eq("pluvial Q rotunjit (l/s) — 0,9×0,75ha×130", Math.round(can.pluviala.Q), 88);
ok("menajeră Qu = 0,8×Qmax,zi", Math.abs(can.menajera.Qu_zi - 83.4) < 0.5, can.menajera.Qu_zi);
eq("separatoare (grăsimi + hidrocarburi)", can.separatoare.length, 2);

// --- Electrice ---
const el = EL.dimensionareElectrice(hotel);
ok("Pi ≈ 1750 kW (155 W/mp × 11.300)", el.Pi >= 1700 && el.Pi <= 1800, el.Pi);
ok("Pa ≈ 1050 kW (Kc=0,6)", el.Pa >= 1040 && el.Pa <= 1060, el.Pa);
ok("S ≈ 1140 kVA (cosφ=0,92)", el.S >= 1130 && el.S <= 1160, el.S);
ok("grup electrogen 550 kVA", /550/.test(el.ge), el.ge);

// --- Gaze ---
const gz = GZ.dimensionareGaze(hotel);
ok("Q gaz 150-190 mc/h", gz.q >= 150 && gz.q <= 190, gz.q);
ok("PRM ≥ debit solicitat", gz.prm >= gz.q_solicitat, gz.prm);

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
