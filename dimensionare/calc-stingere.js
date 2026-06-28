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
    // bandă de volum
    let qee;
    if (volumCompartiment <= 5000) qee = 5;
    else if (volumCompartiment <= 20000) qee = 5;
    else if (volumCompartiment <= 50000) qee = 10; // confirmat Hotel Sinaia
    else if (volumCompartiment <= 100000) qee = 15;
    else qee = 20;
    if (risc === "mare") qee += 5;
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
  function hidrantiInterioriCazare({ saliAglomerate = false } = {}) {
    const h = C.hidrantInteriorCazare;
    const Q = r1(h.jeturi * h.debitJet); // 4.2 l/s
    const timp = saliAglomerate ? h.timp_saliAglomerate : h.timp_normal;
    const rezerva = r0((Q * timp * 60) / 1000);
    return {
      sistem: "Hidranți interiori — zonă cazare",
      necesar: true, Q, rezerva, timp, presiune: h.presiune_bar,
      normativ: "P118/2-2013 mod. 2018, Anexa 3",
      steps: [
        `Debit de calcul = ${h.jeturi} jeturi simultane × ${h.debitJet} l/s = ${Q} l/s (Anexa 3, clădiri Ac > 1.000 m² și peste 3 niveluri).`,
        `Presiune minimă la robinet = ${h.presiune_bar} bar (art. 4.39).`,
        `Timp de funcționare t = ${timp} min (${saliAglomerate ? "art. 4.35 lit. b — săli aglomerate" : "art. 4.35 lit. d"}).`,
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
        `Timp de funcționare t = ${h.timp_stabII} min (art. 6.19 lit. b — nivel stabilitate ${nivelStabilitate}).`,
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
    const adoptat = Math.round(cuMarja / 5) * 5; // rotunjire la 5 m³ (ex. 192 → +10% → 211 → 210)
    return {
      sistem: "Rezervor de incendiu (rezervă intangibilă)",
      subtotal: r0(subtotal), marja: C.marjaRezervor, adoptat,
      componente: lista.map((c) => ({ eticheta: c.eticheta, rezerva: c.rezerva })),
      normativ: "P118/2-2013 mod. 2018 (scenariu cel mai defavorabil)",
      steps: [
        `Scenariul cel mai defavorabil cumulează sistemele care funcționează simultan:`,
        ...lista.map((c) => `  • ${c.eticheta}: ${c.rezerva} m³`),
        `Subtotal = ${r0(subtotal)} m³. Cu marjă de proiectare +${C.marjaRezervor * 100}% = ${r1(cuMarja)} m³.`,
        `VOLUM REZERVOR INCENDIU adoptat = ${adoptat} m³ (recompletare automată ≤ 24h din branșamentul de apă rece).`,
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
  function obligativitate(p) {
    const N = (root.NORMATIVE_API && root.NORMATIVE_API.PRAGURI) ||
      (typeof require !== "undefined" ? require("./normative.js").PRAGURI : {});
    const out = [];
    const hidrInt = (p.locuriCazare > 50) || (p.acNivel > 600 && p.nrNiveluriSupraterane > 3);
    out.push({ sistem: "Hidranți interiori", obligatoriu: hidrInt, motiv: N.hidrantiInterioriTurism });
    const hidrExt = (p.locuriCazare > 100) || (p.acNivel > 600 && p.nrNiveluriSupraterane > 3);
    out.push({ sistem: "Hidranți exteriori", obligatoriu: hidrExt, motiv: N.hidrantiExterioriTurism });
    const sprink = p.parcaj && p.parcaj.locuri >= 101 && p.parcaj.locuri <= 300;
    out.push({ sistem: "Sprinklere parcaj", obligatoriu: !!sprink, motiv: N.sprinklereParcajP2 });
    const inalta = p.inaltimeUltimPlanseu >= 28;
    out.push({ sistem: "Măsuri clădire înaltă", obligatoriu: inalta, motiv: N.cladireInalta });
    return out;
  }

  // ---------- ORCHESTRARE: dimensionare completă stingere ----------
  function dimensionareStingere(p = {}) {
    const profile = Object.assign(
      { locuriCazare: 0, nrCamere: 0, acNivel: 0, nrNiveluriSupraterane: 0, inaltimeUltimPlanseu: 0,
        saliAglomerate: false, nivelStabilitate: "II", volumCompartiment: 30000, risc: "mediu",
        parcaj: { locuri: 0, arieProtejata: 0 } },
      p
    );
    const parcaj = profile.parcaj || { locuri: 0, arieProtejata: 0 };

    const sprink = parcaj.locuri >= 101 ? sprinklereParcaj({ arieProtejata: parcaj.arieProtejata }) : null;
    const hiCaz = hidrantiInterioriCazare({ saliAglomerate: profile.saliAglomerate });
    const hiParc = parcaj.locuri > 0 ? hidrantiInterioriParcaj({ locuriParcaj: parcaj.locuri }) : null;
    const hExt = hidrantiExteriori({ nivelStabilitate: profile.nivelStabilitate, volumCompartiment: profile.volumCompartiment, risc: profile.risc });
    const drencere = parcaj.locuri > 0 ? { sistem: "Drencere perdele rampă", rezerva: C.drencereRampa_mc, necesar: true, normativ: "NP 127:2009 art. 37", steps: [`Drencere de protecție a rampelor (estimare) ≈ ${C.drencereRampa_mc} m³.`] } : null;

    const componenteRezerva = [
      sprink && { eticheta: `Sprinklere parcaj (${sprink.Q} l/s × ${sprink.timp} min)`, rezerva: sprink.rezerva },
      hiParc && { eticheta: `Hidranți interiori parcaj (${hiParc.Q} l/s × ${hiParc.timp} min)`, rezerva: hiParc.rezerva },
      drencere && { eticheta: "Drencere perdele rampă", rezerva: drencere.rezerva },
      { eticheta: `Hidranți interiori cazare (${hiCaz.Q} l/s × ${hiCaz.timp} min)`, rezerva: hiCaz.rezerva },
      { eticheta: `Hidranți exteriori (${hExt.Q} l/s × ${hExt.timp} min)`, rezerva: hExt.rezerva },
    ].filter(Boolean);

    const rezervor = rezervorIncendiu(componenteRezerva);
    const Qprincipal = (sprink ? sprink.Q : 0) + (hiParc ? hiParc.Q : 0) + hiCaz.Q + 1; // + marjă
    const pompare = grupPompare({ Qprincipal, QhidrantiExt: hExt.Q });

    return {
      profile,
      obligativitate: obligativitate({ ...profile, acNivel: profile.acNivel }),
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
