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
    // Canalizare
    separator_eur: 4000,              // separator (hidrocarburi / grăsimi)
    // Instalații electrice
    postTrafo_eur_kva: 45,            // post de transformare, €/kVA
    grupElectrogen_eur_kva: 220,      // grup electrogen, €/kVA
    // Termice & gaze
    centralaTermica_eur_kw: 95,       // centrală termică pe gaz, €/kW
    chiller_eur_kw: 320,              // chiller/pompă de căldură, €/kW frig
    prm_eur: 6000,                    // post reglare-măsurare gaz
    // Ventilație / climatizare
    cta_eur_mc_h: 4.5,                // CTA cu recuperare, € per mc/h aer tratat
    ventilatieParcaj_eur_mc_h: 1.2,   // ventilație parcaj (jet/extract), € per mc/h
    // Detecție incendiu
    detectieCentrala_eur: 6000,       // centrală adresabilă
    // Desfumare
    ventilatorF400_eur_buc: 5500,     // ventilator F400/120 (~30.000 mc/h)
    presurizare_eur_buc: 7000,        // ventilator presurizare casă de scară
    // Distribuții / cantități de execuție (conducte, cablu, aparataje, tubulatură...) — montate
    conductaApa_eur_ml: 18,           // conductă apă rece+caldă (PPR/PEX izolat), €/ml
    setBaie_eur: 900,                 // set obiecte sanitare / cameră-apartament (vas, lavoar, cadă/duș, baterii)
    conductaCanal_eur_ml: 16,         // conductă canalizare (PP/PVC), €/ml
    conductaTermica_eur_ml: 22,       // conductă distribuție termică izolată, €/ml
    corpIncalzire_eur_buc: 280,       // radiator / ventiloconvector montat
    conductaGaz_eur_ml: 20,           // conductă gaz interioară + fitinguri, €/ml
    cablu_eur_ml: 4.5,                // cablu electric (medie toate circuitele), €/ml
    tablou_eur_buc: 2200,             // tablou electric echipat
    aparataj_eur_buc: 22,             // aparataj (priză/întrerupător) montat
    corpIluminat_eur_buc: 55,         // corp de iluminat montat
    tubulatura_eur_mp: 45,            // tubulatură ventilație (tablă zincată), €/m² suprafață
    grila_eur_buc: 65,                // grilă/anemostat montat
    jetFan_eur_buc: 1400,             // ventilator de impuls parcaj (jet-fan)
    tubulaturaEI_eur_mp: 90,          // tubulatură desfumare EI, €/m² suprafață
    voletDesfumare_eur_buc: 550,      // volet/grilă de desfumare
    detector_eur_buc: 55,             // detector (optic/multicriterial) montat
    cabluDetectie_eur_ml: 3.5,        // cablu detecție (JE-H(St)H), €/ml
    butonSirena_eur_buc: 120,         // buton manual / sirenă
    teavaPSI_eur_ml: 32,              // țeavă oțel zincat PSI (montată, vopsită), €/ml
    // Echipamente auxiliare termice / apă
    puffer_eur_buc: 2500,             // puffer / rezervor tampon
    butelieEgalizare_eur_buc: 900,    // butelie de egalizare a presiunilor
    distribuitorColector_eur_buc: 1800, // distribuitor / colector
    vasExpansiune_eur_buc: 650,       // vas de expansiune cu membrană
    pompaCirculatie_eur_buc: 1200,    // pompă de circulație cu turație variabilă
    boilerACM_eur_buc: 3500,          // preparare apă caldă (boiler/schimbător) / stație pompare ape uzate
    dedurizator_eur_buc: 2500,        // stație de dedurizare / tratare
    ups_eur_buc: 4000,                // UPS consumatori critici
    // Armături și accesorii
    robinetSferic_eur_buc: 35,        // robinet sferic de izolare
    robinetSertar_eur_buc: 150,       // robinet cu sertar / fluture / cu flanșe (DN mari)
    clapetaSens_eur_buc: 90,          // clapetă de sens / antiretur
    filtruY_eur_buc: 70,              // filtru Y / separator de impurități
    mansonAntivibrant_eur_buc: 45,    // manșon antivibrant
    reductorPresiune_eur_buc: 160,    // reductor de presiune
    sifonPardoseala_eur_buc: 40,      // sifon de pardoseală
    clapetaReglaj_eur_buc: 60,        // clapetă de reglaj debit aer
    clapetaAntifoc_eur_buc: 180,      // clapetă antifoc (rezistentă la foc)
    // Distribuție — accesorii de pozare
    jgheabCablu_eur_ml: 12,           // jgheab / pat de cablu metalic, €/ml
    tubProtectie_eur_ml: 3,           // tub de protecție / copex, €/ml
    // OPEX (mentenanță anuală, % din CAPEX)
    mentenantaPSI_pct: 0.02,          // PSI (stingere/detecție/desfumare)
    mentenantaInst_pct: 0.015,        // restul instalațiilor
  };

  // Metadate pentru catalogul editabil din UI (etichetă, unitate, grup). pct: valoarea e fracție (afișată în %).
  const PRETURI_META = [
    { key: "rezervorBeton_eur_mc", grup: "Stingere incendiu", eticheta: "Rezervor incendiu (beton)", unit: "€/m³" },
    { key: "grupPompare_eur", grup: "Stingere incendiu", eticheta: "Grup de pompare", unit: "€" },
    { key: "sprinkler_eur_cap", grup: "Stingere incendiu", eticheta: "Cap sprinkler montat", unit: "€/buc" },
    { key: "teavaPSI_eur_ml", grup: "Stingere incendiu", eticheta: "Țeavă oțel PSI (montată)", unit: "€/ml" },
    { key: "hidrantInterior_eur_buc", grup: "Stingere incendiu", eticheta: "Cutie hidrant interior", unit: "€/buc" },
    { key: "hidrantExterior_eur_buc", grup: "Stingere incendiu", eticheta: "Hidrant exterior", unit: "€/buc" },
    { key: "statieAlarmare_eur", grup: "Stingere incendiu", eticheta: "Stație alarmare sprinklere", unit: "€/buc" },
    { key: "rezervorConsum_eur_mc", grup: "Apă rece", eticheta: "Rezervor de consum", unit: "€/m³" },
    { key: "hidrofor_eur", grup: "Apă rece", eticheta: "Stație de hidrofor", unit: "€" },
    { key: "conductaApa_eur_ml", grup: "Apă rece", eticheta: "Conductă apă (montată)", unit: "€/ml" },
    { key: "setBaie_eur", grup: "Apă rece", eticheta: "Set obiecte sanitare", unit: "€/buc" },
    { key: "separator_eur", grup: "Canalizare", eticheta: "Separator", unit: "€/buc" },
    { key: "conductaCanal_eur_ml", grup: "Canalizare", eticheta: "Conductă canalizare (montată)", unit: "€/ml" },
    { key: "postTrafo_eur_kva", grup: "Instalații electrice", eticheta: "Post de transformare", unit: "€/kVA" },
    { key: "grupElectrogen_eur_kva", grup: "Instalații electrice", eticheta: "Grup electrogen", unit: "€/kVA" },
    { key: "cablu_eur_ml", grup: "Instalații electrice", eticheta: "Cablu (pozat)", unit: "€/ml" },
    { key: "tablou_eur_buc", grup: "Instalații electrice", eticheta: "Tablou electric echipat", unit: "€/buc" },
    { key: "aparataj_eur_buc", grup: "Instalații electrice", eticheta: "Aparataj (priză/întrerupător)", unit: "€/buc" },
    { key: "corpIluminat_eur_buc", grup: "Instalații electrice", eticheta: "Corp de iluminat", unit: "€/buc" },
    { key: "centralaTermica_eur_kw", grup: "Termice & gaze", eticheta: "Centrală termică gaz", unit: "€/kW" },
    { key: "chiller_eur_kw", grup: "Termice & gaze", eticheta: "Chiller / pompă de căldură", unit: "€/kW frig" },
    { key: "conductaTermica_eur_ml", grup: "Termice & gaze", eticheta: "Conductă termică (montată)", unit: "€/ml" },
    { key: "corpIncalzire_eur_buc", grup: "Termice & gaze", eticheta: "Corp încălzire (radiator/VCV)", unit: "€/buc" },
    { key: "conductaGaz_eur_ml", grup: "Termice & gaze", eticheta: "Conductă gaz (montată)", unit: "€/ml" },
    { key: "prm_eur", grup: "Termice & gaze", eticheta: "Post reglare gaz (PRM)", unit: "€" },
    { key: "cta_eur_mc_h", grup: "Ventilație/climatizare", eticheta: "CTA cu recuperare", unit: "€/(mc/h)" },
    { key: "ventilatieParcaj_eur_mc_h", grup: "Ventilație/climatizare", eticheta: "Ventilație parcaj", unit: "€/(mc/h)" },
    { key: "tubulatura_eur_mp", grup: "Ventilație/climatizare", eticheta: "Tubulatură ventilație", unit: "€/m²" },
    { key: "grila_eur_buc", grup: "Ventilație/climatizare", eticheta: "Grilă / anemostat", unit: "€/buc" },
    { key: "jetFan_eur_buc", grup: "Ventilație/climatizare", eticheta: "Ventilator impuls parcaj (jet-fan)", unit: "€/buc" },
    { key: "detectieCentrala_eur", grup: "Detecție incendiu", eticheta: "Centrală adresabilă", unit: "€" },
    { key: "detector_eur_buc", grup: "Detecție incendiu", eticheta: "Detector montat", unit: "€/buc" },
    { key: "cabluDetectie_eur_ml", grup: "Detecție incendiu", eticheta: "Cablu detecție (pozat)", unit: "€/ml" },
    { key: "butonSirena_eur_buc", grup: "Detecție incendiu", eticheta: "Buton manual / sirenă", unit: "€/buc" },
    { key: "ventilatorF400_eur_buc", grup: "Desfumare", eticheta: "Ventilator F400/120", unit: "€/buc" },
    { key: "presurizare_eur_buc", grup: "Desfumare", eticheta: "Ventilator presurizare", unit: "€/buc" },
    { key: "tubulaturaEI_eur_mp", grup: "Desfumare", eticheta: "Tubulatură desfumare EI", unit: "€/m²" },
    { key: "voletDesfumare_eur_buc", grup: "Desfumare", eticheta: "Volet / grilă desfumare", unit: "€/buc" },
    { key: "puffer_eur_buc", grup: "Termice & gaze", eticheta: "Puffer / rezervor tampon", unit: "€/buc" },
    { key: "butelieEgalizare_eur_buc", grup: "Termice & gaze", eticheta: "Butelie de egalizare", unit: "€/buc" },
    { key: "distribuitorColector_eur_buc", grup: "Termice & gaze", eticheta: "Distribuitor / colector", unit: "€/buc" },
    { key: "vasExpansiune_eur_buc", grup: "Termice & gaze", eticheta: "Vas de expansiune", unit: "€/buc" },
    { key: "pompaCirculatie_eur_buc", grup: "Termice & gaze", eticheta: "Pompă de circulație", unit: "€/buc" },
    { key: "boilerACM_eur_buc", grup: "Apă rece", eticheta: "Boiler ACM / stație pompare uzate", unit: "€/buc" },
    { key: "dedurizator_eur_buc", grup: "Apă rece", eticheta: "Stație de dedurizare", unit: "€/buc" },
    { key: "reductorPresiune_eur_buc", grup: "Apă rece", eticheta: "Reductor de presiune", unit: "€/buc" },
    { key: "sifonPardoseala_eur_buc", grup: "Canalizare", eticheta: "Sifon de pardoseală", unit: "€/buc" },
    { key: "ups_eur_buc", grup: "Instalații electrice", eticheta: "UPS (consumatori critici)", unit: "€/buc" },
    { key: "jgheabCablu_eur_ml", grup: "Instalații electrice", eticheta: "Jgheab / pat de cablu", unit: "€/ml" },
    { key: "tubProtectie_eur_ml", grup: "Instalații electrice", eticheta: "Tub de protecție / copex", unit: "€/ml" },
    { key: "clapetaReglaj_eur_buc", grup: "Ventilație/climatizare", eticheta: "Clapetă de reglaj", unit: "€/buc" },
    { key: "clapetaAntifoc_eur_buc", grup: "Ventilație/climatizare", eticheta: "Clapetă antifoc", unit: "€/buc" },
    { key: "robinetSferic_eur_buc", grup: "Armături & accesorii (comun)", eticheta: "Robinet sferic de izolare", unit: "€/buc" },
    { key: "robinetSertar_eur_buc", grup: "Armături & accesorii (comun)", eticheta: "Robinet cu sertar / fluture", unit: "€/buc" },
    { key: "clapetaSens_eur_buc", grup: "Armături & accesorii (comun)", eticheta: "Clapetă de sens / antiretur", unit: "€/buc" },
    { key: "filtruY_eur_buc", grup: "Armături & accesorii (comun)", eticheta: "Filtru Y / dezaerator", unit: "€/buc" },
    { key: "mansonAntivibrant_eur_buc", grup: "Armături & accesorii (comun)", eticheta: "Manșon antivibrant", unit: "€/buc" },
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
  // Devizul detaliat (capitole × subcapitole × poziții) e produs de deviz.js;
  // aici doar grupăm pe specialitate + calculăm OPEX/€ pe m².
  function estimareCost(bundle, preturi = PRETURI) {
    const arie = arieDesf(bundle.profile);
    const DEVIZ = root.DEVIZ || (typeof require !== "undefined" ? require("./deviz.js") : null);
    const dz = DEVIZ ? DEVIZ.construieste(bundle, preturi) : { capitole: [], lines: [], total: 0 };
    const lines = dz.lines;
    const total = dz.total;

    // Grupare pe specialitate (pentru grafice, sinteză, memoriu)
    const grupuri = GRUPURI.map((g) => {
      const t = lines.filter((l) => l.specialitate === g).reduce((s, l) => s + l.total, 0);
      return { specialitate: g, total: r0(t), pct: total ? Math.round((t / total) * 100) : 0 };
    }).filter((g) => g.total > 0);

    // OPEX orientativ (mentenanță anuală)
    const capexPSI = grupuri.filter((g) => GRUPURI_PSI.includes(g.specialitate)).reduce((s, g) => s + g.total, 0);
    const capexInst = total - capexPSI;
    const opexAnual = r0(capexPSI * preturi.mentenantaPSI_pct + capexInst * preturi.mentenantaInst_pct);
    const perMp = arie ? r0(total / arie) : 0;

    return { lines, capitole: dz.capitole, grupuri, total: r0(total), perMp, opexAnual, arie, moneda: "EUR" };
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
  const UNITATE_LABEL = { turism: "cameră", rezidential: "apartament", spital: "pat" };
  function sinteza(cost, profile) {
    const principal = cost.grupuri.slice().sort((a, b) => b.total - a.total)[0] || null;
    // cost pe unitate (€/cameră, €/apartament, €/pat) — limbajul dezvoltatorului/băncii
    let perUnitate = null, unitateLabel = null;
    const nrUnitati = profile && profile.valoareUnit > 0 ? profile.valoareUnit : 0;
    const lbl = profile && UNITATE_LABEL[profile.tip];
    if (nrUnitati && lbl && cost.total) { perUnitate = Math.round(cost.total / nrUnitati); unitateLabel = lbl; }
    return {
      capex: cost.total, capexPerMp: cost.perMp, opexAnual: cost.opexAnual,
      nrSpecialitati: cost.grupuri.length,
      perUnitate, unitateLabel,
      specialitatePrincipala: principal ? { specialitate: principal.specialitate, total: principal.total, pct: principal.pct } : null,
    };
  }

  function analizaExtinsa(bundle, preturi) {
    const cost = estimareCost(bundle, preturi);
    return { cost, risc: matriceRisc(bundle), beneficiu: beneficii(bundle), sinteza: sinteza(cost, bundle.profile) };
  }

  const api = { PRETURI, PRETURI_META, mergePreturi, GRUPURI, nivelRisc, estimareCost, matriceRisc, beneficii, sinteza, analizaExtinsa };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CRB = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
