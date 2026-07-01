/* ===== SOWILO Dimensionare — MOTOR DETERMINIST: Instalații gaze naturale =====
   Calibrat pe Hotel Sinaia (cap. 2.4). P termic instalat → debit gaz q = P / (PCI × η).
*/
(function (root) {
  "use strict";
  const r0 = (n) => Math.round(n);
  const r1 = (n) => Math.round(n * 10) / 10;
  const C = { PCI: 9.5, eta: 0.95, Wmp_incalzire: 80, kW_acm_pers: 2, marja: 0.10, marjaSolicitare: 0.05 };
  const PRM_STD = [40, 65, 100, 160, 200, 250, 400];
  const nextStd = (v) => PRM_STD.find((x) => x >= v) || PRM_STD[PRM_STD.length - 1];

  function dimensionareGaze(p = {}) {
    const arie = p.arieDesfasurata || (p.acNivel * p.nrNiveluriSupraterane) || 0;
    const persoane = p.persoane || 0;
    const d = p.dotari || {};
    const P_incalzire = r0(C.Wmp_incalzire * arie / 1000);
    const P_acm = r0(C.kW_acm_pers * persoane);
    const P_piscina = d.piscina_mc ? 120 : 0;
    const P_bucatarie = (d.mese || p.tip === "turism") ? 50 : 0;
    const P_baza = P_incalzire + P_acm + P_piscina + P_bucatarie;
    const P_total = r0(P_baza * (1 + C.marja));
    const q = r1(P_total / (C.PCI * C.eta));
    const q_solicitat = r1(q * (1 + C.marjaSolicitare));
    const prm = nextStd(q_solicitat);
    return {
      sistem: "Instalații gaze naturale",
      P_incalzire, P_acm, P_piscina, P_bucatarie, P_total, q, q_solicitat, prm,
      normativ: "NTPEE 2018 (Ord. ANRE 89/2018), I6",
      steps: [
        `Putere termică instalată: încălzire ${P_incalzire} kW (${C.Wmp_incalzire} W/mp × ${arie} mp, cf. C107) + ACM ${P_acm} kW + piscină ${P_piscina} kW + bucătărie ${P_bucatarie} kW.`,
        `Cu marjă +${C.marja * 100}% → P total instalată ≈ ${P_total} kW.`,
        `Debit gaz q = P / (PCI × η) = ${P_total} / (${C.PCI} × ${C.eta}) = ${q} mc/h (PCI gaz natural ${C.PCI} kWh/Nmc, η cazane condensare ${C.eta}).`,
        `Solicitare către operator: Q ≈ ${q_solicitat} mc/h, presiune redusă (2-6 bar), PRM dimensionat la ${prm} mc/h în nișă exterioară ventilată.`,
      ],
    };
  }

  const api = { dimensionareGaze, C };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GAZE = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
