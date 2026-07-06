/* Teste grafice — SVG valid, date reflectate corect, robustețe.
   Rulare: node dimensionare/charts.test.js */
const A = require("./calc-apa.js");
const S = require("./calc-stingere.js");
const EL = require("./calc-electrice.js");
const GZ = require("./calc-gaze.js");
const CAN = require("./calc-canalizare.js");
const SI = require("./calc-sisteme.js");
const CRB = require("./crb.js");
const CH = require("./charts.js");

let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }

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
const a = CRB.analizaExtinsa(bundle);

// SVG valid = se deschide și se închide corect
const isSvg = (s) => typeof s === "string" && s.indexOf("<svg") === 0 && s.trim().endsWith("</svg>");

// --- CAPEX ---
const capex = CH.chartCapex(a.cost.grupuri);
ok("CAPEX → SVG valid", isSvg(capex), capex.slice(0, 24));
ok("CAPEX conține o bară pentru fiecare specialitate", (capex.match(/<rect/g) || []).length >= a.cost.grupuri.length, (capex.match(/<rect/g) || []).length);
ok("CAPEX afișează procentele", a.cost.grupuri.every((g) => capex.includes(g.pct + "%")), "ok");

// --- Consum apă ---
const consum = CH.chartConsumApa(apa.debite.consumatori);
ok("Consum apă → SVG valid", isSvg(consum), consum.slice(0, 24));
ok("Consum apă are bare (consumatori > 0)", (consum.match(/<rect/g) || []).length >= 1, (consum.match(/<rect/g) || []).length);

// --- Matrice de risc ---
const mat = CH.chartRiscMatrix(a.risc, CRB.nivelRisc);
ok("Matrice risc → SVG valid", isSvg(mat), mat.slice(0, 24));
ok("Matrice risc = 12 celule (3 prob × 4 impact)", (mat.match(/rx="7"/g) || []).length === 12, (mat.match(/rx="7"/g) || []).length);
const totalHits = a.risc.length;
const bulets = (mat.match(/<circle/g) || []).length;
ok("Matrice risc marchează celulele cu riscuri (≥1 bulină)", bulets >= 1 && bulets <= totalHits, `${bulets} buline / ${totalHits} riscuri`);

// --- Curbă pompă ---
const pompa = CH.chartPompa(dim.pompare);
ok("Curbă pompă → SVG valid", isSvg(pompa), pompa.slice(0, 24));
ok("Curbă pompă are ≥2 curbe (principale + jockey)", (pompa.match(/<path/g) || []).length >= 2, (pompa.match(/<path/g) || []).length);
ok("Curbă pompă afișează punctul de funcționare (l/s · mCA)", pompa.includes("l/s · ") && pompa.includes(" mCA"), "ok");

// --- Robustețe ---
ok("date lipsă → string gol, fără eroare", CH.chartCapex([]) === "" && CH.chartConsumApa(null) === "" && CH.chartPompa(null) === "", "ok");
ok("matrice fără funcție nivel → string gol", CH.chartRiscMatrix(a.risc, null) === "", "ok");

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
