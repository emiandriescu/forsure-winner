/* Teste deviz structurat — capitole × subcapitole × poziții, diametre, coerență sume.
   Rulare: node dimensionare/deviz.test.js */
const S = require("./calc-stingere.js");
const A = require("./calc-apa.js");
const CAN = require("./calc-canalizare.js");
const EL = require("./calc-electrice.js");
const GZ = require("./calc-gaze.js");
const SI = require("./calc-sisteme.js");
const CRB = require("./crb.js");
const DEVIZ = require("./deviz.js");

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
const preturi = CRB.PRETURI;
const dz = DEVIZ.construieste(bundle, preturi);

const cap = (nume) => dz.capitole.find((c) => c.specialitate === nume);
const subOf = (c) => (c ? c.subcapitole.map((s) => s.nume) : []);
const pozOf = (c) => (c ? c.subcapitole.flatMap((s) => s.pozitii) : []);
const has = (poz, kw) => poz.some((it) => it.denumire.toLowerCase().includes(kw));

// ---- structura: fiecare specialitate are cele 3 subcapitole cerute ----
ok("există capitol Termice & gaze", !!cap("Termice & gaze"), "ok");
const term = cap("Termice & gaze"), termP = pozOf(term);
ok("Termice: 3 subcapitole (echipamente/armături/distribuție)",
  subOf(term).some((n) => /Echipamente/.test(n)) && subOf(term).some((n) => /Armături/.test(n)) && subOf(term).some((n) => /Distribuție/.test(n)),
  subOf(term).join(" | "));

// ---- echipamentele cerute de utilizator (puffer, distribuitor, vase expansiune, pompe) ----
ok("Termice: puffer / rezervor tampon", has(termP, "puffer"), "ok");
ok("Termice: distribuitor / colector", has(termP, "distribuitor"), "ok");
ok("Termice: vase de expansiune", has(termP, "vas"), "ok");
ok("Termice: pompe de circulație", has(termP, "pompe de circulație"), "ok");

// ---- armăturile cerute (filtre Y, clapete de sens, manșoane antivibrante, robineți) ----
ok("Termice: filtre Y", has(termP, "filtre y"), "ok");
ok("Termice: clapete de sens", has(termP, "clapete de sens"), "ok");
ok("Termice: manșoane antivibrante", has(termP, "manșoane antivibrante"), "ok");
ok("Termice: robineți sferici + cu sertar", has(termP, "robineți sferici") && has(termP, "sertar"), "ok");

// ---- țeava pe diametre + fitinguri + izolație + suporți (exact ca în cererea utilizatorului) ----
const dnLines = termP.filter((it) => /Țeavă oțel neagră DN/.test(it.denumire));
ok("Termice: țeavă oțel pe ≥4 benzi de diametru", dnLines.length >= 4, dnLines.map((l) => l.denumire.match(/DN\d+/)[0]).join(", "));
ok("Termice: fitinguri + piese speciale", has(termP, "fitinguri"), "ok");
ok("Termice: izolație termică", has(termP, "izolație"), "ok");
ok("Termice: suporți de susținere", has(termP, "suporți"), "ok");

// distribuția pe diametre însumează lungimea totală (0,25 ml/m² × 11.300 = 2.825 ml)
const mlTeava = dnLines.reduce((s, l) => s + l.cant, 0);
ok("Termice: Σ lungimi pe diametre = total rețea (2.825 ml)", Math.abs(mlTeava - 11300 * 0.25) < 1, mlTeava + " ml");

// ---- alte specialități au distribuție pe diametre ----
ok("Apă rece: țeavă PPR/PEX pe diametre", pozOf(cap("Apă rece")).some((it) => /PPR\/PEX DN/.test(it.denumire)), "ok");
ok("Canalizare: țeavă PP/PVC pe diametre", pozOf(cap("Canalizare")).some((it) => /PP\/PVC canalizare DN/.test(it.denumire)), "ok");
ok("Electrice: cablu + jgheaburi + tuburi", has(pozOf(cap("Instalații electrice")), "jgheab") && has(pozOf(cap("Instalații electrice")), "tuburi"), "ok");
ok("Stingere: rețea țeavă PSI pe diametre", pozOf(cap("Stingere incendiu")).some((it) => /PSI DN/.test(it.denumire)), "ok");

// ---- rețele exterioare (branșamente + cămine + terasamente) ----
const extApa = cap("Rețele exterioare — apă"), extApaP = pozOf(extApa);
ok("există capitol Rețele exterioare — apă", !!extApa, "ok");
ok("Apă ext: cămin de branșament cu vane", has(extApaP, "cămin de branșament") && has(extApaP, "vane"), "ok");
ok("Apă ext: conductă PEHD pe diametre", extApaP.some((it) => /PEHD.*DN/.test(it.denumire)), "ok");
const extCan = cap("Rețele exterioare — canalizare"), extCanP = pozOf(extCan);
ok("Canal ext: cămine menajeră + pluvială", has(extCanP, "cămine de vizitare menajeră") && has(extCanP, "pluvială"), "ok");
ok("Canal ext: guri de scurgere", has(extCanP, "guri de scurgere"), "ok");
ok("Canal ext: colectoare menajer + pluvial", extCanP.some((it) => /menajer PVC/.test(it.denumire)) && extCanP.some((it) => /pluvial PVC/.test(it.denumire)), "ok");
const extEl = pozOf(cap("Rețele exterioare — electrice"));
ok("Electric ext: cablu pozat îngropat", has(extEl, "cablu de energie pozat îngropat"), "ok");
ok("Electric ext: cămine de tragere", has(extEl, "cămine de tragere"), "ok");
const extInc = pozOf(cap("Rețele exterioare — incendiu"));
ok("Incendiu ext: hidranți exteriori (mutați din interior)", has(extInc, "hidranți exteriori"), "ok");
ok("hidranții exteriori NU se dublează în interior", !has(pozOf(cap("Stingere incendiu")), "hidranți exteriori"), "ok");
// terasamente la TOATE rețelele exterioare
const extCaps = ["Rețele exterioare — apă", "Rețele exterioare — canalizare", "Rețele exterioare — electrice", "Rețele exterioare — incendiu"];
ok("terasamente (săpătură) la fiecare rețea exterioară",
  extCaps.every((n) => cap(n) && subOf(cap(n)).some((s) => /terasamente/i.test(s)) && has(pozOf(cap(n)), "săpătură")), "ok");
ok("terasamente conțin evacuarea pământului în exces", extCaps.every((n) => has(pozOf(cap(n)), "transport pământ")), "ok");

// ---- coerența sumelor: poziții → subtotal → capitol → total ----
let okSub = true, okCap = true;
dz.capitole.forEach((c) => {
  c.subcapitole.forEach((s) => { if (s.subtotal !== s.pozitii.reduce((a, it) => a + it.total, 0)) okSub = false; });
  if (c.total !== c.subcapitole.reduce((a, s) => a + s.subtotal, 0)) okCap = false;
});
ok("subtotal subcapitol = Σ poziții", okSub, "ok");
ok("total capitol = Σ subcapitole", okCap, "ok");
ok("total deviz = Σ capitole", dz.total === dz.capitole.reduce((a, c) => a + c.total, 0), dz.total);
ok("lines (plat) = Σ poziții din capitole", dz.lines.length === dz.capitole.reduce((a, c) => a + pozOf(c).length, 0), dz.lines.length + " linii");

// ---- calibrare: totalul rămâne în ordinul de mărime realist (cu rețele exterioare) ----
const perMp = dz.total / 11300;
ok("cost specific realist (120–200 €/m²)", perMp >= 120 && perMp <= 200, Math.round(perMp) + " €/m²");

// ---- robustețe ----
ok("bundle gol → fără capitole, fără eroare", DEVIZ.construieste({}, preturi).capitole.length === 0, "ok");

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
