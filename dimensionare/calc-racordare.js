/* ===== SOWILO Dimensionare — RACORDARE LA UTILITĂȚI (solicitări către operatori) =====
   Din debitele/puterile deterministe deja calculate compune, pentru fiecare utilitate:
   valoarea de solicitat operatorului, un semafor de risc de capacitate (orientativ),
   termenul tipic și — la electric — estimarea garanției de racordare (ANRE, €/kW).
   Toate estimările sunt PRELIMINARE, de confirmat cu operatorul.
*/
(function (root) {
  "use strict";
  const r0 = (n) => Math.round(n);

  const C = {
    garantie_eur_kw: 30,          // ANRE — garanție de racordare, €/kW putere aprobată
    // Praguri orientative de risc de capacitate (de confirmat cu operatorul)
    electric_kva_mt: 1000,        // peste ~1 MVA → racordare la medie tensiune, posibilă întărire rețea
    electric_kva_atentie: 400,
    apa_ls_atentie: 15,           // debit mare → posibilă capacitate insuficientă
    gaz_mch_presiune: 100,        // debit mare → presiune medie / stație de reglare
  };

  const nivelDin = (val, atentie, ridicat) => (val >= ridicat ? "ridicat" : val >= atentie ? "moderat" : "scăzut");

  function dimensionareRacordare(bundle = {}) {
    const { electrice, apa, canalizare, gaze, dim, profile } = bundle;
    const util = [];

    // --- Energie electrică (ATR) ---
    if (electrice) {
      const putere = electrice.Pa || 0;           // putere absorbită ≈ putere de racordare solicitată
      const garantie = r0(putere * C.garantie_eur_kw);
      const nivel = nivelDin(electrice.S || 0, C.electric_kva_atentie, C.electric_kva_mt);
      const mt = (electrice.S || 0) >= C.electric_kva_mt;
      util.push({
        cheie: "electric", utilitate: "Energie electrică", operator: "Operator de distribuție (ex. Distribuție Energie / rețele locale)",
        document: "Aviz tehnic de racordare (ATR)", nivel,
        solicitare: `Putere de racordare ≈ ${putere} kW (Pi ${electrice.Pi} kW · S ${electrice.S} kVA)${mt ? " — racordare la medie tensiune, post propriu de transformare" : ""}.`,
        cost: `Garanție de racordare ≈ ${garantie.toLocaleString("ro-RO")} € (${C.garantie_eur_kw} €/kW, ANRE)${mt ? "; posibilă întărire de rețea — de confirmat" : ""}.`,
        termen: "ATR emis în max 30 zile calendaristice de la dosar complet; contract de racordare semnat în 12 luni.",
        valoare: garantie,
      });
    }

    // --- Apă rece (aviz de racordare apă) ---
    if (apa && apa.debite) {
      const ls = apa.debite.Qmax_orar_ls || 0;
      util.push({
        cheie: "apa", utilitate: "Alimentare cu apă", operator: "Operator apă-canal (ex. Apa Nova / ACET / regie locală)",
        document: "Aviz de racordare apă", nivel: nivelDin(ls, C.apa_ls_atentie, C.apa_ls_atentie * 2),
        solicitare: `Debit de calcul Qmax orar ≈ ${apa.debite.Qmax_orar_mc} mc/h (${ls} l/s), branșament ${apa.debite.dn}, presiune ≥ ${apa.debite.presiune_bar} bar.`,
        cost: "Cost branșament — de ofertat de operator/executant autorizat.",
        termen: "Avizul definitiv se emite pe proiectul de execuție al branșamentului.",
        valoare: 0,
      });
    }

    // --- Canalizare (aviz de racordare canal) ---
    if (canalizare && canalizare.menajera) {
      const men = canalizare.menajera.Qu_orar_ls || 0;
      const pluv = canalizare.pluviala && canalizare.pluviala.necesar ? canalizare.pluviala.Q : 0;
      util.push({
        cheie: "canal", utilitate: "Canalizare", operator: "Operator apă-canal",
        document: "Aviz de racordare canalizare", nivel: nivelDin(men + pluv, 40, 80),
        solicitare: `Debit menajer ≈ ${men} l/s${pluv ? ` + pluvial ≈ ${pluv} l/s` : ""}, racord ${canalizare.menajera.dn}.${(canalizare.separatoare && canalizare.separatoare.length) ? " Separatoare obligatorii înainte de racord." : ""}`,
        cost: "Cost racord — de ofertat de operator/executant autorizat.",
        termen: "Se corelează cu avizul de apă și cu descărcarea pluvială aprobată.",
        valoare: 0,
      });
    }

    // --- Gaze naturale (cerere de racordare) ---
    if (gaze) {
      const q = gaze.q || 0;
      const presiuneMedie = q >= C.gaz_mch_presiune;
      util.push({
        cheie: "gaz", utilitate: "Gaze naturale", operator: "Operator de distribuție gaz (ex. Distrigaz Sud / Delgaz Grid)",
        document: "Cerere de racordare gaz", nivel: nivelDin(q, C.gaz_mch_presiune, C.gaz_mch_presiune * 3),
        solicitare: `Debit instalat q ≈ ${q} mc/h, PRM ${gaze.prm} mc/h${presiuneMedie ? " — probabil presiune medie, stație de reglare-măsurare dedicată" : ""}.`,
        cost: "Cost racord + PRM — de ofertat de operator.",
        termen: "Operatorul analizează în max 30 zile lucrătoare; racordare completă tipic ~3–4 luni.",
        valoare: 0,
      });
    }

    // --- ISU (aviz/autorizație de securitate la incendiu) ---
    const nivInalt = (profile && profile.inaltimeUltimPlanseu || 0) >= 28;
    const colectivInalt = profile && profile.tip === "rezidential" && (profile.nrNiveluriSupraterane || 0) > 4;
    const oblig = dim && dim.obligativitate && dim.obligativitate.some((o) => o.obligatoriu);
    const isuNecesar = !!((profile && profile.saliAglomerate) || nivInalt || colectivInalt || oblig);
    util.push({
      cheie: "isu", utilitate: "Securitate la incendiu (ISU)", operator: "Inspectoratul pentru Situații de Urgență (ISU)",
      document: "Aviz / autorizație de securitate la incendiu (HG 571/2016)", nivel: isuNecesar ? "moderat" : "scăzut",
      solicitare: isuNecesar
        ? `OBLIGATORIU (HG 571/2016) — se întocmește scenariul de securitate la incendiu; bază: ${[profile && profile.saliAglomerate ? "săli aglomerate" : null, nivInalt ? "clădire înaltă" : null, colectivInalt ? "colective >4 niveluri" : null, oblig ? "sisteme PSI obligatorii" : null].filter(Boolean).join(", ")}.`
        : "Probabil neobligatoriu — de verificat încadrarea în HG 571/2016 pentru clădirea concretă.",
      cost: "Onorariu scenariu + taxă ISU — de ofertat.",
      termen: "Aviz în 15 zile lucrătoare; autorizație în 30 zile după controlul la fața locului.",
      valoare: 0,
    });

    // --- Sinteză / semafor general + termen critic ---
    const ordine = { "scăzut": 0, "moderat": 1, "ridicat": 2, "critic": 3 };
    const verdict = util.reduce((acc, u) => (ordine[u.nivel] > ordine[acc] ? u.nivel : acc), "scăzut");
    const garantieElectric = (util.find((u) => u.cheie === "electric") || {}).valoare || 0;

    const timeline = [
      { pas: "ATR energie electrică", durata: "≤ 30 zile", nota: "operator distribuție" },
      { pas: "Cerere racordare gaz", durata: "~3–4 luni", nota: "cel mai lung — de pornit devreme" },
      { pas: "Avize apă-canal", durata: "pe proiectul de execuție", nota: "operator apă-canal" },
      { pas: "Aviz ISU", durata: "15 zile lucrătoare", nota: "autorizație +30 zile după control" },
    ];

    return { utilitati: util, verdict, garantieElectric, timeline,
      nota: "Estimări preliminare (faza DTAC), sub responsabilitatea proiectantului; capacitățile și costurile de racordare se confirmă cu operatorii." };
  }

  const api = { C, dimensionareRacordare };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RACORDARE = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
