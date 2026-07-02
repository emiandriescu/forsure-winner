/* ===== SOWILO Dimensionare — MOTOR DETERMINIST: Stingere incendiu =====
   Funcții pure, calibrate pe memoriul real Hotel Sinaia.
   Fiecare funcție întoarce { value/results, steps[], normativ } — `steps` e
   desfășurarea calculului, citată direct în memoriul tehnic și în breviarul de calcul.

   Rulează în browser (window.STINGERE) și în Node (module.exports).

   ⚠️ Coeficienții marcați CALIBRARE sunt din normativ / din memoriul Hotel Sinaia.
   Tabelele reduse (ex. Anexa 7) se completează pe măsură ce extindem domeniul.
*/
(function (root) {
  "use strict";

  const r1 = (n) => Math.round(n * 10) / 10; // o zecimală
  const r0 = (n) => Math.round(n);

  // ---- Coeficienți de normativ (CALIBRARE) ----
  const C = {
    sprinkler: { densitate_OH2: 5, ama_OH2: 144, spacing_OH2: 12, marjaHidraulica: 0.25, timp_min: 60 }, // SR EN 12845 Tabel 2/4, OH2
    hidrantInteriorCazare: { debitJet: 2.1, jeturi: 2, presiune_bar: 2.5, timp_saliAglomerate: 60, timp_normal: 10 }, // P118/2 Anexa 3
    hidrantInteriorParcaj: { debitJet: 2.5, jeturi: 2, timp: 30 }, // NP 127:2009 art. 154
    hidrantExterior: { debitPerHidrant: 5, presiuneUtilizator_bar: 0.7, timp_stabII: 180 }, // P118/2 art. 6.28/6.30, art. 6.19 lit. b
    drencereRampa_mc: 6, // NP 127 art. 37 (estimare memoriu)
    marjaRezervor: 0.10, // marjă proiectare rezervor incendiu
  };

  // P118/2 Anexa 7 — qee (l/s) pentru clădiri civile, după nivel stabilitate + volum compartiment + risc.
  // CALIBRARE: punctul confirmat din memoriu (stab. II, 20-50k m³, risc mediu → 10 l/s).
  // Tabel redus, conservativ; se extinde cu valorile complete din Anexa 7.
  function qeeAnexa7({ nivelStabilitate = "II", volumCompartiment = 30000, risc = "mediu" }) {
    if (!Number.isFinite(volumCompartiment)) volumCompartiment = 30000; // câmp gol/invalid → implicitul documentat
    let qee;
    if (volumCompartiment <= 20000) qee = 5;
    else if (volumCompartiment <= 50000) qee = 10; // confirmat Hotel Sinaia
    else if (volumCompartiment <= 100000) qee = 15;
    else qee = 20;
    if (risc === "mare") qee += 5;
    // nivel de stabilitate scăzut → qee mai mare (direcția Anexei 7; valoare acoperitoare, de verificat pe tabelul complet)
    if (nivelStabilitate === "IV" || nivelStabilitate === "V") qee = Math.min(25, qee + 5);
    return qee;
  }

  // ---------- SPRINKLERE PARCAJ (SR EN 12845 OH2 + NP 127:2009) ----------
  function sprinklereParcaj({ arieProtejata = 0 } = {}) {
    const s = C.sprinkler;
    const Qteoretic = (s.densitate_OH2 * s.ama_OH2) / 60; // l/s
    const Q = r0(Qteoretic * (1 + s.marjaHidraulica)); // +25% marjă → 15 l/s
    const rezerva = r0((Q * s.timp_min * 60) / 1000); // m³
    const capeteTotal = arieProtejata ? Math.ceil(arieProtejata / s.spacing_OH2) : 0;
    const capeteAMA = Math.ceil(s.ama_OH2 / s.spacing_OH2);
    return {
      sistem: "Sprinklere parcaj (OH2)",
      necesar: arieProtejata > 0,
      Q, rezerva, capeteTotal, capeteAMA, timp: s.timp_min,
      normativ: "SR EN 12845 (OH2) + NP 127:2009 art. 53",
      steps: [
        `Categorie risc: OH2 (parcaj auto). Densitate de stropire ρ = ${s.densitate_OH2} mm/min; aria de operare AMA = ${s.ama_OH2} m² (SR EN 12845 Tabel 2).`,
        `Debit teoretic Q = ρ × AMA / 60 = ${s.densitate_OH2} × ${s.ama_OH2} / 60 = ${r1(Qteoretic)} l/s.`,
        `Cu marjă hidraulică +${s.marjaHidraulica * 100}% → Q proiectat = ${Q} l/s.`,
        `Timp de funcționare t = ${s.timp_min} min → rezervă = Q × t = ${Q} × ${s.timp_min} × 60 / 1000 = ${rezerva} m³.`,
        arieProtejata > 0
          ? `Capete sprinkler: spacing ${s.spacing_OH2} m²/cap → total ≈ ${capeteTotal} capete (${arieProtejata} m² / ${s.spacing_OH2}); în aria de operare = ${capeteAMA} capete (${s.ama_OH2}/${s.spacing_OH2}).`
          : `Arie protejată neintrodusă — numărul de capete se calculează la PT.`,
      ],
    };
  }

  // ---------- HIDRANȚI INTERIORI ZONA CAZARE (P118/2 Anexa 3) ----------
  function hidrantiInterioriCazare({ saliAglomerate = false, cladireInalta = false, zona = "zonă cazare" } = {}) {
    const h = C.hidrantInteriorCazare;
    const Q = r1(h.jeturi * h.debitJet); // 4.2 l/s
    // art. 4.35: clădiri înalte/foarte înalte → 120 min; săli aglomerate → 60 min; restul → 10 min
    const timp = cladireInalta ? 120 : saliAglomerate ? h.timp_saliAglomerate : h.timp_normal;
    const motivTimp = cladireInalta ? "art. 4.35 lit. a — clădire înaltă" : saliAglomerate ? "art. 4.35 lit. b — săli aglomerate" : "art. 4.35 lit. d";
    const rezerva = r0((Q * timp * 60) / 1000);
    return {
      sistem: "Hidranți interiori — " + zona,
      necesar: true, Q, rezerva, timp, presiune: h.presiune_bar,
      normativ: "P118/2-2013 mod. 2018, Anexa 3",
      steps: [
        `Debit de calcul = ${h.jeturi} jeturi simultane × ${h.debitJet} l/s = ${Q} l/s (Anexa 3, clădiri Ac > 1.000 m² și peste 3 niveluri).`,
        `Presiune minimă la robinet = ${h.presiune_bar} bar (art. 4.39).`,
        `Timp de funcționare t = ${timp} min (${motivTimp}).`,
        `Rezervă intangibilă = ${Q} × ${timp} × 60 / 1000 = ${rezerva} m³.`,
      ],
    };
  }

  // ---------- HIDRANȚI INTERIORI PARCAJ (NP 127:2009 art. 154) ----------
  function hidrantiInterioriParcaj({ locuriParcaj = 0 } = {}) {
    const h = C.hidrantInteriorParcaj;
    const necesar = locuriParcaj > 0;
    const Q = r1(h.jeturi * h.debitJet); // 5.0 l/s
    const rezerva = r0((Q * h.timp * 60) / 1000);
    return {
      sistem: "Hidranți interiori — parcaj",
      necesar, Q, rezerva, timp: h.timp,
      normativ: "NP 127:2009 art. 154 alin. (1)+(3)",
      steps: [
        `Pentru parcaj se aplică NP 127:2009 art. 154: ${h.jeturi} jeturi × ${h.debitJet} l/s = ${Q} l/s (debit minim per jet 2,5 l/s, nu 2,1 l/s).`,
        `Timp de funcționare t = ${h.timp} min (parcaje P1/P2).`,
        `Rezervă = ${Q} × ${h.timp} × 60 / 1000 = ${rezerva} m³.`,
      ],
    };
  }

  // ---------- HIDRANȚI EXTERIORI (P118/2 art. 6.40 + Anexa 7) ----------
  function hidrantiExteriori({ nivelStabilitate = "II", volumCompartiment = 30000, risc = "mediu" } = {}) {
    const h = C.hidrantExterior;
    const qee = qeeAnexa7({ nivelStabilitate, volumCompartiment, risc });
    const nrHidranti = Math.max(2, Math.ceil(qee / h.debitPerHidrant));
    const rezerva = r0((qee * h.timp_stabII * 60) / 1000);
    return {
      sistem: "Hidranți exteriori",
      necesar: true, Q: qee, rezerva, timp: h.timp_stabII, nrHidranti,
      normativ: "P118/2-2013 mod. 2018 art. 6.40 + Anexa 7",
      steps: [
        `qee din Anexa 7 (nivel stabilitate ${nivelStabilitate}, volum compartiment ${r0(volumCompartiment)} m³, risc ${risc}) = ${qee} l/s.`,
        `Număr hidranți: ${h.debitPerHidrant} l/s/hidrant (art. 6.28) → minim ${nrHidranti} în funcțiune simultană.`,
        `Presiune ≥ ${h.presiuneUtilizator_bar} bar la utilizator (art. 6.30, pompe mobile).`,
        `Timp de funcționare t = ${h.timp_stabII} min (art. 6.19 — valoare acoperitoare, 3 ore; de corelat cu nivelul de stabilitate la PT).`,
        `Rezervă = ${qee} × ${h.timp_stabII} × 60 / 1000 = ${rezerva} m³.`,
      ],
    };
  }

  // ---------- REZERVOR INCENDIU (cumul scenariu cel mai defavorabil) ----------
  function rezervorIncendiu(componente) {
    // componente: array de { eticheta, rezerva }
    const lista = componente.filter((c) => c && c.rezerva > 0);
    const subtotal = lista.reduce((s, c) => s + c.rezerva, 0);
    const cuMarja = subtotal * (1 + C.marjaRezervor);
    // rotunjire la 5 m³ la cea mai apropiată valoare (ex. 192 → +10% → 211,2 → 210, calibrat pe memoriu);
    // niciodată sub subtotal (rezerva intangibilă rămâne acoperită integral)
    let adoptat = Math.round(cuMarja / 5) * 5;
    if (adoptat < subtotal) adoptat = Math.ceil(subtotal / 5) * 5;
    return {
      sistem: "Rezervor de incendiu (rezervă intangibilă)",
      subtotal: r0(subtotal), marja: C.marjaRezervor, adoptat,
      componente: lista.map((c) => ({ eticheta: c.eticheta, rezerva: c.rezerva })),
      normativ: "P118/2-2013 mod. 2018 (scenariu cel mai defavorabil)",
      steps: [
        `Scenariul cel mai defavorabil cumulează sistemele care funcționează simultan:`,
        ...lista.map((c) => `  • ${c.eticheta}: ${c.rezerva} m³`),
        `Subtotal = ${r0(subtotal)} m³. Cu marjă de proiectare +${C.marjaRezervor * 100}% = ${r1(cuMarja)} m³.`,
        `VOLUM REZERVOR INCENDIU adoptat = ${adoptat} m³ (rotunjit la 5 m³ — rotunjirea poate absorbi o parte din marjă, niciodată din rezerva de bază; recompletare automată ≤ 24h din branșamentul de apă rece).`,
      ],
    };
  }

  // ---------- GRUP DE POMPARE ----------
  function grupPompare({ Qprincipal, QhidrantiExt }) {
    return {
      sistem: "Grup de pompare incendiu (atestat IGSU)",
      pompePrincipale: { Q: r0(Qprincipal), H_mCA: 80, config: "2 buc (1A + 1R)" },
      pompeHidrantiExt: { Q: r0(QhidrantiExt), H_mCA: 60, config: "2 buc (1A + 1R)" },
      jockey: { Q: 2, H_mCA: 85, config: "1 buc, menținere presiune" },
      normativ: "P118/2-2013 mod. 2018 + SR EN 12845",
      steps: [
        `Pompe principale (sprinklere + hidranți interiori): Q ≈ ${r0(Qprincipal)} l/s, H ≈ 80 mCA, 2 buc (1A + 1R), atestate IGSU.`,
        `Pompe hidranți exteriori: Q = ${r0(QhidrantiExt)} l/s, H ≈ 60 mCA, 2 buc (1A + 1R).`,
        `Pompă pilot (jockey): Q = 2 l/s, H ≈ 85 mCA — menținere presiune, prevenire porniri inutile.`,
        `Alimentare: tablou dedicat din TGD + AAR la grup electrogen (consumator vital cf. I7/2023).`,
      ],
    };
  }

  // ---------- OBLIGATIVITATE (ce sisteme sunt necesare) ----------
  // normalizare tip: acceptă și `functiune` (schema formularului) pe lângă `tip` (schema motorului)
  const TIP_DIN_FUNCTIUNE = { hotel: "turism", "locuințe colective": "rezidential", "locuinte colective": "rezidential" };
  function normalizeazaTip(p) { return p.tip || TIP_DIN_FUNCTIUNE[p.functiune] || (p.functiune ? "generic" : "turism"); }

  function obligativitate(p) {
    const N = (root.NORMATIVE_API && root.NORMATIVE_API.PRAGURI) ||
      (typeof require !== "undefined" ? require("./normative.js").PRAGURI : {});
    const m = (k, fb) => N[k] || fb; // fallback dacă normative.js nu e încărcat
    const out = [];
    const ac3 = p.acNivel > 600 && p.nrNiveluriSupraterane > 3;
    const tip = normalizeazaTip(p);

    if (tip === "rezidential") {
      // „peste P+4" = minim P+5, adică > 5 niveluri supraterane (P+4 are 5 niveluri)
      out.push({ sistem: "Hidranți interiori", obligatoriu: p.nrNiveluriSupraterane > 5 || ac3, motiv: m("hidrantiInterioriRezidential", "P118/2 art. 4.1 (locuințe colective peste P+4)") });
      out.push({ sistem: "Hidranți exteriori", obligatoriu: (p.persoane || 0) > 300 || p.volumCompartiment > 5000, motiv: m("hidrantiExterioriRezidential", "P118/2 art. 6.1") });
    } else if (tip === "turism") {
      out.push({ sistem: "Hidranți interiori", obligatoriu: (p.locuriCazare > 50) || ac3, motiv: m("hidrantiInterioriTurism", "P118/2 art. 4.1 (cazare > 50 locuri)") });
      out.push({ sistem: "Hidranți exteriori", obligatoriu: (p.locuriCazare > 100) || ac3, motiv: m("hidrantiExterioriTurism", "P118/2 art. 6.1 (cazare > 100 locuri)") });
    } else {
      out.push({ sistem: "Hidranți interiori", obligatoriu: ac3 || (p.persoane || 0) > 100, motiv: m("hidrantiGeneric", "P118/2 art. 4.1/6.1") });
      out.push({ sistem: "Hidranți exteriori", obligatoriu: ac3 || p.volumCompartiment > 5000, motiv: m("hidrantiGeneric", "P118/2 art. 4.1/6.1") });
    }

    // NP 127: P2 (101-300), P3 (301-1000), P4 (>1000) — de la 101 locuri în sus stingerea automată e obligatorie
    const locuri = (p.parcaj && p.parcaj.locuri) || 0;
    const catParcaj = locuri > 1000 ? "P4" : locuri > 300 ? "P3" : locuri >= 101 ? "P2" : null;
    out.push({
      sistem: "Sprinklere parcaj", obligatoriu: locuri >= 101,
      motiv: m("sprinklereParcajP2", "NP 127:2009 (parcaje ≥ 101 locuri)") + (catParcaj && catParcaj !== "P2" ? ` (categoria ${catParcaj} — măsuri cel puțin la nivelul P2)` : ""),
    });
    // P118: „clădire înaltă" = peste 28 m (strict)
    out.push({ sistem: "Măsuri clădire înaltă", obligatoriu: p.inaltimeUltimPlanseu > 28, motiv: m("cladireInalta", "P118/1 (clădire înaltă > 28 m)") });
    if (p.office && p.office.are) out.push({ sistem: "Zonă office/retail parter", obligatoriu: true, motiv: m("officeRetail", "încadrare mixtă parter") });
    return out;
  }

  // ---------- ORCHESTRARE: dimensionare completă stingere ----------
  function dimensionareStingere(p = {}) {
    const profile = Object.assign(
      { tip: "", locuriCazare: 0, persoane: 0, nrApartamente: 0, nrCamere: 0, acNivel: 0,
        nrNiveluriSupraterane: 0, inaltimeUltimPlanseu: 0, saliAglomerate: false, nivelStabilitate: "II",
        volumCompartiment: 30000, risc: "mediu" },
      p
    );
    profile.tip = normalizeazaTip(profile);
    // merge PROFUND pentru obiectele imbricate — un parcaj parțial nu mai șterge câmpurile lipsă
    profile.parcaj = Object.assign({ locuri: 0, arieProtejata: 0, nrNiveluri: 0 }, p.parcaj || {});
    profile.office = Object.assign({ are: false, arie: 0, persoane: 0 }, p.office || {});
    const parcaj = profile.parcaj;
    // sprinklere obligatorii dar arie neintrodusă → estimăm aria protejată (~25 m²/loc), marcat în breviar
    let arieEstimata = false;
    if (parcaj.locuri >= 101 && !(parcaj.arieProtejata > 0)) { parcaj.arieProtejata = parcaj.locuri * 25; arieEstimata = true; }

    const zona = profile.tip === "rezidential" ? "zonă locuit" : profile.tip === "turism" ? "zonă cazare" : "zonă principală";
    const cladireInalta = profile.inaltimeUltimPlanseu > 28;
    // NP 127 se aplică parcajelor de la categoria P1 (≥ 10 locuri); câteva locuri de suprafață nu declanșează măsurile
    const parcajNP127 = parcaj.locuri >= 10;

    const oblig = obligativitate(profile);
    const need = (nume) => { const row = oblig.find((o) => o.sistem === nume); return row ? row.obligatoriu : true; };

    const sprink = parcaj.locuri >= 101 ? sprinklereParcaj({ arieProtejata: parcaj.arieProtejata }) : null;
    if (sprink && arieEstimata) sprink.steps.push(`Aria protejată a fost estimată la ${parcaj.arieProtejata} m² (~25 m²/loc × ${parcaj.locuri} locuri) — de precizat de proiectant.`);
    if (sprink && parcaj.nrNiveluri > 1) sprink.steps.push(`Parcaj pe ${parcaj.nrNiveluri} niveluri — extracția de fum și compartimentarea se repartizează pe niveluri (detaliat la modulul desfumare).`);
    const hiCaz = hidrantiInterioriCazare({ saliAglomerate: profile.saliAglomerate, cladireInalta, zona });
    const hiParc = parcajNP127 ? hidrantiInterioriParcaj({ locuriParcaj: parcaj.locuri }) : null;
    const hExt = hidrantiExteriori({ nivelStabilitate: profile.nivelStabilitate, volumCompartiment: profile.volumCompartiment, risc: profile.risc });
    const drencere = parcajNP127 ? { sistem: "Drencere perdele rampă", rezerva: C.drencereRampa_mc, necesar: true, normativ: "NP 127:2009 art. 37", steps: [`Drencere de protecție a rampelor (estimare) ≈ ${C.drencereRampa_mc} m³.`] } : null;

    // sistemele neobligatorii se marchează „recomandat" și NU intră în rezerva intangibilă
    hiCaz.necesar = need("Hidranți interiori");
    hExt.necesar = need("Hidranți exteriori");
    if (!hiCaz.necesar) hiCaz.steps.push("Sistem NEOBLIGATORIU conform încadrării — dimensionare informativă (la cererea beneficiarului); nu intră în rezerva intangibilă.");
    if (!hExt.necesar) hExt.steps.push("Sistem NEOBLIGATORIU conform încadrării — dimensionare informativă (la cererea beneficiarului); nu intră în rezerva intangibilă.");

    const componenteRezerva = [
      sprink && { eticheta: `Sprinklere parcaj (${sprink.Q} l/s × ${sprink.timp} min)`, rezerva: sprink.rezerva },
      hiParc && { eticheta: `Hidranți interiori parcaj (${hiParc.Q} l/s × ${hiParc.timp} min)`, rezerva: hiParc.rezerva },
      drencere && { eticheta: "Drencere perdele rampă", rezerva: drencere.rezerva },
      hiCaz.necesar && { eticheta: `${hiCaz.sistem} (${hiCaz.Q} l/s × ${hiCaz.timp} min)`, rezerva: hiCaz.rezerva },
      hExt.necesar && { eticheta: `Hidranți exteriori (${hExt.Q} l/s × ${hExt.timp} min)`, rezerva: hExt.rezerva },
    ].filter(Boolean);

    const rezervor = rezervorIncendiu(componenteRezerva);
    const Qprincipal = (sprink ? sprink.Q : 0) + (hiParc ? hiParc.Q : 0) + (hiCaz.necesar ? hiCaz.Q : 0) + 1; // + marjă
    const pompare = grupPompare({ Qprincipal, QhidrantiExt: hExt.necesar ? hExt.Q : 0 });

    return {
      profile,
      obligativitate: oblig,
      sisteme: [sprink, hiCaz, hiParc, hExt, drencere].filter(Boolean),
      rezervor,
      pompare,
    };
  }

  const api = {
    sprinklereParcaj, hidrantiInterioriCazare, hidrantiInterioriParcaj,
    hidrantiExteriori, qeeAnexa7, rezervorIncendiu, grupPompare,
    obligativitate, dimensionareStingere, C,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.STINGERE = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
