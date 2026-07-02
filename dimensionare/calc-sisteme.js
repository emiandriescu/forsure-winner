/* ===== SOWILO Dimensionare — MOTOR DETERMINIST: Termice, Ventilație, Detecție, Desfumare =====
   Calibrat pe Hotel Sinaia (cap. 3.2, 3.3, 3.5.5, 3.5.6). Funcții pure → { ..., steps[], normativ }.
*/
(function (root) {
  "use strict";
  const r0 = (n) => Math.round(n);

  const C = {
    Wmp_incalzire: 80, Wmp_racire: 53,        // CALIBRARE (I13 / C107; chiller 2×300 ≈ 53 W/mp)
    aerPersoana: 30,                          // mc/h/persoană (I5/2022)
    recuperare_min: 75,                       // % (EPBD / I5)
    schimburiParcaj: 6,                       // schimburi/h ventilație normală parcaj
    inaltimeNivel: 2.8,                       // m (pentru volum parcaj)
    desfumareCuSprinklere: 600,               // mc/h/auto (NP 127 art. 117 alin.1)
    desfumareFaraSprinklere: 900,             // mc/h/auto (alin.2)
    presurizareScara: 12000,                  // mc/h/casă de scară (SR EN 12101-13)
  };

  // ---------- TERMICE (I13) ----------
  function termice(p) {
    const arie = p.arieDesfasurata || (p.acNivel * p.nrNiveluriSupraterane) || 0;
    const Pinc = r0(C.Wmp_incalzire * arie / 1000);
    const Prac = r0(C.Wmp_racire * arie / 1000);
    return {
      sistem: "Instalații termice", Pinc, Prac, normativ: "I13-2015",
      steps: [
        `Putere de încălzire ≈ ${Pinc} kW (${C.Wmp_incalzire} W/mp × ${arie} mp) → centrală termică pe gaze, 2 cazane în cascadă ~${r0(Pinc / 2)} kW, condensare, randament > 95%.`,
        `Putere de răcire ≈ ${Prac} kW frig → chiller aer-apă reversibil (pompă de căldură), 2 × ~${r0(Prac / 2)} kW.`,
        `Distribuție: radiatoare/podea radiantă în camere, ventiloconvectoare în zone comune; reglaj pe cameră prin BMS.`,
      ],
    };
  }

  // Predicat comun de existență a parcajului + estimarea câmpului lipsă (~25 m²/loc) —
  // ventilația și desfumarea nu mai pot diverge când e completat doar unul dintre câmpuri.
  function parcajInfo(p) {
    const raw = (p && p.parcaj) || {};
    const locuri = raw.locuri || (raw.arieProtejata ? Math.round(raw.arieProtejata / 25) : 0);
    const arie = raw.arieProtejata || (raw.locuri ? raw.locuri * 25 : 0);
    return { exista: locuri > 0, locuri, arie, nrNiveluri: Math.max(1, Math.round(raw.nrNiveluri || 1)) };
  }

  // ---------- VENTILAȚIE / CLIMATIZARE (I5/2022) ----------
  function ventilatie(p) {
    const persoane = p.persoane || 0;
    const aerCamere = r0(persoane * C.aerPersoana);
    const parc = parcajInfo(p);
    const volParcaj = parc.arie * C.inaltimeNivel;
    const aerParcaj = r0(volParcaj * C.schimburiParcaj);
    return {
      sistem: "Instalații de ventilare și climatizare", aerCamere, aerParcaj, recuperare: C.recuperare_min,
      normativ: "I5/2022 (Ord. MDLPA 173/2023)",
      steps: [
        `Aer proaspăt zone ocupate ≈ ${aerCamere} mc/h (${persoane} persoane × ${C.aerPersoana} mc/h/pers, I5/2022).`,
        `Ventilație parcaj ≈ ${aerParcaj} mc/h (${C.schimburiParcaj} schimburi/h, cu sonde CO/CO₂).`,
        `Toate CTA-urile cu recuperator de căldură cu eficiență minimă ${C.recuperare_min}% (recuperare entalpică, cf. EPBD / I5/2022) și filtrare ISO 16890.`,
        `Bucătărie: hotă cu extracție și sistem de stingere automată K-Class; restaurante și săli cu aer proaspăt și control CO₂.`,
      ],
    };
  }

  // ---------- DETECȚIE ȘI ALARMARE (P118/3-2018) ----------
  function detectie(p) {
    const arie = p.arieDesfasurata || (p.acNivel * p.nrNiveluriSupraterane) || 0;
    const loops = Math.max(2, Math.ceil(arie / 6000)); // ~1 loop / 6.000 mp (orientativ)
    const obligatoriu = (p.tip === "turism" && (p.nrCamere || 0) >= 25) || arie > 600;
    return {
      sistem: "Detecție și alarmare incendiu", loops, obligatoriu, normativ: "P118/3-2018",
      steps: [
        obligatoriu ? `Sistem OBLIGATORIU (P118/3-2018) — centrală adresabilă ~${loops} bucle, amplasată la recepție 24/7, atestată IGSU.` : `Sistem recomandat — centrală adresabilă ~${loops} bucle.`,
        `Detectoare optice de fum în camere, circulații, săli, depozite; multicriteriale + termice în bucătărie; detectoare CO/CO₂ în parcaj (interconectate cu ventilația).`,
        `Butoane manuale la fiecare ieșire/casă de scară; sistem voice-alarm cu mesaje preînregistrate; interfață cu BMS pentru oprire ventilație + comandă desfumare.`,
      ],
    };
  }

  // ---------- DESFUMARE (NP 127:2009 + P118/1:2025) ----------
  function desfumare(p) {
    const parc = parcajInfo(p);
    const cuSprinklere = parc.locuri >= 101; // ≥ 101 locuri → sprinklere obligatorii (aliniat cu calc-stingere) → debit redus
    const specific = cuSprinklere ? C.desfumareCuSprinklere : C.desfumareFaraSprinklere;
    const Qparcaj = r0(parc.locuri * specific);
    const nrNiv = parc.nrNiveluri;
    const Qpernivel = r0(Qparcaj / nrNiv);
    // presurizarea caselor de scară se justifică la clădiri înalte (> 28 m) sau când scările deservesc parcaj subteran
    const presurizareNecesara = (p.inaltimeUltimPlanseu || 0) > 28 || parc.exista;
    const nrScari = 2; // ipoteză de lucru — de precizat de proiectant
    const Qpresurizare = presurizareNecesara ? r0(nrScari * C.presurizareScara) : 0;
    return {
      sistem: "Desfumare și presurizare", Qparcaj, Qpernivel, nrNiv, Qpresurizare, cuSprinklere,
      necesar: parc.exista,
      normativ: "NP 127:2009 art. 117 + SR EN 12101-13",
      steps: [
        parc.exista ? `Parcaj: debit extracție fum = ${parc.locuri} locuri × ${specific} mc/h/auto = ${Qparcaj} mc/h (${cuSprinklere ? "cu sprinklere — NP 127 art. 117 alin.1" : "fără sprinklere — alin.2"}).` : "Fără parcaj subteran.",
        parc.exista ? `Repartiție pe ${nrNiv} ${nrNiv === 1 ? "nivel" : "niveluri"} ≈ ${Qpernivel} mc/h/nivel; ventilatoare F400/120 (rezistente 400°C/120 min) + jet fans, compartimentare ≤ 6.000 mp cu ecrane EI 120.` : "",
        presurizareNecesara
          ? `Presurizare case de scară ≈ ${Qpresurizare} mc/h (ipoteză: ${nrScari} case × ${C.presurizareScara} mc/h — de precizat numărul real de scări; SR EN 12101-13, ΔP 50 Pa); desfumare săli aglomerate și circulații etaje.`
          : `Presurizarea caselor de scară nu se impune pe datele introduse (clădire ≤ 28 m, fără parcaj subteran) — de reevaluat la PT după configurația scărilor.`,
      ].filter(Boolean),
    };
  }

  function dimensionareSisteme(p = {}) {
    return { termice: termice(p), ventilatie: ventilatie(p), detectie: detectie(p), desfumare: desfumare(p) };
  }

  const api = { termice, ventilatie, detectie, desfumare, dimensionareSisteme, C };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SISTEME = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
