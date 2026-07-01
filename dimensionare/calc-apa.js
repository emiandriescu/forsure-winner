/* ===== SOWILO Dimensionare — MOTOR DETERMINIST: Apă rece (alimentare + rezervor + hidrofor) =====
   Funcții pure, calibrate pe memoriul real Hotel Sinaia (cap. 2.1 + 3.1).
   Întorc { ..., steps[], normativ } — `steps` = breviarul de calcul citat în memoriu.
   Rulează în browser (window.APA) și în Node (module.exports).

   ⚠️ Coeficienții marcați CALIBRARE sunt din I9-2022 / STAS 1478 / SR 1343-1 și din memoriul Hotel Sinaia.
*/
(function (root) {
  "use strict";
  const r1 = (n) => Math.round(n * 10) / 10;
  const r0 = (n) => Math.round(n);

  // ---- Coeficienți (CALIBRARE) ----
  const C = {
    Kzi: 1.4,                 // coef. de neuniformitate zilnică (branșament)
    Kor: 2.0,                 // coef. de neuniformitate orară
    oreFunctionare: 24,       // Qorar = Kor × Qmaxzi / 24
    consumCazare_l: 200,      // hotel: l/pers/zi (I9-2022)
    consumRezidential_l: 210, // locuințe colective: l/pers/zi
    consumBirouri_l: 25,      // birouri/învățământ: l/pers/zi
    consumMasa_l: 25,         // restaurant: l/masă
    consumPersonal_l: 25,     // personal: l/pers/zi
    autonomieRezervor_h: 24,  // autonomie rezervor consum
    marjaRezervor: 0.10,
    presiuneRobinet_mCA: 25,  // 2,5 bar la cel mai înalt robinet (I9-2022)
    pierderiLocale_mCA: 8,
    pierderiLiniare_mCA: 7,
    marjaHidrofor: 0.30,      // marjă debit stație hidrofor
  };

  // l/s din mc/h
  const lps = (mc_h) => mc_h / 3.6;

  // DN branșament după debit (l/s) — tabel orientativ PEID
  function dnBransament(qls) {
    if (qls <= 1.5) return "DN 50";
    if (qls <= 3.5) return "DN 100";
    if (qls <= 7) return "DN 125";
    if (qls <= 12) return "DN 160";
    return "DN 200";
  }

  // ---------- LISTĂ CONSUMATORI (adaptiv pe tip de clădire) ----------
  function consumatori(p) {
    const tip = p.tip || "turism";
    const d = p.dotari || {};
    const list = [];
    const add = (nume, cantitate, unit, specific_l, Q_mc_zi, nota) =>
      list.push({ nume, cantitate, unit, specific_l, Q: r1(Q_mc_zi), nota });

    if (tip === "turism") {
      const persoane = p.persoane || p.locuriCazare || 0;
      const nrCamere = p.nrCamere || 0;
      // valori derivate implicit din profil, ajustabile prin „dotări"
      const mese = d.mese != null ? d.mese : nrCamere * 2;       // ~2 mese/cameră
      const ture = d.ture != null ? d.ture : 2;
      const personal = d.personal != null ? d.personal : Math.round(nrCamere * 0.6);
      add("Cazare hotel", persoane, "pers", C.consumCazare_l, persoane * C.consumCazare_l / 1000);
      if (mese) add("Restaurante", mese * ture, "mese", C.consumMasa_l, mese * ture * C.consumMasa_l / 1000);
      if (d.bucatarie_mc) add("Bucătărie producție", 1, "forfetar", null, d.bucatarie_mc);
      if (d.piscina_mc) add("Piscină (adaos + dușuri)", 1, "forfetar", null, d.piscina_mc);
      if (d.spa_mc) add("Spa + wellness", 1, "forfetar", null, d.spa_mc);
      if (personal) add("Personal", personal, "pers", C.consumPersonal_l, personal * C.consumPersonal_l / 1000);
      if (d.spalatorie_mc) add("Spălătorie internă", 1, "forfetar", null, d.spalatorie_mc);
      if (d.irigatii_mc) add("Irigații spații verzi", 1, "forfetar", null, d.irigatii_mc);
    } else if (tip === "rezidential") {
      const persoane = p.persoane || 0;
      add("Locuire (apartamente)", persoane, "pers", C.consumRezidential_l, persoane * C.consumRezidential_l / 1000);
      if (d.irigatii_mc) add("Irigații spații verzi", 1, "forfetar", null, d.irigatii_mc);
    } else if (tip === "comercial") {
      const persoane = p.persoane || 0;
      add("Spațiu comercial", persoane, "pers", 20, persoane * 20 / 1000);
    } else {
      const persoane = p.persoane || 0;
      add(tip === "spital" ? "Spital (paturi/persoane)" : "Persoane", persoane, "pers", C.consumBirouri_l, persoane * C.consumBirouri_l / 1000);
    }
    if (p.office && p.office.are && p.office.persoane) add("Zonă office/retail parter", p.office.persoane, "pers", 20, p.office.persoane * 20 / 1000);
    return list;
  }

  // ---------- DEBITE DE CONSUM + BRANȘAMENT ----------
  function debiteApa(p) {
    const list = consumatori(p);
    const Qzi_med = r1(list.reduce((s, c) => s + c.Q, 0));
    const Qmax_zi = r1(Qzi_med * C.Kzi);
    const Qmax_orar_mc = r1(C.Kor * Qmax_zi / C.oreFunctionare);
    const Qmax_orar_ls = r1(lps(Qmax_orar_mc));
    const Qnominal_ls = Math.max(1, Math.ceil(Qmax_orar_ls * 10) / 10); // rotunjit în sus la 0,1
    const dn = dnBransament(Qnominal_ls);
    return {
      consumatori: list, Qzi_med, Qmax_zi, Qmax_orar_mc, Qmax_orar_ls,
      Qnominal_ls, dn, presiune_bar: r1(C.presiuneRobinet_mCA / 10),
      normativ: "I9-2022, STAS 1478, SR 1343-1",
      steps: [
        `Q zilnic mediu = Σ(cantitate × consum specific) = ${Qzi_med} mc/zi.`,
        `Q maxim zilnic = Kzi × Qzi,med = ${C.Kzi} × ${Qzi_med} = ${Qmax_zi} mc/zi.`,
        `Q maxim orar = Kor × Qmax,zi / 24 = ${C.Kor} × ${Qmax_zi} / 24 = ${Qmax_orar_mc} mc/h = ${Qmax_orar_ls} l/s.`,
        `Branșament: debit nominal ≈ ${Qnominal_ls} l/s → ${dn} (PEID PE100), presiune cerută la limită ≥ ${r1(C.presiuneRobinet_mCA / 10)} bar.`,
        `Apa pentru stingerea incendiilor se asigură din rezervorul propriu de incendiu (vezi modulul Stingere), nu se cere de la operator.`,
      ],
    };
  }

  // ---------- REZERVOR DE CONSUM (separat de incendiu) ----------
  function rezervorConsum(p, Qmax_zi) {
    const autonomie = (p.autonomieRezervor_h || C.autonomieRezervor_h);
    const baza = (autonomie / 24) * Qmax_zi;
    const cuMarja = baza * (1 + C.marjaRezervor);
    const adoptat = Math.round(cuMarja / 10) * 10; // rotunjire la 10 mc
    return {
      sistem: "Rezervor de apă rece pentru consum",
      autonomie, baza: r0(baza), adoptat,
      normativ: "I9-2022, SR 1343-1",
      steps: [
        `Autonomie cerută în caz de avarie alimentare rețea: ${autonomie}h (hotel/clădire importantă).`,
        `Volum = (autonomie/24) × Qmax,zi = (${autonomie}/24) × ${Qmax_zi} = ${r1(baza)} mc.`,
        `Cu marjă +${C.marjaRezervor * 100}% și rotunjire → VOLUM REZERVOR CONSUM adoptat = ${adoptat} mc.`,
        `Separat de rezerva de incendiu prin perete EI 120; sonde nivel cu transmisie BMS; supape antiretur la racord.`,
      ],
    };
  }

  // ---------- STAȚIE HIDROFOR (booster) ----------
  function hidrofor(p, Qmax_orar_ls) {
    const cota = p.cotaGeodezica || p.inaltimeUltimPlanseu || 0;
    const H = r0(cota + C.presiuneRobinet_mCA + C.pierderiLocale_mCA + C.pierderiLiniare_mCA);
    const Qstatie = r1(Qmax_orar_ls * (1 + C.marjaHidrofor));
    return {
      sistem: "Stație de ridicare a presiunii (hidrofor)",
      H_mCA: H, H_bar: r1(H / 10), Qstatie,
      normativ: "I9-2022",
      steps: [
        `H pompare = cotă geodezică + presiune robinet + pierderi locale + pierderi liniare = ${cota} + ${C.presiuneRobinet_mCA} + ${C.pierderiLocale_mCA} + ${C.pierderiLiniare_mCA} = ${H} mCA ≈ ${r1(H / 10)} bar.`,
        `Debit stație = Qmax,orar × (1+${C.marjaHidrofor}) = ${Qmax_orar_ls} × ${1 + C.marjaHidrofor} = ${Qstatie} l/s.`,
        `Soluție: pompe în cascadă 2A + 1R cu variator de turație, menținere automată a presiunii, vase de expansiune, comunicare BMS.`,
      ],
    };
  }

  // ---------- ORCHESTRARE ----------
  function dimensionareApa(p = {}) {
    const profile = Object.assign({ tip: "turism", persoane: 0, dotari: {} }, p);
    const debite = debiteApa(profile);
    const rezervor = rezervorConsum(profile, debite.Qmax_zi);
    const statie = hidrofor(profile, debite.Qmax_orar_ls);
    return { profile, debite, rezervor, statie };
  }

  const api = { consumatori, debiteApa, rezervorConsum, hidrofor, dimensionareApa, dnBransament, C };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.APA = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
