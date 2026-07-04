/* ===== SOWILO Dimensionare — CANTITĂȚI DE DISTRIBUȚIE (antemăsurătoare estimativă) =====
   Derivă determinist cantitățile de execuție pe care echipamentele mari nu le acoperă:
   conducte, fitinguri, cablu, tablouri, aparataje, corpuri de iluminat, tubulatură,
   grile, ventilatoare de parcaj, detectoare, obiecte sanitare etc.
   Coeficienții sunt indici de proiectare uzuali (CALIBRARE — orientativi, faza DTAC);
   fiecare item are cheia de preț din catalogul editabil (crb.js → PRETURI).
*/
(function (root) {
  "use strict";
  const r0 = (n) => Math.round(n);
  const c0 = (n) => Math.max(0, Math.ceil(n));

  // Indici de derivare (CALIBRARE — pe m² arie desfășurată dacă nu e precizat altfel)
  const K = {
    apa_ml_mp: 0.35,           // ml conductă apă rece+caldă / m²
    termice_ml_mp: 0.25,       // ml conductă distribuție termică / m²
    canal_ml_mp: 0.15,         // ml conductă canalizare / m²
    corp_mp: 40,               // 1 corp de încălzire (radiator/ventiloconvector) / 40 m²
    cablu_ml_mp: 3.5,          // ml cablu / m² (mediu, toate circuitele)
    aparataj_mp: 12,           // 1 aparataj (priză/întrerupător) / 12 m²
    iluminat_mp: 10,           // 1 corp de iluminat / 10 m²
    tubulatura_mch: 100,       // 1 m² tubulatură / 100 mc/h aer vehiculat
    grila_mch: 300,            // 1 grilă/anemostat / 300 mc/h
    jetfan_mp_parcaj: 500,     // 1 jet-fan / 500 m² parcaj
    tubulaturaEI_mch: 125,     // 1 m² tubulatură EI / 125 mc/h desfumare
    volet_mch: 5000,           // 1 volet/grilă desfumare / 5.000 mc/h
    detector_mp: 60,           // 1 detector / 60 m² (P118/3 — arie medie acoperită)
    cabluDetectie_ml_mp: 0.8,  // ml cablu detecție / m²
    butonSirena_mp: 400,       // 1 buton/sirenă / 400 m²
    teavaPSI_ml_cap: 3,        // ml țeavă oțel / cap sprinkler
    teavaPSI_ml_hidrant: 20,   // ml țeavă oțel / hidrant
    grupSanitar_pers: 20,      // 1 grup sanitar / 20 persoane (non-cazare)
  };

  function cantitati(bundle = {}) {
    const { profile = {}, dim, apa, canalizare, electrice, gaze, sisteme } = bundle;
    const arie = profile.arieDesfasurata || (profile.acNivel || 0) * (profile.nrNiveluriSupraterane || 0) || 0;
    const parcaj = profile.parcaj || {};
    const items = [];
    const add = (specialitate, eticheta, qty, unit, pretKey) => { if (qty > 0) items.push({ specialitate, eticheta, qty: r0(qty), unit, pretKey }); };

    // --- Apă rece / sanitare ---
    if (apa && arie) {
      add("Apă rece", "Conducte distribuție apă (PPR/PEX izolate, montate)", arie * K.apa_ml_mp, "ml", "conductaApa_eur_ml");
      // obiecte sanitare: pe unități de cazare/locuit sau pe grupuri sanitare
      const tip = profile.tip;
      if (tip === "turism" && profile.nrCamere) add("Apă rece", "Seturi obiecte sanitare (baie completă)", profile.nrCamere, "buc", "setBaie_eur");
      else if (tip === "rezidential" && profile.nrApartamente) add("Apă rece", "Seturi obiecte sanitare (baie + bucătărie)", profile.nrApartamente, "buc", "setBaie_eur");
      else if (profile.persoane) add("Apă rece", "Grupuri sanitare echipate", c0(profile.persoane / K.grupSanitar_pers), "buc", "setBaie_eur");
    }

    // --- Canalizare ---
    if (canalizare && arie) add("Canalizare", "Conducte canalizare (PP/PVC, montate)", arie * K.canal_ml_mp, "ml", "conductaCanal_eur_ml");

    // --- Termice (distribuție + corpuri) ---
    if (sisteme && sisteme.termice && arie) {
      add("Termice & gaze", "Conducte distribuție termică (izolate, montate)", arie * K.termice_ml_mp, "ml", "conductaTermica_eur_ml");
      add("Termice & gaze", "Corpuri de încălzire (radiatoare/ventiloconvectoare)", c0(arie / K.corp_mp), "buc", "corpIncalzire_eur_buc");
    }
    if (gaze) add("Termice & gaze", "Conductă gaz interioară + fitinguri (montată)", 40 + arie * 0.005, "ml", "conductaGaz_eur_ml");

    // --- Electrice (distribuție) ---
    if (electrice && arie) {
      add("Instalații electrice", "Cabluri (toate circuitele, pozate)", arie * K.cablu_ml_mp, "ml", "cablu_eur_ml");
      add("Instalații electrice", "Tablouri electrice (general + niveluri + tehnice)", 2 + (profile.nrNiveluriSupraterane || 0) + (parcaj.nrNiveluri || 0), "buc", "tablou_eur_buc");
      add("Instalații electrice", "Aparataje (prize, întrerupătoare, montate)", c0(arie / K.aparataj_mp), "buc", "aparataj_eur_buc");
      add("Instalații electrice", "Corpuri de iluminat (montate)", c0(arie / K.iluminat_mp), "buc", "corpIluminat_eur_buc");
    }

    // --- Ventilație / climatizare ---
    if (sisteme && sisteme.ventilatie) {
      const aer = (sisteme.ventilatie.aerCamere || 0) + (sisteme.ventilatie.aerParcaj || 0);
      if (aer) {
        add("Ventilație/climatizare", "Tubulatură ventilație (tablă zincată, montată)", aer / K.tubulatura_mch, "m²", "tubulatura_eur_mp");
        add("Ventilație/climatizare", "Grile + anemostate (montate)", c0(aer / K.grila_mch), "buc", "grila_eur_buc");
      }
      if (parcaj.arieProtejata) add("Ventilație/climatizare", "Ventilatoare de impuls parcaj (jet-fan)", c0(parcaj.arieProtejata / K.jetfan_mp_parcaj), "buc", "jetFan_eur_buc");
    }

    // --- Desfumare ---
    if (sisteme && sisteme.desfumare && sisteme.desfumare.necesar) {
      const Q = sisteme.desfumare.Qparcaj || 0;
      add("Desfumare", "Tubulatură desfumare EI (rezistentă la foc, montată)", Q / K.tubulaturaEI_mch, "m²", "tubulaturaEI_eur_mp");
      add("Desfumare", "Voleti / grile de desfumare (montate)", c0(Q / K.volet_mch), "buc", "voletDesfumare_eur_buc");
    }

    // --- Detecție incendiu ---
    if (sisteme && sisteme.detectie && arie) {
      add("Detecție incendiu", "Detectoare (optice/multicriteriale, montate)", c0(arie / K.detector_mp), "buc", "detector_eur_buc");
      add("Detecție incendiu", "Cablu detecție (JE-H(St)H, pozat)", arie * K.cabluDetectie_ml_mp, "ml", "cabluDetectie_eur_ml");
      add("Detecție incendiu", "Butoane manuale + sirene (montate)", c0(arie / K.butonSirena_mp), "buc", "butonSirena_eur_buc");
    }

    // --- Stingere (rețele de țeavă) ---
    if (dim) {
      const sprink = (dim.sisteme || []).find((s) => s.sistem && s.sistem.startsWith("Sprinklere"));
      const hExt = (dim.sisteme || []).find((s) => s.sistem === "Hidranți exteriori");
      const nrHidrInt = arie ? Math.max(2, r0(arie / 250)) : 0;
      const ml = (sprink && sprink.capeteTotal ? sprink.capeteTotal * K.teavaPSI_ml_cap : 0) +
        (nrHidrInt + (hExt && hExt.necesar ? hExt.nrHidranti || 0 : 0)) * K.teavaPSI_ml_hidrant;
      if (ml) add("Stingere incendiu", "Rețele țeavă oțel zincat PSI (montate, vopsite)", ml, "ml", "teavaPSI_eur_ml");
    }

    return items;
  }

  const api = { cantitati, K };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CANTITATI = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
