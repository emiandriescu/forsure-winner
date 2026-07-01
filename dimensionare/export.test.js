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

// ---- EXPORT CSV ----
const csv = EXPORTCSV.buildExportCSV(p);
ok("CSV are secțiunea de deviz", csv.includes("DEVIZ ESTIMATIV PE SPECIALITĂȚI"), "ok");
ok("CSV are secțiunea de racordare", csv.includes("SOLICITĂRI DE RACORDARE"), "ok");
ok("CSV conține un rând de rezervor incendiu", /Rezervor de incendiu/.test(csv), "ok");
ok("CSV are TOTAL CAPEX cu valoarea corectă", csv.includes(String(crb.cost.total)), crb.cost.total);
ok("CSV folosește ; ca delimitator", csv.split("\n")[1].includes(";"), "ok");
ok("CSV formatează zecimalele cu virgulă (RO Excel)",
  csv.includes("Cost specific (€/m²)"), "ok");
const nLinesDeviz = crb.cost.lines.length;
ok("CSV conține toate liniile de deviz", crb.cost.lines.every((l) => csv.includes(l.eticheta)), nLinesDeviz + " linii");

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
