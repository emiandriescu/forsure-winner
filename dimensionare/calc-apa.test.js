/* Teste de regresie modul Apă — pe cifrele REALE din memoriul Hotel Sinaia (cap. 2.1 + 3.1).
   Rulare: node dimensionare/calc-apa.test.js */
const A = require("./calc-apa.js");

let pass = 0, fail = 0;
function eq(name, got, exp) { const ok = got === exp; console.log(`${ok ? "✓" : "✗"} ${name}: ${got}${ok ? "" : " (așteptat " + exp + ")"}`); ok ? pass++ : fail++; }
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }

// Profil Hotel Sinaia (dotările reale care dau Qzi,med = 74,5 mc/zi)
const hotel = {
  tip: "turism", persoane: 180, nrCamere: 90, inaltimeUltimPlanseu: 17,
  dotari: { mese: 200, ture: 2, personal: 60, bucatarie_mc: 5, piscina_mc: 6, spa_mc: 3, spalatorie_mc: 8, irigatii_mc: 5 },
};

const dim = A.dimensionareApa(hotel);
const d = dim.debite;

eq("Qzi,med (mc/zi)", d.Qzi_med, 74.5);
eq("Qmax,zi rotunjit (mc/zi)", Math.round(d.Qmax_zi), 104);
eq("Qmax,orar (mc/h)", d.Qmax_orar_mc, 8.7);
eq("Qmax,orar (l/s)", d.Qmax_orar_ls, 2.4);
eq("branșament DN", d.dn, "DN 100");
eq("presiune cerută (bar)", d.presiune_bar, 2.5);

// componente individuale (verificare câteva poziții cheie)
const cz = d.consumatori.find((c) => c.nume === "Cazare hotel");
eq("cazare 180 pers × 200 l = 36 mc", cz.Q, 36);
const rs = d.consumatori.find((c) => c.nume === "Restaurante");
eq("restaurante 200×2×25 l = 10 mc", rs.Q, 10);

// rezervor consum (țintă 110-120 mc)
ok("rezervor consum 110-120 mc", dim.rezervor.adoptat >= 110 && dim.rezervor.adoptat <= 120, dim.rezervor.adoptat);

// hidrofor: H = 17 + 25 + 8 + 7 = 57 mCA
eq("hidrofor H (mCA)", dim.statie.H_mCA, 57);
ok("hidrofor Q stație ≥ 3 l/s", dim.statie.Qstatie >= 3, dim.statie.Qstatie);

// --- Corecții audit ---
// spital: consum specific de spital (325 l/pat), nu de birouri (25 l)
const sp = A.dimensionareApa({ tip: "spital", persoane: 200 });
eq("spital 200 paturi: Qzi,med = 65 mc/zi (325 l/pat)", sp.debite.Qzi_med, 65);

// cotă geodezică 0 explicită nu mai cade pe înălțimea clădirii
const h0 = A.hidrofor({ cotaGeodezica: 0, inaltimeUltimPlanseu: 30 }, 2);
eq("cotă geodezică 0: H = 0+25+8+7 = 40 mCA", h0.H_mCA, 40);

// consumatorii mici nu se pierd la sumare (1,35 mc nu devine 0 în total)
const micC = A.debiteApa({ tip: "turism", persoane: 10, nrCamere: 5, dotari: { mese: 0, personal: 54 } });
ok("suma folosește valorile nerotunjite", Math.abs(micC.Qzi_med - (2 + 1.35)) < 0.06, micC.Qzi_med);

// banda DN 75 există (1,6 l/s nu mai primește DN 100)
eq("DN pentru 1,6 l/s = DN 75", A.dnBransament(1.6), "DN 75");
eq("DN pentru 2,4 l/s rămâne DN 100 (calibrare)", A.dnBransament(2.4), "DN 100");

// rezervorul de consum nu coboară sub volumul de bază
const rz = A.rezervorConsum({}, 96);
ok("rezervor consum ≥ baza (96 mc)", rz.adoptat >= 96, rz.adoptat);

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
