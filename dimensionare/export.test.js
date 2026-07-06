/* Teste export CSV + pagină de fezabilitate — pe un proiect real.
   Rulare: node dimensionare/export.test.js */
const STINGERE = require("./calc-stingere.js");
const APA = require("./calc-apa.js");
const CANALIZARE = require("./calc-canalizare.js");
const ELECTRICE = require("./calc-electrice.js");
const GAZE = require("./calc-gaze.js");
const SISTEME = require("./calc-sisteme.js");
const CRB = require("./crb.js");
const RAC = require("./calc-racordare.js");
const EXPORTCSV = require("./export.js");
const FEZ = require("./fezabilitate.js");

let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }

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
const sisteme = SISTEME.dimensionareSisteme(profile);
const crb = CRB.analizaExtinsa({ profile, dim, apa, canalizare, electrice, gaze, sisteme });
const racordare = RAC.dimensionareRacordare({ electrice, apa, canalizare, gaze, dim, profile });
const p = { name: "Hotel Sinaia", beneficiar: "X", adresa: "Sinaia", functiune: "hotel", data: "Iunie 2026",
  dim, apa, canalizare, electrice, gaze, sisteme, crb, racordare };

// ---- EXPORT XLS (tabel Excel formatat, pe capitole) ----
const xls = EXPORTCSV.buildExportXLS(p);
ok("XLS e tabel HTML (deschide în Excel)", xls.includes("<table") && xls.includes("</table>"), "ok");
ok("XLS are titlul devizului", /deviz estimativ pe specialități/i.test(xls), "ok");
ok("XLS grupează pe capitole (specialități)", xls.includes("Termice &amp; gaze") || xls.includes("Termice & gaze"), "ok");
ok("XLS are subcapitole (echipamente + armături + distribuție)",
  xls.includes("Echipamente principale") && xls.includes("Armături și accesorii") && /Distribuție/.test(xls), "ok");
ok("XLS itemizează țeava pe diametre (DN)", /DN50|DN40|DN65/.test(xls), "ok");
ok("XLS are subtotaluri de subcapitol (clasa sub)", /class="sub"/.test(xls), "ok");
ok("XLS are TOTAL CAPEX cu valoarea corectă", xls.includes(crb.cost.total.toLocaleString("ro-RO")), crb.cost.total);
ok("XLS conține solicitările de racordare", /Solicitări de racordare/.test(xls), "ok");

// ---- EXPORT CSV (compatibilitate) ----
const csv = EXPORTCSV.buildExportCSV(p);
ok("CSV are antet pe capitole/subcapitole", csv.includes("Capitol") && csv.includes("Subcapitol"), "ok");
ok("CSV conține poziții reprezentative din deviz",
  ["Centrală termică", "Corpuri de încălzire", "Stație de hidrofor", "Rezervor de incendiu"].every((s) => csv.includes(s)), "ok");
ok("CSV are TOTAL CAPEX cu valoarea corectă", csv.includes(String(crb.cost.total)), crb.cost.total);
ok("CSV folosește ; ca delimitator", csv.includes("Capitol;Subcapitol;"), "ok");

// ---- PAGINĂ FEZABILITATE ----
const fez = FEZ.buildFezabilitate({ company: { name: "SOWILO SRL", atestate: ["IDSAI"], proiectant: "ing. X" }, project: p, dim, crb, racordare });
ok("fezabilitate: verdict RIDICAT (de la electric MT)", /VERDICT RACORDARE/.test(fez) && /RIDICAT/.test(fez), "ok");
ok("fezabilitate: garanția electrică afișată", fez.includes((racordare.garantieElectric).toLocaleString("ro-RO")), racordare.garantieElectric + " €");
ok("fezabilitate: CAPEX total afișat", fez.includes(crb.cost.total.toLocaleString("ro-RO")), "ok");
ok("fezabilitate: toate cele 5 utilități în tabel",
  ["Energie electrică", "Alimentare cu apă", "Canalizare", "Gaze naturale", "Securitate la incendiu"].every((u) => fez.includes(u)), "ok");
ok("fezabilitate: termene-capcană (gaz)", /Cerere racordare gaz/.test(fez), "ok");
ok("fezabilitate: notă de responsabilitate", /responsabilitatea proiectantului/.test(fez), "ok");

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
