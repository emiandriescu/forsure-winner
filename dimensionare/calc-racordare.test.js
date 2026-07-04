/* Teste racordare utilități — pe bundle-ul real Hotel Sinaia.
   Rulare: node dimensionare/calc-racordare.test.js */
const STINGERE = require("./calc-stingere.js");
const APA = require("./calc-apa.js");
const CANALIZARE = require("./calc-canalizare.js");
const ELECTRICE = require("./calc-electrice.js");
const GAZE = require("./calc-gaze.js");
const RAC = require("./calc-racordare.js");

let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }
function eq(name, got, exp) { ok(name, got === exp, got + (got === exp ? "" : " (așteptat " + exp + ")")); }

const profile = {
  functiune: "hotel", tip: "turism", valoareUnit: 90, locuriCazare: 180, persoane: 180, nrCamere: 90,
  acNivel: 1525, nrNiveluriSupraterane: 4, inaltimeUltimPlanseu: 17, arieDesfasurata: 11300, arieAcoperis: 7500,
  i_ploaie: 130, cotaGeodezica: 17, saliAglomerate: true, nivelStabilitate: "II", volumCompartiment: 35000,
  risc: "mediu", office: { are: false }, dotari: {}, parcaj: { locuri: 120, arieProtejata: 5000, nrNiveluri: 2 },
};
const dim = STINGERE.dimensionareStingere(profile);
const apa = APA.dimensionareApa(profile);
const canalizare = CANALIZARE.dimensionareCanalizare(profile, apa.debite);
const electrice = ELECTRICE.dimensionareElectrice(profile);
const gaze = GAZE.dimensionareGaze(profile);
const rac = RAC.dimensionareRacordare({ electrice, apa, canalizare, gaze, dim, profile });

ok("întoarce 5 utilități (electric/apă/canal/gaz/ISU)", rac.utilitati.length === 5, rac.utilitati.length);

const el = rac.utilitati.find((u) => u.cheie === "electric");
eq("garanția electrică = Pa × 30 €/kW", el.valoare, electrice.Pa * 30);
ok("electric la MT (S 1142 > 1000 kVA) → risc ridicat", el.nivel === "ridicat", el.nivel + " (S=" + electrice.S + ")");
ok("solicitarea electrică menționează puterea", el.solicitare.includes(String(electrice.Pa)), "ok");

const gz = rac.utilitati.find((u) => u.cheie === "gaz");
ok("gaz q 174,7 > 100 mc/h → risc moderat (presiune medie)", gz.nivel === "moderat", gz.nivel);
ok("gaz menționează ~3–4 luni", /3.4 luni/.test(gz.termen), "ok");

const isu = rac.utilitati.find((u) => u.cheie === "isu");
ok("ISU obligatoriu (săli aglomerate)", /OBLIGATORIU/.test(isu.solicitare), "ok");

const ap = rac.utilitati.find((u) => u.cheie === "apa");
ok("apă: debit + DN în solicitare", ap.solicitare.includes(apa.debite.dn), "ok");

eq("verdict general = cel mai mare risc (ridicat, de la electric)", rac.verdict, "ridicat");
eq("garantieElectric expusă în sinteză", rac.garantieElectric, electrice.Pa * 30);
ok("timeline are pasul de gaz ca cel mai lung", rac.timeline.some((t) => /gaz/i.test(t.pas) && /luni/.test(t.durata)), "ok");

// clădire mică fără săli aglomerate → ISU neobligatoriu, electric risc mai mic
const mic = RAC.dimensionareRacordare({
  electrice: { Pi: 100, Pa: 60, S: 65, trafo: 100, ge: 0, normativ: "I7" },
  apa: { debite: { Qmax_orar_ls: 1, Qmax_orar_mc: 3.6, dn: "DN 50", presiune_bar: 2.5, normativ: "I9" } },
  profile: { tip: "birouri", saliAglomerate: false, inaltimeUltimPlanseu: 9, nrNiveluriSupraterane: 3 },
  dim: { obligativitate: [{ obligatoriu: false }] },
});
ok("clădire mică: electric risc scăzut (S 65 kVA)", mic.utilitati.find((u) => u.cheie === "electric").nivel === "scăzut", "ok");
ok("clădire mică: ISU probabil neobligatoriu", /neobligatoriu/.test(mic.utilitati.find((u) => u.cheie === "isu").solicitare), "ok");

// --- Tarif ATR pe benzi + linkuri portale ---
eq("tarif ATR ≤30 kVA = 70 lei", RAC.tarifATR(25), 70);
eq("tarif ATR 30-100 kVA = 160 lei", RAC.tarifATR(80), 160);
eq("tarif ATR >100 kVA = 215 lei", RAC.tarifATR(1142), 215);
eq("electric hotel: atr_lei = 215 (S 1142 kVA)", el.atr_lei, 215);
ok("electric: linkuri portale operatori prezente", el.linkuri && el.linkuri.length >= 2 && /reteleelectrice/.test(el.linkuri[0].url), "ok");
ok("costul menționează tariful ATR", /tarif emitere ATR 215 lei/.test(el.cost), "ok");

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
