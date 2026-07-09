/* Teste cantități de distribuție — pe bundle-ul Hotel Sinaia + coerență cu catalogul de prețuri.
   Rulare: node dimensionare/calc-cantitati.test.js */
const S = require("./calc-stingere.js");
const A = require("./calc-apa.js");
const CAN = require("./calc-canalizare.js");
const EL = require("./calc-electrice.js");
const GZ = require("./calc-gaze.js");
const SI = require("./calc-sisteme.js");
const CANT = require("./calc-cantitati.js");
const CRB = require("./crb.js");

let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }
function eq(name, got, exp) { ok(name, got === exp, got + (got === exp ? "" : " (așteptat " + exp + ")")); }

const p = {
  functiune: "hotel", tip: "turism", valoareUnit: 90, locuriCazare: 180, persoane: 180, nrCamere: 90,
  acNivel: 1525, nrNiveluriSupraterane: 4, inaltimeUltimPlanseu: 17, arieDesfasurata: 11300, arieAcoperis: 7500,
  i_ploaie: 130, cotaGeodezica: 17, saliAglomerate: true, nivelStabilitate: "II", volumCompartiment: 35000,
  risc: "mediu", office: { are: false }, dotari: { mese: 200, piscina_mc: 6 },
  parcaj: { locuri: 120, arieProtejata: 5000, nrNiveluri: 2 },
};
const dim = S.dimensionareStingere(p), apa = A.dimensionareApa(p), can = CAN.dimensionareCanalizare(p, apa.debite);
const el = EL.dimensionareElectrice(p), gz = GZ.dimensionareGaze(p), si = SI.dimensionareSisteme(p);
const bundle = { profile: p, dim, apa, canalizare: can, electrice: el, gaze: gz, sisteme: si };
const items = CANT.cantitati(bundle);

// ---- categoriile de distribuție cerute există (conducte, cablu, aparataje, tubulatură, corpuri, detectoare...) ----
const has = (kw) => items.some((it) => it.eticheta.toLowerCase().includes(kw));
ok("conducte apă", has("conducte distribuție apă"), "ok");
ok("conducte canalizare", has("conducte canalizare"), "ok");
ok("conducte termice", has("conducte distribuție termică"), "ok");
ok("corpuri de încălzire", has("corpuri de încălzire"), "ok");
ok("cabluri electrice", has("cabluri"), "ok");
ok("tablouri electrice", has("tablouri electrice"), "ok");
ok("aparataje", has("aparataje"), "ok");
ok("corpuri de iluminat", has("corpuri de iluminat"), "ok");
ok("tubulatură ventilație", has("tubulatură ventilație"), "ok");
ok("grile / anemostate", has("grile"), "ok");
ok("detectoare", has("detectoare"), "ok");
ok("cablu detecție", has("cablu detecție"), "ok");
ok("țeavă PSI", has("țeavă oțel"), "ok");
ok("obiecte sanitare", has("obiecte sanitare"), "ok");

// ---- cantități concrete (verificabile) ----
const condApa = items.find((it) => /conducte distribuție apă/i.test(it.eticheta));
eq("conducte apă = 0,35 ml/m² × 11.300 = 3955 ml", condApa.qty, 3955);
const cablu = items.find((it) => /cabluri/i.test(it.eticheta));
eq("cablu = 3,5 ml/m² × 11.300 = 39.550 ml", cablu.qty, 39550);
const corpuri = items.find((it) => /corpuri de încălzire/i.test(it.eticheta));
eq("corpuri încălzire = ceil(11.300/40) = 283", corpuri.qty, 283);
const sanitare = items.find((it) => /obiecte sanitare/i.test(it.eticheta));
eq("seturi sanitare = 90 camere", sanitare.qty, 90);

// ---- fiecare item are o cheie de preț VALIDĂ în catalog ----
ok("fiecare item are pretKey existent în PRETURI", items.every((it) => CRB.PRETURI[it.pretKey] != null), "ok");
ok("fiecare pretKey e și în PRETURI_META (apare în catalogul editabil)",
  items.every((it) => CRB.PRETURI_META.some((m) => m.key === it.pretKey)), "ok");

// ---- integrare în CAPEX: distribuțiile ridică semnificativ totalul și apar ca linii ----
const a = CRB.analizaExtinsa(bundle);
ok("CAPEX include liniile de distribuție (≥ 30 poziții)", a.cost.lines.length >= 30, a.cost.lines.length);
ok("termice au acum distribuție (>0), nu doar echipamente",
  a.cost.grupuri.find((g) => g.specialitate === "Termice & gaze").total > 300000, a.cost.grupuri.find((g) => g.specialitate === "Termice & gaze").total);
const sumaGrup = a.cost.grupuri.reduce((s, g) => s + g.total, 0);
eq("suma grupurilor = total (cu distribuții)", sumaGrup, a.cost.total);

// ---- robustețe: bundle parțial nu crapă ----
ok("bundle gol → listă goală, fără eroare", CANT.cantitati({}).length === 0, CANT.cantitati({}).length);
ok("doar profile (fără module) → nu crapă", Array.isArray(CANT.cantitati({ profile: { arieDesfasurata: 500 } })), "ok");

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
