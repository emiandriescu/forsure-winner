/* Teste de regresie pentru motorul de stingere — verifică pe cifrele REALE din
   memoriul Hotel Sinaia. Rulare: node dimensionare/calc-stingere.test.js */
const S = require("./calc-stingere.js");

let pass = 0, fail = 0;
function eq(name, got, exp) {
  const ok = got === exp;
  console.log(`${ok ? "✓" : "✗"} ${name}: ${got}${ok ? "" : " (așteptat " + exp + ")"}`);
  ok ? pass++ : fail++;
}

// --- Sprinklere parcaj OH2 (Hotel Sinaia: Q=15 l/s, rezervă=54 m³, ~420 capete pe 5000 m²) ---
const sp = S.sprinklereParcaj({ arieProtejata: 5000 });
eq("sprinklere Q (l/s)", sp.Q, 15);
eq("sprinklere rezervă (m³)", sp.rezerva, 54);
eq("sprinklere capete total (~420)", sp.capeteTotal, 417);
eq("sprinklere capete în AMA (12)", sp.capeteAMA, 12);

// --- Hidranți interiori cazare (4,2 l/s, săli aglomerate 60 min → 15 m³) ---
const hic = S.hidrantiInterioriCazare({ saliAglomerate: true });
eq("hidr. int. cazare Q (l/s)", hic.Q, 4.2);
eq("hidr. int. cazare rezervă (m³)", hic.rezerva, 15);

// --- Hidranți interiori parcaj (5 l/s × 30 min → 9 m³) ---
const hip = S.hidrantiInterioriParcaj({ locuriParcaj: 100 });
eq("hidr. int. parcaj Q (l/s)", hip.Q, 5);
eq("hidr. int. parcaj rezervă (m³)", hip.rezerva, 9);

// --- Hidranți exteriori (stab. II, 35.000 m³, mediu → qee=10 l/s, 180 min → 108 m³) ---
const hex = S.hidrantiExteriori({ nivelStabilitate: "II", volumCompartiment: 35000, risc: "mediu" });
eq("hidr. ext. qee (l/s)", hex.Q, 10);
eq("hidr. ext. rezervă (m³)", hex.rezerva, 108);
eq("hidr. ext. nr. hidranți (min 2)", hex.nrHidranti, 2);

// --- Rezervor incendiu cumulat (54+9+6+15+108 = 192 → +10% → adoptat 210 m³) ---
const dim = S.dimensionareStingere({
  functiune: "hotel", locuriCazare: 180, nrCamere: 90, acNivel: 1525,
  nrNiveluriSupraterane: 4, inaltimeUltimPlanseu: 17, saliAglomerate: true,
  nivelStabilitate: "II", volumCompartiment: 35000, risc: "mediu",
  parcaj: { locuri: 120, arieProtejata: 5000 }, // P2 (101-300 locuri) → sprinklere obligatorii
});
eq("rezervor subtotal (m³)", dim.rezervor.subtotal, 192);
eq("rezervor adoptat (m³)", dim.rezervor.adoptat, 210); // 192 × 1,10 = 211,2 → rotunjit la 210

// --- Obligativitate ---
const obSpr = dim.obligativitate.find((o) => o.sistem === "Sprinklere parcaj");
eq("sprinklere obligatorii (P2)", obSpr.obligatoriu, true);
const obHi = dim.obligativitate.find((o) => o.sistem === "Hidranți interiori");
eq("hidranți interiori obligatorii", obHi.obligatoriu, true);

// --- Locuințe colective (bloc P+10, parcaj 2 niveluri) — încadrare rezidențială ---
const rez = S.dimensionareStingere({
  tip: "rezidential", persoane: 150, nrApartamente: 60, acNivel: 700,
  nrNiveluriSupraterane: 11, inaltimeUltimPlanseu: 33, nivelStabilitate: "II",
  volumCompartiment: 25000, parcaj: { locuri: 80, arieProtejata: 2400, nrNiveluri: 2 },
});
const rHi = rez.obligativitate.find((o) => o.sistem === "Hidranți interiori");
eq("rezidential: hidranți interiori obligatorii (P+10)", rHi.obligatoriu, true);
const rInalta = rez.obligativitate.find((o) => o.sistem === "Măsuri clădire înaltă");
eq("rezidential: clădire înaltă (33 m ≥ 28)", rInalta.obligatoriu, true);
const rSpr = rez.obligativitate.find((o) => o.sistem === "Sprinklere parcaj");
eq("rezidential: sprinklere parcaj NU (80 < 101 locuri)", rSpr.obligatoriu, false);
eq("rezidential: rezervor calculat (> 0)", rez.rezervor.adoptat > 0, true);

// --- Mixed-use: zonă office/retail la parter ---
const mu = S.dimensionareStingere({
  tip: "turism", locuriCazare: 120, acNivel: 1200, nrNiveluriSupraterane: 5, inaltimeUltimPlanseu: 18,
  office: { are: true, arie: 800, persoane: 250 }, parcaj: { locuri: 0 },
});
const mOffice = mu.obligativitate.find((o) => o.sistem === "Zonă office/retail parter");
eq("mixed-use: apare zona office/retail", !!mOffice && mOffice.obligatoriu, true);

// --- Corecții audit: P3/P4, clădire înaltă 120 min, NaN, merge profund, gating obligativitate ---
const p3 = S.dimensionareStingere({ tip: "turism", locuriCazare: 200, parcaj: { locuri: 400, arieProtejata: 12000 } });
eq("P3 (400 locuri): sprinklere OBLIGATORII", p3.obligativitate.find((o) => o.sistem === "Sprinklere parcaj").obligatoriu, true);

const inalt = S.hidrantiInterioriCazare({ cladireInalta: true });
eq("clădire înaltă: timp hidranți interiori 120 min", inalt.timp, 120);
eq("clădire înaltă: rezervă 30 m³ (4,2 × 120 min)", inalt.rezerva, 30);

eq("volum compartiment NaN → implicit 30.000 → qee 10", S.qeeAnexa7({ volumCompartiment: parseInt("") }), 10);
eq("stabilitate V: qee crescut (10 → 15)", S.qeeAnexa7({ nivelStabilitate: "V", volumCompartiment: 35000 }), 15);
eq("clădire înaltă la exact 28 m: NU (strict > 28)", S.obligativitate({ tip: "turism", inaltimeUltimPlanseu: 28 }).find((o) => o.sistem === "Măsuri clădire înaltă").obligatoriu, false);

// parcaj parțial (fără arieProtejata) nu mai anulează sprinklerele obligatorii
const partial = S.dimensionareStingere({ parcaj: { locuri: 150 } });
const pSpr = partial.sisteme.find((s) => s.sistem.startsWith("Sprinklere"));
eq("parcaj parțial: sprinklere dimensionate (arie estimată)", pSpr.necesar && pSpr.capeteTotal > 0, true);

// clădire mică, nimic obligatoriu → sistemele nu intră în rezervă
const mic = S.dimensionareStingere({ tip: "turism", locuriCazare: 10, nrNiveluriSupraterane: 2, acNivel: 300, volumCompartiment: 2000, parcaj: { locuri: 0 } });
eq("clădire mică: nimic obligatoriu → rezervor 0", mic.rezervor.adoptat, 0);
eq("clădire mică: hidranții marcați neobligatorii", mic.sisteme.find((s) => s.sistem.startsWith("Hidranți interiori")).necesar, false);

// rotunjirea nu coboară sub subtotal
const rz = S.rezervorIncendiu([{ eticheta: "x", rezerva: 96 }]);
eq("rezervor: adoptat ≥ subtotal (96 → 105)", rz.adoptat >= 96, true);

// normalizare functiune → tip
const fn = S.dimensionareStingere({ functiune: "locuințe colective", persoane: 100, nrNiveluriSupraterane: 7, acNivel: 400, volumCompartiment: 8000 });
eq("functiune 'locuințe colective' → praguri rezidențiale", fn.profile.tip, "rezidential");

// parcaj mic de suprafață (< 10 locuri) nu declanșează NP 127
const p2loc = S.dimensionareStingere({ tip: "turism", locuriCazare: 120, volumCompartiment: 35000, parcaj: { locuri: 2 } });
eq("2 locuri parcare: fără hidranți/drencere de parcaj", p2loc.sisteme.some((s) => s.sistem === "Hidranți interiori — parcaj"), false);

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
