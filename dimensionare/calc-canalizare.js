/* ===== SOWILO Dimensionare — MOTOR DETERMINIST: Canalizare (menajeră + pluvială) =====
   Calibrat pe memoriul Hotel Sinaia (cap. 2.2). Funcții pure → { ..., steps[], normativ }.
   Pluvial: Q = ψ × S(ha) × i (l/s/ha).  Menajeră: Qu = 0,8 × Q apă.
*/
(function (root) {
  "use strict";
  const r1 = (n) => Math.round(n * 10) / 10;
  const C = { coefMenajer: 0.8, psi: 0.9 }; // CALIBRARE: ψ acoperiș+platforme impermeabile

  function dnCanal(qls) {
    if (qls <= 3) return "DN 160";
    if (qls <= 8) return "DN 200";
    if (qls <= 20) return "DN 250";
    if (qls <= 40) return "DN 315";
    return "DN 400";
  }

  // menajeră — pe baza debitelor de apă (din modulul Apă)
  function menajera(apaDebite) {
    const Qmax_zi = apaDebite ? apaDebite.Qmax_zi : 0;
    const Qmax_orar_ls = apaDebite ? apaDebite.Qmax_orar_ls : 0;
    const Qu_zi = r1(C.coefMenajer * Qmax_zi);
    const Qu_orar_ls = r1(C.coefMenajer * Qmax_orar_ls);
    return {
      sistem: "Canalizare menajeră", Qu_zi, Qu_orar_ls, dn: dnCanal(Qu_orar_ls),
      normativ: "STAS 1795, SR EN 752, NP 084-2003",
      steps: [
        `Debit ape uzate menajere Qu = ${C.coefMenajer} × Q apă = ${C.coefMenajer} × ${Qmax_zi} = ${Qu_zi} mc/zi.`,
        `Debit orar (cu coeficient de simultaneitate) ≈ ${Qu_orar_ls} l/s → racord ${dnCanal(Qu_orar_ls)} PVC-KG SN8.`,
      ],
    };
  }

  // pluvială — Q = ψ × S × i
  function pluviala(p) {
    const S_ha = (p.arieAcoperis || 0) / 10000;
    const i = p.i_ploaie || 130;
    const Q = r1(C.psi * S_ha * i);
    return {
      sistem: "Canalizare pluvială", Q, S_mp: p.arieAcoperis || 0, i, psi: C.psi, dn: dnCanal(Q),
      necesar: (p.arieAcoperis || 0) > 0,
      normativ: "STAS 1795, SR EN 752",
      steps: [
        `Suprafață receptoare (acoperiș + platforme) S = ${p.arieAcoperis || 0} m² = ${r1(S_ha)} ha.`,
        `Intensitate ploaie de calcul i = ${i} l/s/ha; coeficient de scurgere ψ = ${C.psi}.`,
        `Q pluvial = ψ × S × i = ${C.psi} × ${r1(S_ha)} × ${i} = ${Q} l/s → racord ${dnCanal(Q)} PEID, cu cămin de retenție/regularizare pe lot.`,
      ],
    };
  }

  function separatoare(p) {
    const out = [];
    const areRestaurant = p.tip === "turism" || (p.dotari && p.dotari.mese);
    if (areRestaurant) out.push({ tip: "Separator de grăsimi (bucătărie)", normativ: "SR EN 1825" });
    if (p.parcaj && p.parcaj.locuri > 0) out.push({ tip: "Separator de hidrocarburi (parcaj)", normativ: "SR EN 858" });
    return out;
  }

  function dimensionareCanalizare(p = {}, apaDebite) {
    return {
      menajera: menajera(apaDebite),
      pluviala: pluviala(p),
      separatoare: separatoare(p),
    };
  }

  const api = { menajera, pluviala, separatoare, dimensionareCanalizare, dnCanal, C };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CANALIZARE = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
