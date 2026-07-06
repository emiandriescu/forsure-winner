/* ===== SOWILO Dimensionare — DEVIZ STRUCTURAT (antemăsurătoare pe capitole) =====
   Construiește devizul pe fiecare specialitate, împărțit în trei subcapitole:
     1. Echipamente principale (surse, agregate, tablouri, centrale…)
     2. Armături și accesorii (filtre Y, clapete de sens, manșoane antivibrante,
        robineți sferici / cu sertar, vase de expansiune etc.)
     3. Distribuție — țeavă/tubulatură/cablu pe DIAMETRE, + fitinguri + izolație +
        suporți de susținere, + corpuri terminale.
   Cantitățile de distribuție se derivă determinist din indicii de proiectare
   (calc-cantitati.js → K). Prețul „montat" per ml se descompune pe componente
   (țeavă / fitinguri / izolație / suporți) astfel încât TOTALUL rămâne calibrat,
   dar devizul e itemizat ca o antemăsurătoare reală. Echipamentele auxiliare și
   armăturile adaugă scop suplimentar (cost real, orientativ — faza DTAC).
*/
(function (root) {
  "use strict";
  const r0 = (n) => Math.round(n);
  const f2 = (n) => Math.round(n * 100) / 100;
  const cInt = (n) => Math.max(0, Math.ceil(n));

  const CANT = root.CANTITATI || (typeof require !== "undefined" ? require("./calc-cantitati.js") : null);
  const K = (CANT && CANT.K) || { apa_ml_mp: 0.35, termice_ml_mp: 0.25, canal_ml_mp: 0.15, corp_mp: 40, cablu_ml_mp: 3.5, aparataj_mp: 12, iluminat_mp: 10, tubulatura_mch: 100, grila_mch: 300, jetfan_mp_parcaj: 500, tubulaturaEI_mch: 125, volet_mch: 5000, detector_mp: 60, cabluDetectie_ml_mp: 0.8, butonSirena_mp: 400, teavaPSI_ml_cap: 3, teavaPSI_ml_hidrant: 20, grupSanitar_pers: 20 };

  // Benzi de diametre (frac = fracție din lungimea totală, f = factor de preț relativ; media ≈ 1)
  const BENZI_OTEL = [{ dn: 'DN65 (2½")', frac: 0.15, f: 1.6 }, { dn: 'DN50 (2")', frac: 0.20, f: 1.25 }, { dn: 'DN40 (1½")', frac: 0.25, f: 1.0 }, { dn: 'DN32 (1¼")', frac: 0.20, f: 0.8 }, { dn: 'DN25 (1")', frac: 0.20, f: 0.65 }];
  const BENZI_APA = [{ dn: "DN50", frac: 0.15, f: 1.5 }, { dn: "DN40", frac: 0.20, f: 1.2 }, { dn: "DN32", frac: 0.25, f: 1.0 }, { dn: "DN25", frac: 0.20, f: 0.8 }, { dn: "DN20", frac: 0.20, f: 0.65 }];
  const BENZI_CANAL = [{ dn: "DN160", frac: 0.12, f: 1.7 }, { dn: "DN125", frac: 0.18, f: 1.35 }, { dn: "DN110", frac: 0.30, f: 1.0 }, { dn: "DN75", frac: 0.22, f: 0.7 }, { dn: "DN50", frac: 0.18, f: 0.5 }];

  function arieDesf(profile) {
    return (profile && (profile.arieDesfasurata || (profile.acNivel || 0) * (profile.nrNiveluriSupraterane || 0))) || 0;
  }

  function construieste(bundle, preturi) {
    const P = preturi || {};
    const { dim, apa, canalizare, electrice, gaze, sisteme, profile = {} } = bundle || {};
    const arie = arieDesf(profile);
    const parcaj = profile.parcaj || {};
    const capitole = [];
    const lines = [];

    // Un capitol = o specialitate; are subcapitole cu poziții.
    function capitol(specialitate) {
      const subs = [];
      const cap = { specialitate, subcapitole: subs, total: 0 };
      let curent = null;
      const api = {
        sub(nume) { curent = { nume, pozitii: [], subtotal: 0 }; subs.push(curent); return api; },
        poz(denumire, um, cant, pu) {
          cant = f2(cant); pu = f2(pu);
          if (!(cant > 0) || !(pu > 0) || !curent) return api;
          const total = r0(cant * pu);
          curent.pozitii.push({ denumire, um, cant, pu, total });
          curent.subtotal += total; cap.total += total;
          lines.push({ specialitate, subcapitol: curent.nume, eticheta: denumire, qty: cant, unit: um, pretUnit: pu, total });
          return api;
        },
      };
      capitole.push(cap);
      return { api, cap };
    }
    // Descompunerea unei rețele „montată" pe componente itemizate (calibrat: componentele însumate ≈ prețul montat).
    function distributie(api, base, totalMl, benzi, opt) {
      if (!(totalMl > 0) || !(base > 0)) return;
      const o = Object.assign({ eticheta: "Țeavă", pipe: 0.5, fitinguri: 0.15, izolatie: 0.2, izolCant: 1, suporti: 0.15, umTeava: "ml" }, opt || {});
      benzi.forEach((b) => api.poz(`${o.eticheta} ${b.dn}`, o.umTeava, totalMl * b.frac, base * o.pipe * b.f));
      if (o.fitinguri) api.poz("Fitinguri + piese speciale (coturi, teuri, reducții)", "ml rețea", totalMl, base * o.fitinguri);
      if (o.izolatie) api.poz("Izolație termică (cochilii / armaflex)", "ml", totalMl * o.izolCant, base * o.izolatie);
      if (o.suporti) api.poz("Suporți și console de susținere", "buc", cInt(totalMl / 2.5), base * o.suporti * 2.5);
    }

    // ---------------- TERMICE & GAZE ----------------
    if (sisteme && sisteme.termice) {
      const t = sisteme.termice, { api } = capitol("Termice & gaze");
      const nP = Math.max(3, cInt((t.Pinc || 0) / 300)); // pompe de circulație pe circuite
      api.sub("Echipamente principale")
        .poz("Centrală termică — cazane în condensare", "kW", t.Pinc, P.centralaTermica_eur_kw)
        .poz("Chiller / pompă de căldură reversibilă", "kW frig", t.Prac, P.chiller_eur_kw)
        .poz("Puffer / rezervor tampon", "buc", cInt((t.Pinc || 0) / 350), P.puffer_eur_buc)
        .poz("Butelie de egalizare a presiunilor", "buc", 1, P.butelieEgalizare_eur_buc)
        .poz("Distribuitor / colector", "buc", 1 + (t.Prac > 0 ? 1 : 0), P.distribuitorColector_eur_buc)
        .poz("Vase de expansiune cu membrană", "buc", 1 + (t.Prac > 0 ? 1 : 0), P.vasExpansiune_eur_buc)
        .poz("Pompe de circulație (cu turație variabilă)", "buc", nP, P.pompaCirculatie_eur_buc);
      if (gaze) api.poz("Post de reglare-măsurare gaz (PRM)", "buc", 1, P.prm_eur);
      api.sub("Armături și accesorii")
        .poz("Robineți sferici de izolare", "buc", nP * 2 + 8, P.robinetSferic_eur_buc)
        .poz("Robineți cu sertar / fluture (DN mari)", "buc", 6, P.robinetSertar_eur_buc)
        .poz("Clapete de sens", "buc", nP, P.clapetaSens_eur_buc)
        .poz("Filtre Y (impurități)", "buc", nP + 2, P.filtruY_eur_buc)
        .poz("Manșoane antivibrante", "buc", nP * 2, P.mansonAntivibrant_eur_buc)
        .poz("Separator de impurități / dezaerator", "buc", 1 + (t.Prac > 0 ? 1 : 0), P.filtruY_eur_buc);
      const ml = arie * K.termice_ml_mp;
      api.sub("Distribuție (țeavă oțel pe diametre)");
      distributie(api, P.conductaTermica_eur_ml, ml, BENZI_OTEL, { eticheta: "Țeavă oțel neagră", izolatie: 0.2 });
      api.poz("Corpuri de încălzire (radiatoare / ventiloconvectoare)", "buc", cInt(arie / K.corp_mp), P.corpIncalzire_eur_buc);
      if (gaze) api.poz("Conductă gaz interioară + fitinguri", "ml", 40 + arie * 0.005, P.conductaGaz_eur_ml);
    }

    // ---------------- APĂ RECE ----------------
    if (apa) {
      const { api } = capitol("Apă rece");
      api.sub("Echipamente principale")
        .poz("Rezervor de consum", "m³", apa.rezervor && apa.rezervor.adoptat, P.rezervorConsum_eur_mc)
        .poz("Stație de hidrofor", "buc", 1, P.hidrofor_eur)
        .poz("Preparare apă caldă (boiler / schimbător)", "buc", 1, P.boilerACM_eur_buc)
        .poz("Stație de dedurizare / tratare", "buc", 1, P.dedurizator_eur_buc);
      const nRob = cInt(arie / 300) + 8;
      api.sub("Armături și accesorii")
        .poz("Robineți sferici de izolare", "buc", nRob, P.robinetSferic_eur_buc)
        .poz("Clapete de sens", "buc", 4, P.clapetaSens_eur_buc)
        .poz("Filtre Y (impurități)", "buc", 3, P.filtruY_eur_buc)
        .poz("Reductoare de presiune", "buc", Math.max(1, profile.nrNiveluriSupraterane || 1), P.reductorPresiune_eur_buc);
      const ml = arie * K.apa_ml_mp;
      api.sub("Distribuție (țeavă PPR/PEX pe diametre)");
      distributie(api, P.conductaApa_eur_ml, ml, BENZI_APA, { eticheta: "Țeavă PPR/PEX", izolatie: 0.2, izolCant: 0.6 });
      const tip = profile.tip;
      if (tip === "turism" && profile.nrCamere) api.poz("Seturi obiecte sanitare (baie completă)", "buc", profile.nrCamere, P.setBaie_eur);
      else if (tip === "rezidential" && profile.nrApartamente) api.poz("Seturi obiecte sanitare (baie + bucătărie)", "buc", profile.nrApartamente, P.setBaie_eur);
      else if (profile.persoane) api.poz("Grupuri sanitare echipate", "buc", cInt(profile.persoane / K.grupSanitar_pers), P.setBaie_eur);
    }

    // ---------------- CANALIZARE ----------------
    if (canalizare) {
      const { api } = capitol("Canalizare");
      const nSep = (canalizare.separatoare && canalizare.separatoare.length) || 0;
      api.sub("Echipamente principale")
        .poz("Separatoare (hidrocarburi / grăsimi)", "buc", nSep, P.separator_eur);
      if (parcaj.arieProtejata || (profile.nrNiveluriSubterane || 0) > 0) api.poz("Stație de pompare ape uzate (submersibile)", "buc", 1, P.boilerACM_eur_buc);
      api.sub("Armături și accesorii")
        .poz("Clapete antiretur", "buc", 4, P.clapetaSens_eur_buc)
        .poz("Sifoane de pardoseală", "buc", cInt(arie / 150), P.sifonPardoseala_eur_buc)
        .poz("Ventilații de coloană (aeratoare)", "buc", cInt(arie / 400), P.robinetSferic_eur_buc);
      const ml = arie * K.canal_ml_mp;
      api.sub("Distribuție (țeavă PP/PVC pe diametre)");
      distributie(api, P.conductaCanal_eur_ml, ml, BENZI_CANAL, { eticheta: "Țeavă PP/PVC canalizare", pipe: 0.7, fitinguri: 0.18, izolatie: 0, suporti: 0.12 });
    }

    // ---------------- INSTALAȚII ELECTRICE ----------------
    if (electrice) {
      const { api } = capitol("Instalații electrice");
      const kvaTrafo = electrice.trafoTotal || (typeof electrice.trafo === "number" ? electrice.trafo : 0);
      const kvaGE = electrice.geTotal || (typeof electrice.ge === "number" ? electrice.ge : 0);
      api.sub("Echipamente principale");
      if (kvaTrafo) api.poz("Post de transformare", "kVA", kvaTrafo, P.postTrafo_eur_kva);
      if (kvaGE) api.poz("Grup electrogen (consumatori vitali)", "kVA", kvaGE, P.grupElectrogen_eur_kva);
      api.poz("Tablouri electrice (general + niveluri + tehnice)", "buc", 2 + (profile.nrNiveluriSupraterane || 0) + (parcaj.nrNiveluri || 0), P.tablou_eur_buc)
        .poz("UPS (consumatori critici)", "buc", 1, P.ups_eur_buc);
      api.sub("Aparataje și corpuri")
        .poz("Aparataje (prize, întrerupătoare, montate)", "buc", cInt(arie / K.aparataj_mp), P.aparataj_eur_buc)
        .poz("Corpuri de iluminat (montate)", "buc", cInt(arie / K.iluminat_mp), P.corpIluminat_eur_buc);
      const ml = arie * K.cablu_ml_mp;
      const sub = api.sub("Distribuție (cablu, jgheaburi, tuburi)");
      api.poz("Cabluri (medie toate circuitele, pozate)", "ml", ml, P.cablu_eur_ml * 0.55)
        .poz("Jgheaburi / paturi de cablu metalice", "ml", r0(arie * 0.4), P.jgheabCablu_eur_ml)
        .poz("Tuburi de protecție / copex", "ml", r0(arie * 1.2), P.tubProtectie_eur_ml)
        .poz("Suporți, bride și accesorii de montaj", "buc", cInt(ml / 3), P.cablu_eur_ml * 0.1 * 3);
    }

    // ---------------- VENTILAȚIE / CLIMATIZARE ----------------
    if (sisteme && sisteme.ventilatie) {
      const v = sisteme.ventilatie, { api } = capitol("Ventilație/climatizare");
      const aer = (v.aerCamere || 0) + (v.aerParcaj || 0);
      api.sub("Echipamente principale")
        .poz("CTA aer proaspăt cu recuperare de căldură", "mc/h", v.aerCamere, P.cta_eur_mc_h);
      if (v.aerParcaj) api.poz("Ventilație parcaj (sonde CO)", "mc/h", v.aerParcaj, P.ventilatieParcaj_eur_mc_h);
      if (parcaj.arieProtejata) api.poz("Ventilatoare de impuls (jet-fan)", "buc", cInt(parcaj.arieProtejata / K.jetfan_mp_parcaj), P.jetFan_eur_buc);
      api.sub("Armături și accesorii")
        .poz("Clapete de reglaj debit", "buc", cInt(aer / 1000), P.clapetaReglaj_eur_buc)
        .poz("Clapete antifoc (rezistente la foc)", "buc", cInt(aer / 2000), P.clapetaAntifoc_eur_buc)
        .poz("Manșoane antivibrante la ventilatoare", "buc", 6, P.mansonAntivibrant_eur_buc);
      if (aer) {
        const mp = aer / K.tubulatura_mch;
        const sub = api.sub("Distribuție (tubulatură pe componente)");
        api.poz("Tubulatură ventilație (tablă zincată, confecționată)", "m²", mp, P.tubulatura_eur_mp * 0.55)
          .poz("Piese speciale (coturi, reducții, derivații)", "m²", mp, P.tubulatura_eur_mp * 0.2)
          .poz("Izolație tubulatură", "m²", mp * 0.7, P.tubulatura_eur_mp * 0.2)
          .poz("Suporți și tije de susținere", "buc", cInt(mp / 2), P.tubulatura_eur_mp * 0.1 * 2)
          .poz("Grile + anemostate (montate)", "buc", cInt(aer / K.grila_mch), P.grila_eur_buc);
      }
    }

    // ---------------- DETECȚIE INCENDIU ----------------
    if (sisteme && sisteme.detectie && arie) {
      const { api } = capitol("Detecție incendiu");
      api.sub("Echipamente principale")
        .poz("Centrală adresabilă + bucle", "buc", 1, P.detectieCentrala_eur);
      api.sub("Aparataje de câmp")
        .poz("Detectoare (optice / multicriteriale)", "buc", cInt(arie / K.detector_mp), P.detector_eur_buc)
        .poz("Butoane manuale + sirene", "buc", cInt(arie / K.butonSirena_mp), P.butonSirena_eur_buc);
      const ml = arie * K.cabluDetectie_ml_mp;
      api.sub("Distribuție (cablaj)")
        .poz("Cablu detecție (JE-H(St)H, pozat)", "ml", ml, P.cabluDetectie_eur_ml)
        .poz("Tuburi de protecție", "ml", r0(ml * 0.5), P.tubProtectie_eur_ml)
        .poz("Suporți și accesorii de montaj", "buc", cInt(ml / 3), P.cabluDetectie_eur_ml * 0.3);
    }

    // ---------------- DESFUMARE ----------------
    if (sisteme && sisteme.desfumare && sisteme.desfumare.necesar) {
      const d = sisteme.desfumare, { api } = capitol("Desfumare");
      const Q = d.Qparcaj || 0;
      api.sub("Echipamente principale")
        .poz("Ventilatoare de desfumare F400/120", "buc", Math.max(1, cInt(Q / 30000)), P.ventilatorF400_eur_buc)
        .poz("Ventilatoare de presurizare case de scară", "buc", Math.max(1, r0((d.Qpresurizare || 0) / 12000)), P.presurizare_eur_buc);
      api.sub("Armături și accesorii")
        .poz("Voleți / grile de desfumare", "buc", cInt(Q / K.volet_mch), P.voletDesfumare_eur_buc)
        .poz("Clapete antifoc EI (pe tubulatură)", "buc", cInt(Q / 3000), P.clapetaAntifoc_eur_buc);
      if (Q) {
        const mp = Q / K.tubulaturaEI_mch;
        api.sub("Distribuție (tubulatură EI)")
          .poz("Tubulatură desfumare EI (rezistentă la foc)", "m²", mp, P.tubulaturaEI_eur_mp * 0.8)
          .poz("Suporți rezistenți la foc", "buc", cInt(mp / 2), P.tubulaturaEI_eur_mp * 0.2 * 2);
      }
    }

    // ---------------- STINGERE INCENDIU ----------------
    if (dim) {
      const { api } = capitol("Stingere incendiu");
      const sprink = (dim.sisteme || []).find((s) => s.sistem && s.sistem.startsWith("Sprinklere"));
      const hExt = (dim.sisteme || []).find((s) => s.sistem === "Hidranți exteriori");
      const nrHidrInt = arie ? Math.max(2, r0(arie / 250)) : 0;
      api.sub("Echipamente principale")
        .poz("Rezervor de incendiu (beton armat)", "m³", dim.rezervor && dim.rezervor.adoptat, P.rezervorBeton_eur_mc)
        .poz("Grup de pompare incendiu (atestat IGSU)", "buc", 1, P.grupPompare_eur);
      if (sprink && sprink.capeteTotal) api.poz("Stații de control sprinklere (ACS)", "buc", Math.max(1, Math.ceil((sprink.capeteTotal * 12) / 9000)), P.statieAlarmare_eur);
      api.sub("Armături și hidranți");
      if (nrHidrInt) api.poz("Cutii hidranți interiori echipate", "buc", nrHidrInt, P.hidrantInterior_eur_buc);
      if (hExt && hExt.nrHidranti) api.poz("Hidranți exteriori", "buc", hExt.nrHidranti, P.hidrantExterior_eur_buc);
      api.poz("Vane de sectorizare / robineți", "buc", (nrHidrInt || 0) + 6, P.robinetSertar_eur_buc)
        .poz("Clapete de sens / reținere", "buc", 4, P.clapetaSens_eur_buc);
      // rețea PSI pe diametre
      const mlPSI = (sprink && sprink.capeteTotal ? sprink.capeteTotal * K.teavaPSI_ml_cap : 0) +
        (nrHidrInt + (hExt && hExt.necesar ? hExt.nrHidranti || 0 : 0)) * K.teavaPSI_ml_hidrant;
      api.sub("Distribuție (rețea țeavă oțel PSI)");
      distributie(api, P.teavaPSI_eur_ml, mlPSI, BENZI_OTEL, { eticheta: "Țeavă oțel zincat PSI", pipe: 0.55, fitinguri: 0.2, izolatie: 0, suporti: 0.25 });
      if (sprink && sprink.capeteTotal) api.poz("Capete sprinkler montate", "buc", sprink.capeteTotal, P.sprinkler_eur_cap);
    }

    // curăță subcapitolele goale și capitolele fără poziții
    capitole.forEach((c) => { c.subcapitole = c.subcapitole.filter((s) => s.pozitii.length); });
    const capitoleNe = capitole.filter((c) => c.subcapitole.length && c.total > 0);
    const total = r0(lines.reduce((s, l) => s + l.total, 0));
    return { capitole: capitoleNe, lines, total, arie };
  }

  const api = { construieste, BENZI_OTEL, BENZI_APA, BENZI_CANAL };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DEVIZ = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
