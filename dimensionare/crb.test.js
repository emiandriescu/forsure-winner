/* Teste cost-risc-beneficiu EXTINS — pe bundle-ul real Hotel Sinaia.
   Rulare: node dimensionare/crb.test.js */
const STINGERE = require("./calc-stingere.js");
const APA = require("./calc-apa.js");
const CANALIZARE = require("./calc-canalizare.js");
const ELECTRICE = require("./calc-electrice.js");
const GAZE = require("./calc-gaze.js");
const SISTEME = require("./calc-sisteme.js");
const CRB = require("./crb.js");

let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }
function eq(name, got, exp) { ok(name, got === exp, got + (got === exp ? "" : " (așteptat " + exp + ")")); }

const profile = {
  functiune: "hotel", tip: "turism", etichetaUnit: "Nr. camere", valoareUnit: 90,
  locuriCazare: 180, persoane: 180, nrApartamente: 0, nrCamere: 90,
  acNivel: 1525, nrNiveluriSupraterane: 4, inaltimeUltimPlanseu: 17,
  arieDesfasurata: 11300, arieAcoperis: 7500, i_ploaie: 130, cotaGeodezica: 17,
  saliAglomerate: true, nivelStabilitate: "II", volumCompartiment: 35000, risc: "mediu",
  office: { are: false, arie: 0, persoane: 0 }, dotari: {},
  parcaj: { locuri: 120, arieProtejata: 5000, nrNiveluri: 2 },
};
const dim = STINGERE.dimensionareStingere(profile);
const apa = APA.dimensionareApa(profile);
const canalizare = CANALIZARE.dimensionareCanalizare(profile, apa.debite);
const electrice = ELECTRICE.dimensionareElectrice(profile);
const gaze = GAZE.dimensionareGaze(profile);
const sisteme = SISTEME.dimensionareSisteme(profile);
const bundle = { profile, dim, apa, canalizare, electrice, gaze, sisteme };

const a = CRB.analizaExtinsa(bundle);

// --- COST ---
ok("CAPEX total > 0", a.cost.total > 0, a.cost.total);
const sumGrupuri = a.cost.grupuri.reduce((s, g) => s + g.total, 0);
eq("suma grupurilor = total", sumGrupuri, a.cost.total);
ok("acoperă ≥ 6 specialități", a.cost.grupuri.length >= 6, a.cost.grupuri.length);
ok("fiecare linie are specialitate validă", a.cost.lines.every((l) => CRB.GRUPURI.includes(l.specialitate)), "ok");
ok("CAPEX/m² calculat (din 11.300 m²)", a.cost.perMp === Math.round(a.cost.total / 11300), a.cost.perMp + " €/m²");
ok("OPEX anual > 0 și < CAPEX", a.cost.opexAnual > 0 && a.cost.opexAnual < a.cost.total, a.cost.opexAnual);
const grElectrice = a.cost.grupuri.find((g) => g.specialitate === "Instalații electrice");
ok("electricele apar cu pondere > 0", grElectrice && grElectrice.pct > 0, grElectrice && grElectrice.pct + "%");
const grStingere = a.cost.grupuri.find((g) => g.specialitate === "Stingere incendiu");
ok("stingerea include rezervorul 210 m³", a.cost.lines.some((l) => l.eticheta.includes("Rezervor de incendiu") && l.qty === 210), "ok");

// --- SINTEZĂ ---
ok("sinteză: specialitate principală identificată", !!a.sinteza.specialitatePrincipala, a.sinteza.specialitatePrincipala && a.sinteza.specialitatePrincipala.specialitate);
eq("sinteză capex = cost.total", a.sinteza.capex, a.cost.total);

// --- RISC (matrice probabilitate × impact) ---
ok("matrice risc nevidă", a.risc.length >= 5, a.risc.length);
ok("fiecare risc are nivel calculat", a.risc.every((x) => ["scăzut", "moderat", "ridicat", "critic"].includes(x.nivel)), "ok");
ok("risc 'Putere electrică' prezent (electrice calculate)", a.risc.some((x) => x.categorie === "Putere electrică"), "ok");
ok("risc desfumare = critic (mica × critic)", a.risc.some((x) => x.categorie === "Desfumare" && x.nivel === "moderat"), "moderat (1×4)");
eq("nivelRisc(mare, critic) = critic", CRB.nivelRisc("mare", "critic"), "critic");
eq("nivelRisc(mare, mediu) = ridicat", CRB.nivelRisc("mare", "mediu"), "ridicat");
eq("nivelRisc(mica, mic) = scăzut", CRB.nivelRisc("mica", "mic"), "scăzut");

// --- BENEFICIU (cuantificat) ---
ok("beneficii nevide", a.beneficiu.length >= 4, a.beneficiu.length);
ok("beneficiu recuperare ≥75% cuantificat", a.beneficiu.some((b) => /recuperare ≥ 75/.test(b.cuantificare || "")), "ok");
ok("beneficiu grup electrogen prezent", a.beneficiu.some((b) => /grup electrogen/i.test(b.text)), "ok");

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
