/* ===== SOWILO Dimensionare — Cost / Risc / Beneficiu EXTINS =====
   Estimare CAPEX pe TOATE specialitățile (din cantitățile deterministe), grupată
   pe trade, + OPEX orientativ (mentenanță), €/m², matrice de risc (probabilitate ×
   impact) și beneficii cuantificate. Catalogul de prețuri e editabil de utilizator.
*/
(function (root) {
  "use strict";
  const r0 = (n) => Math.round(n);

  // Catalog orientativ de prețuri (EUR) — editabil din aplicație.
  const PRETURI = {
    // Stingere incendiu
    rezervorBeton_eur_mc: 350,        // rezervor incendiu beton armat, €/m³ util
    grupPompare_eur: 18000,           // grup pompare complet, atestat IGSU
    sprinkler_eur_cap: 28,            // cap sprinkler montat
    hidrantInterior_eur_buc: 650,     // cutie hidrant interior echipată
    hidrantExterior_eur_buc: 2200,    // hidrant exterior + racord
    statieAlarmare_eur: 3500,         // stație centrală sprinklere / ~1.000 m²
    // Apă rece
    rezervorConsum_eur_mc: 300,       // rezervor de consum, €/m³
    hidrofor_eur: 9000,               // stație de hidrofor
    reteleApa_eur_mp: 6,              // distribuție apă rece, €/m² desfășurat
    // Canalizare
    separator_eur: 4000,              // separator (hidrocarburi / grăsimi)
    reteleCanalizare_eur_mp: 7,       // canalizare menajeră + pluvială, €/m²
    // Instalații electrice
    postTrafo_eur_kva: 45,            // post de transformare, €/kVA
    grupElectrogen_eur_kva: 220,      // grup electrogen, €/kVA
    tablouriRetele_eur_mp: 22,        // tablouri + distribuție, €/m²
    // Termice & gaze
    centralaTermica_eur_kw: 95,       // centrală termică pe gaz, €/kW
    chiller_eur_kw: 320,              // chiller/pompă de căldură, €/kW frig
    prm_eur: 6000,                    // post reglare-măsurare gaz
    // Ventilație / climatizare
    cta_eur_mc_h: 4.5,                // CTA cu recuperare, € per mc/h aer tratat
    ventilatieParcaj_eur_mc_h: 1.2,   // ventilație parcaj (jet/extract), € per mc/h
    // Detecție incendiu
    detectieCentrala_eur: 6000,       // centrală adresabilă
    detectie_eur_mp: 9,              // detectoare + cablare, €/m²
    // Desfumare
    ventilatorF400_eur_buc: 5500,     // ventilator F400/120 (~30.000 mc/h)
    presurizare_eur_buc: 7000,        // ventilator presurizare casă de scară
    // OPEX (mentenanță anuală, % din CAPEX)
    mentenantaPSI_pct: 0.02,          // PSI (stingere/detecție/desfumare)
    mentenantaInst_pct: 0.015,        // restul instalațiilor
  };

  // Metadate pentru catalogul editabil din UI (etichetă, unitate, grup). pct: valoarea e fracție (afișată în %).
  const PRETURI_META = [
    { key: "rezervorBeton_eur_mc", grup: "Stingere incendiu", eticheta: "Rezervor incendiu (beton)", unit: "€/m³" },
    { key: "grupPompare_eur", grup: "Stingere incendiu", eticheta: "Grup de pompare", unit: "€" },
    { key: "sprinkler_eur_cap", grup: "Stingere incendiu", eticheta: "Cap sprinkler montat", unit: "€/buc" },
    { key: "hidrantInterior_eur_buc", grup: "Stingere incendiu", eticheta: "Cutie hidrant interior", unit: "€/buc" },
    { key: "hidrantExterior_eur_buc", grup: "Stingere incendiu", eticheta: "Hidrant exterior", unit: "€/buc" },
    { key: "statieAlarmare_eur", grup: "Stingere incendiu", eticheta: "Stație alarmare sprinklere", unit: "€/buc" },
    { key: "rezervorConsum_eur_mc", grup: "Apă rece", eticheta: "Rezervor de consum", unit: "€/m³" },
    { key: "hidrofor_eur", grup: "Apă rece", eticheta: "Stație de hidrofor", unit: "€" },
    { key: "reteleApa_eur_mp", grup: "Apă rece", eticheta: "Rețele apă rece", unit: "€/m²" },
    { key: "separator_eur", grup: "Canalizare", eticheta: "Separator", unit: "€/buc" },
    { key: "reteleCanalizare_eur_mp", grup: "Canalizare", eticheta: "Rețele canalizare", unit: "€/m²" },
    { key: "postTrafo_eur_kva", grup: "Instalații electrice", eticheta: "Post de transformare", unit: "€/kVA" },
    { key: "grupElectrogen_eur_kva", grup: "Instalații electrice", eticheta: "Grup electrogen", unit: "€/kVA" },
    { key: "tablouriRetele_eur_mp", grup: "Instalații electrice", eticheta: "Tablouri + distribuție", unit: "€/m²" },
    { key: "centralaTermica_eur_kw", grup: "Termice & gaze", eticheta: "Centrală termică gaz", unit: "€/kW" },
    { key: "chiller_eur_kw", grup: "Termice & gaze", eticheta: "Chiller / pompă de căldură", unit: "€/kW frig" },
    { key: "prm_eur", grup: "Termice & gaze", eticheta: "Post reglare gaz (PRM)", unit: "€" },
    { key: "cta_eur_mc_h", grup: "Ventilație/climatizare", eticheta: "CTA cu recuperare", unit: "€/(mc/h)" },
    { key: "ventilatieParcaj_eur_mc_h", grup: "Ventilație/climatizare", eticheta: "Ventilație parcaj", unit: "€/(mc/h)" },
    { key: "detectieCentrala_eur", grup: "Detecție incendiu", eticheta: "Centrală adresabilă", unit: "€" },
    { key: "detectie_eur_mp", grup: "Detecție incendiu", eticheta: "Detectoare + cablare", unit: "€/m²" },
    { key: "ventilatorF400_eur_buc", grup: "Desfumare", eticheta: "Ventilator F400/120", unit: "€/buc" },
    { key: "presurizare_eur_buc", grup: "Desfumare", eticheta: "Ventilator presurizare", unit: "€/buc" },
    { key: "mentenantaPSI_pct", grup: "OPEX (mentenanță anuală)", eticheta: "Mentenanță PSI", unit: "%/an", pct: true },
    { key: "mentenantaInst_pct", grup: "OPEX (mentenanță anuală)", eticheta: "Mentenanță instalații", unit: "%/an", pct: true },
  ];

  // Catalog implicit suprascris de valorile utilizatorului (doar numerice valide).
  function mergePreturi(custom) {
    const out = Object.assign({}, PRETURI);
    if (custom) Object.keys(PRETURI).forEach((k) => {
      const v = Number(custom[k]);
      if (custom[k] != null && custom[k] !== "" && !isNaN(v) && v >= 0) out[k] = v;
    });
    return out;
  }

  const GRUPURI = ["Stingere incendiu", "Apă rece", "Canalizare", "Instalații electrice",
    "Termice & gaze", "Ventilație/climatizare", "Detecție incendiu", "Desfumare"];
  const GRUPURI_PSI = ["Stingere incendiu", "Detecție incendiu", "Desfumare"];

  function arieDesf(profile) {
    return (profile && (profile.arieDesfasurata || (profile.acNivel || 0) * (profile.nrNiveluriSupraterane || 0))) || 0;
  }

  // ---------- COST extins (toate specialitățile) ----------
  function estimareCost(bundle, preturi = PRETURI) {
    const { dim, apa, canalizare, electrice, gaze, sisteme, profile } = bundle;
    const arie = arieDesf(profile);
    const lines = [];
    const add = (specialitate, eticheta, qty, unit, pretUnit) => {
      if (qty > 0 && pretUnit > 0) lines.push({ specialitate, eticheta, qty: r0(qty * 100) / 100, unit, pretUnit, total: r0(qty * pretUnit) });
    };

    // --- Stingere incendiu ---
    if (dim) {
      if (dim.rezervor) add("Stingere incendiu", "Rezervor de incendiu (beton armat)", dim.rezervor.adoptat, "m³", preturi.rezervorBeton_eur_mc);
      add("Stingere incendiu", "Grup de pompare incendiu (atestat IGSU)", 1, "buc", preturi.grupPompare_eur);
      const sprink = (dim.sisteme || []).find((s) => s.sistem && s.sistem.startsWith("Sprinklere"));
      if (sprink && sprink.capeteTotal) {
        add("Stingere incendiu", "Capete sprinkler montate", sprink.capeteTotal, "buc", preturi.sprinkler_eur_cap);
        add("Stingere incendiu", "Stații centrale de alarmare sprinklere", Math.max(1, Math.ceil((sprink.capeteTotal * 12) / 1000)), "buc", preturi.statieAlarmare_eur);
      }
      const hExt = (dim.sisteme || []).find((s) => s.sistem === "Hidranți exteriori");
      if (hExt && hExt.nrHidranti) add("Stingere incendiu", "Hidranți exteriori", hExt.nrHidranti, "buc", preturi.hidrantExterior_eur_buc);
      const nrHidrInt = arie ? Math.max(2, Math.round(arie / 250)) : 0;
      if (nrHidrInt) add("Stingere incendiu", "Cutii hidranți interiori (estimare)", nrHidrInt, "buc", preturi.hidrantInterior_eur_buc);
    }

    // --- Apă rece ---
    if (apa) {
      if (apa.rezervor) add("Apă rece", "Rezervor de consum", apa.rezervor.adoptat, "m³", preturi.rezervorConsum_eur_mc);
      add("Apă rece", "Stație de hidrofor", 1, "buc", preturi.hidrofor_eur);
      if (arie) add("Apă rece", "Rețele distribuție apă rece (estimare)", arie, "m²", preturi.reteleApa_eur_mp);
    }

    // --- Canalizare ---
    if (canalizare) {
      const nrSep = (canalizare.separatoare && canalizare.separatoare.length) || 0;
      if (nrSep) add("Canalizare", "Separatoare (hidrocarburi/grăsimi)", nrSep, "buc", preturi.separator_eur);
      if (arie) add("Canalizare", "Rețele canalizare menajeră + pluvială (estimare)", arie, "m²", preturi.reteleCanalizare_eur_mp);
    }

    // --- Instalații electrice ---
    if (electrice) {
      if (electrice.trafo) add("Instalații electrice", "Post de transformare", electrice.trafo, "kVA", preturi.postTrafo_eur_kva);
      if (electrice.ge) add("Instalații electrice", "Grup electrogen (consumatori vitali)", electrice.ge, "kVA", preturi.grupElectrogen_eur_kva);
      if (arie) add("Instalații electrice", "Tablouri + distribuție electrică (estimare)", arie, "m²", preturi.tablouriRetele_eur_mp);
    }

    // --- Termice & gaze ---
    if (sisteme && sisteme.termice) {
      add("Termice & gaze", "Centrală termică pe gaz (cazane condensare)", sisteme.termice.Pinc, "kW", preturi.centralaTermica_eur_kw);
      add("Termice & gaze", "Chiller / pompă de căldură", sisteme.termice.Prac, "kW frig", preturi.chiller_eur_kw);
    }
    if (gaze) add("Termice & gaze", "Post reglare-măsurare gaz (PRM)", 1, "buc", preturi.prm_eur);

    // --- Ventilație / climatizare ---
    if (sisteme && sisteme.ventilatie) {
      add("Ventilație/climatizare", "CTA aer proaspăt cu recuperare", sisteme.ventilatie.aerCamere, "mc/h", preturi.cta_eur_mc_h);
      if (sisteme.ventilatie.aerParcaj) add("Ventilație/climatizare", "Ventilație parcaj (sonde CO)", sisteme.ventilatie.aerParcaj, "mc/h", preturi.ventilatieParcaj_eur_mc_h);
    }

    // --- Detecție incendiu ---
    if (sisteme && sisteme.detectie) {
      add("Detecție incendiu", "Centrală adresabilă + bucle", 1, "buc", preturi.detectieCentrala_eur);
      if (arie) add("Detecție incendiu", "Detectoare + cablare (estimare)", arie, "m²", preturi.detectie_eur_mp);
    }

    // --- Desfumare ---
    if (sisteme && sisteme.desfumare && sisteme.desfumare.necesar) {
      const d = sisteme.desfumare;
      add("Desfumare", "Ventilatoare desfumare F400/120", Math.max(1, Math.ceil(d.Qparcaj / 30000)), "buc", preturi.ventilatorF400_eur_buc);
      add("Desfumare", "Ventilatoare presurizare case de scară", Math.max(1, Math.round(d.Qpresurizare / 12000)), "buc", preturi.presurizare_eur_buc);
    }

    // Grupare pe specialitate
    const total = lines.reduce((s, l) => s + l.total, 0);
    const grupuri = GRUPURI.map((g) => {
      const t = lines.filter((l) => l.specialitate === g).reduce((s, l) => s + l.total, 0);
      return { specialitate: g, total: t, pct: total ? Math.round((t / total) * 100) : 0 };
    }).filter((g) => g.total > 0);

    // OPEX orientativ (mentenanță anuală)
    const capexPSI = grupuri.filter((g) => GRUPURI_PSI.includes(g.specialitate)).reduce((s, g) => s + g.total, 0);
    const capexInst = total - capexPSI;
    const opexAnual = r0(capexPSI * preturi.mentenantaPSI_pct + capexInst * preturi.mentenantaInst_pct);
    const perMp = arie ? r0(total / arie) : 0;

    return { lines, grupuri, total: r0(total), perMp, opexAnual, arie, moneda: "EUR" };
  }

  // ---------- RISC: matrice probabilitate × impact ----------
  const PROB = { mica: 1, medie: 2, mare: 3 };
  const IMPACT = { mic: 1, mediu: 2, mare: 3, critic: 4 };
  function nivelRisc(prob, impact) {
    const s = (PROB[prob] || 1) * (IMPACT[impact] || 1);
    if (s >= 8) return "critic";
    if (s >= 6) return "ridicat";
    if (s >= 3) return "moderat";
    return "scăzut";
  }

  function matriceRisc(bundle) {
    const { dim, electrice, sisteme } = bundle;
    const R = [];
    const push = (categorie, descriere, prob, impact, masura) => R.push({ categorie, descriere, probabilitate: prob, impact, nivel: nivelRisc(prob, impact), masura });

    push("Conformitate ISU", "Respingerea documentației la avizarea ISU", "mica", "mare",
      "Scenariu de securitate la incendiu + breviar de calcul transparent atașat documentației.");
    push("Predimensionare", "Modificarea cantităților la faza PT (nr. capete sprinkler, calcul hidraulic SR EN 12845 cap. 13)", "medie", "mediu",
      "Marjă de proiectare aplicată; recalcul hidraulic complet la Proiectul Tehnic.");
    push("Date de intrare", "Ipoteze neconfirmate (nivel stabilitate, volum compartiment, dotări)", "medie", "mediu",
      "Confirmarea ipotezelor cu beneficiarul și proiectantul de structură înainte de PT.");
    if (electrice && electrice.S) push("Putere electrică", `Depășirea puterii aprobate de operator (S = ${electrice.S} kVA)`, "mica", "mare",
      "Solicitare ATR din timp; grup electrogen pe consumatorii vitali (I7/2023).");
    push("Racordare utilități", "Capacitate insuficientă în rețelele publice (apă/canal/gaz)", "medie", "mare",
      "Aviz de amplasament + studii de la operatori înainte de faza PT.");
    push("Cost", "Variația prețurilor materialelor față de catalogul orientativ", "mare", "mediu",
      "Actualizarea catalogului de prețuri la faza de ofertare; bugetare cu marjă.");
    if (sisteme && sisteme.desfumare && sisteme.desfumare.necesar) push("Desfumare", "Performanța evacuării fumului în parcajul subteran", "mica", "critic",
      "Ventilatoare F400/120, scenariu de desfumare, probe de funcționare la recepție.");

    return R;
  }

  // ---------- BENEFICIU (cuantificat unde se poate) ----------
  function beneficii(bundle) {
    const { dim, electrice, gaze, sisteme } = bundle;
    const B = [];
    B.push({ text: "Conformitate cu normativele în vigoare (P118, NP 127, I9, I7, I5, I13, SR EN 12845).", cuantificare: "reduce riscul de respingere ISU și timpul de avizare" });
    if (dim && dim.rezervor) B.push({ text: "Rezervă intangibilă de incendiu dimensionată corect.", cuantificare: `${dim.rezervor.adoptat} m³ — siguranța evacuării și a intervenției` });
    if (sisteme && sisteme.ventilatie) B.push({ text: "CTA cu recuperare de căldură.", cuantificare: `recuperare ≥ ${sisteme.ventilatie.recuperare}% din energia aerului evacuat (EPBD / I5)` });
    if (sisteme && sisteme.termice) B.push({ text: "Cazane în condensare + chiller reversibil (pompă de căldură).", cuantificare: "randament > 95%; încălzire și răcire eficiente" });
    if (electrice && electrice.ge) B.push({ text: "Grup electrogen pe consumatorii vitali.", cuantificare: `${electrice.ge} kVA — continuitate la pană de tensiune (I7/2023)` });
    if (gaze) B.push({ text: "Alimentare cu gaze dimensionată pe consumul real.", cuantificare: `q = ${gaze.q} mc/h, PRM ${gaze.prm} mc/h` });
    B.push({ text: "Breviar de calcul transparent — fiecare valoare justificată prin formulă și articol de normativ.", cuantificare: "trasabilitate completă, decizii defendabile la avizare" });
    return B;
  }

  // ---------- Sinteză ----------
  function sinteza(cost) {
    const principal = cost.grupuri.slice().sort((a, b) => b.total - a.total)[0] || null;
    return {
      capex: cost.total, capexPerMp: cost.perMp, opexAnual: cost.opexAnual,
      nrSpecialitati: cost.grupuri.length,
      specialitatePrincipala: principal ? { specialitate: principal.specialitate, total: principal.total, pct: principal.pct } : null,
    };
  }

  function analizaExtinsa(bundle, preturi) {
    const cost = estimareCost(bundle, preturi);
    return { cost, risc: matriceRisc(bundle), beneficiu: beneficii(bundle), sinteza: sinteza(cost) };
  }

  const api = { PRETURI, PRETURI_META, mergePreturi, GRUPURI, nivelRisc, estimareCost, matriceRisc, beneficii, sinteza, analizaExtinsa };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CRB = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
