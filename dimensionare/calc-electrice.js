/* ===== SOWILO Dimensionare — MOTOR DETERMINIST: Instalații electrice =====
   Calibrat pe Hotel Sinaia (cap. 2.3 + 3.4). Pi (putere instalată) din indice specific
   pe tip de clădire → Pa = Kc × Pi → S = Pa/cosφ → post trafo; grup electrogen pe vitali.
*/
(function (root) {
  "use strict";
  const r0 = (n) => Math.round(n);

  // Indice de putere instalată (W/mp arie desfășurată) — CALIBRARE (hotel 155 ≈ 1750 kW / 11.300 mp)
  const W_MP = { turism: 155, rezidential: 50, birouri: 80, comercial: 120, spital: 200, invatamant: 60, industrial: 100 };
  const C = { Kc: 0.6, cosfi: 0.92, fractieVitali: 0.4, cosfiGE: 0.8 };
  const TRAFO_STD = [400, 630, 800, 1000, 1250, 1600, 2000, 2500];
  const GE_STD = [100, 150, 200, 275, 350, 450, 550, 700, 900, 1100];

  // Selecție din gama standard, cu unități în paralel când cererea depășește gama —
  // niciodată nu se „taie" silențios la cea mai mare valoare din gamă.
  function selectStd(v, arr, nMin) {
    const max = arr[arr.length - 1];
    let n = Math.max(nMin || 1, Math.ceil(v / max) || 1);
    const unit = arr.find((x) => x >= Math.ceil(v / n)) || max;
    return { n, unit, total: n * unit, label: n > 1 ? `${n} × ${unit} kVA` : `${unit} kVA` };
  }

  function dimensionareElectrice(p = {}) {
    const wmp = W_MP[p.tip] || 100;
    const arie = p.arieDesfasurata || (p.acNivel * p.nrNiveluriSupraterane) || 0;
    const Pi = r0(wmp * arie / 1000);              // kW
    const Pa = r0(C.Kc * Pi);                       // kW
    const S = r0(Pa / C.cosfi);                     // kVA
    const trafoSel = selectStd(S, TRAFO_STD, S > 1500 ? 2 : 1); // peste ~1500 kVA → minim 2 unități în paralel
    const Pvital = r0(C.fractieVitali * Pa);
    const geSel = selectStd(r0(Pvital / C.cosfiGE), GE_STD);
    return {
      sistem: "Instalații electrice", Pi, Pa, S,
      trafo: trafoSel.label, trafoUnit: trafoSel.unit, trafoN: trafoSel.n, trafoTotal: trafoSel.total,
      Pvital, ge: `${geSel.label} stand-by`, geUnit: geSel.unit, geN: geSel.n, geTotal: geSel.total,
      normativ: "I7/2023 (Ord. ME 959/2023), NTE 401",
      steps: [
        `Putere instalată Pi = indice ${wmp} W/mp × ${arie} mp = ${Pi} kW (estimare pe tip de clădire).`,
        `Putere absorbită Pa = Kc × Pi = ${C.Kc} × ${Pi} = ${Pa} kW (Kc — factor de simultaneitate hotelier).`,
        `Putere aparentă S = Pa / cosφ = ${Pa} / ${C.cosfi} = ${S} kVA → post de transformare ${trafoSel.label} (total ${trafoSel.total} kVA ≥ S), racord MT 20/0,4 kV.`,
        `Grup electrogen pe consumatori vitali (securitate la incendiu + evacuare) ≈ ${Pvital} kW → ${geSel.label} stand-by (total ${geSel.total} kVA), pornire automată < 15 s (AAR).`,
        ...(trafoSel.n > 2 || geSel.n > 1 ? [`Cererea depășește gama standard pe o singură unitate — soluție multi-unitate propusă; configurația finală se stabilește cu operatorul de distribuție la PT.`] : []),
      ],
    };
  }

  const api = { dimensionareElectrice, selectStd, C, W_MP, TRAFO_STD, GE_STD };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ELECTRICE = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
