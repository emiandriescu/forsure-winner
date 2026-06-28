/* ===== SOWILO Dimensionare — Cost / Risc / Beneficiu (integrat) =====
   Estimare CAPEX din cantitățile rezultate determinist + indicatori de risc și beneficiu.
   Prețurile sunt un catalog editabil (orientativ); se ajustează de utilizator.
*/
(function (root) {
  "use strict";

  // Catalog orientativ de prețuri (EUR) — editabil din aplicație în viitor.
  const PRETURI = {
    rezervorBeton_eur_mc: 350,          // rezervor incendiu beton armat, €/m³ util
    grupPompare_eur: 18000,             // grup pompare complet, atestat IGSU
    sprinkler_eur_cap: 28,              // cap sprinkler montat (cap + țeavă aferentă)
    hidrantInterior_eur_buc: 650,       // cutie hidrant interior echipată
    hidrantExterior_eur_buc: 2200,      // hidrant exterior subteran/suprateran + racord
    statieAlarmare_eur: 3500,           // stație centrală de alarmare per ~1.000 m²
  };

  function estimareCost(dim, preturi = PRETURI) {
    const lines = [];
    const add = (eticheta, qty, unit, pretUnit) => {
      const total = qty * pretUnit;
      if (qty > 0) lines.push({ eticheta, qty, unit, pretUnit, total: Math.round(total) });
    };

    if (dim.rezervor) add("Rezervor de incendiu (beton armat)", dim.rezervor.adoptat, "m³", preturi.rezervorBeton_eur_mc);
    add("Grup de pompare incendiu (atestat IGSU)", 1, "buc", preturi.grupPompare_eur);

    const sprink = dim.sisteme.find((s) => s.sistem && s.sistem.startsWith("Sprinklere"));
    if (sprink && sprink.capeteTotal) {
      add("Capete sprinkler montate", sprink.capeteTotal, "buc", preturi.sprinkler_eur_cap);
      const statii = Math.max(1, Math.ceil((sprink.capeteTotal * 12) / 1000)); // ~1 stație/1.000 m²
      add("Stații centrale de alarmare sprinklere", statii, "buc", preturi.statieAlarmare_eur);
    }
    const hExt = dim.sisteme.find((s) => s.sistem === "Hidranți exteriori");
    if (hExt && hExt.nrHidranti) add("Hidranți exteriori", hExt.nrHidranti, "buc", preturi.hidrantExterior_eur_buc);
    // hidranți interiori — estimare grosieră după arie (1 cutie / ~250 m² acoperire raza 25 m)
    const ariaTotala = (dim.profile.acNivel || 0) * (dim.profile.nrNiveluriSupraterane || 0);
    const nrHidrInt = ariaTotala ? Math.max(2, Math.round(ariaTotala / 250)) : 0;
    if (nrHidrInt) add("Cutii hidranți interiori (estimare)", nrHidrInt, "buc", preturi.hidrantInterior_eur_buc);

    const total = lines.reduce((s, l) => s + l.total, 0);
    return { lines, total: Math.round(total), moneda: "EUR" };
  }

  function analizaRiscBeneficiu(dim) {
    const risc = [];
    const beneficiu = [];

    // Risc: încadrare și marje
    dim.obligativitate.forEach((o) => {
      if (o.obligatoriu) risc.push({ nivel: "info", text: `${o.sistem}: OBLIGATORIU — ${o.motiv}` });
    });
    risc.push({ nivel: "atentie", text: "Dimensionările sunt preliminare (faza DTAC). Numărul exact de capete sprinkler și calculul hidraulic complet (SR EN 12845 cap. 13) se confirmă la Proiectul Tehnic." });
    risc.push({ nivel: "atentie", text: "Scenariul de securitate la incendiu și avizul ISU validează ipotezele (compartimentare, nr. hidranți, nivel stabilitate)." });
    if (dim.profile.nivelStabilitate && dim.profile.nivelStabilitate !== "I" && dim.profile.nivelStabilitate !== "II") {
      risc.push({ nivel: "important", text: "Nivelul de stabilitate la foc influențează direct qee și rezerva — de confirmat cu proiectantul de structură." });
    }

    // Beneficiu
    beneficiu.push({ text: "Conformitate cu normativele în vigoare (P118, NP 127, SR EN 12845) — bază solidă pentru avizare ISU." });
    beneficiu.push({ text: `Rezervă intangibilă dimensionată corect (${dim.rezervor.adoptat} m³) — siguranța evacuării și a intervenției pompierilor.` });
    beneficiu.push({ text: "Breviar de calcul transparent (fiecare valoare justificată prin formulă și articol de normativ) — reduce timpul de avizare și riscul de respingere." });

    return { risc, beneficiu };
  }

  function costRiscBeneficiu(dim, preturi) {
    const cost = estimareCost(dim, preturi);
    const { risc, beneficiu } = analizaRiscBeneficiu(dim);
    return { cost, risc, beneficiu };
  }

  const api = { PRETURI, estimareCost, analizaRiscBeneficiu, costRiscBeneficiu };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CRB = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
