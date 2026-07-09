/* ===== SOWILO Dimensionare — listă normative curente + praguri de obligativitate =====
   Lista de normative aplicabile (actualizată la cele în vigoare 2025/2026).
   Funcționează atât în browser (window.NORMATIVE) cât și în Node (module.exports).
*/
(function (root) {
  "use strict";

  // Normative în vigoare, pe domenii. Editabil — se actualizează când apar revizii.
  const NORMATIVE = [
    { id: "P118/1:2025", domeniu: "psi", titlu: "Normativ securitate la incendiu a construcțiilor — Partea I-a (martie 2025)" },
    { id: "P118/2-2013 mod. 2018", domeniu: "stingere", titlu: "Instalații de stingere a incendiilor (hidranți, sprinklere, drencere)" },
    { id: "P118/3-2018", domeniu: "detectie", titlu: "Instalații de detectare, semnalizare și avertizare incendiu" },
    { id: "NP 127:2009", domeniu: "psi", titlu: "Securitate la incendiu a parcajelor subterane pentru autoturisme" },
    { id: "SR EN 12845", domeniu: "stingere", titlu: "Sisteme fixe de luptă împotriva incendiilor — sisteme automate de tip sprinkler" },
    { id: "SR EN 12101-13:2022", domeniu: "desfumare", titlu: "Sisteme pentru controlul fumului și gazelor fierbinți — presurizare" },
    { id: "I5/2022", domeniu: "ventilatie", titlu: "Instalații de ventilare și climatizare (Ord. MDLPA 173/2023)" },
    { id: "I7/2023", domeniu: "electrice", titlu: "Instalații electrice cu tensiuni până la 1000 V c.a. (Ord. ME 959/2023)" },
    { id: "I9-2022", domeniu: "sanitare", titlu: "Instalații sanitare interioare" },
    { id: "I13-2015", domeniu: "termice", titlu: "Instalații de încălzire centrală" },
    { id: "NTPEE 2018 / I6", domeniu: "gaze", titlu: "Instalații de gaze naturale (Ord. ANRE 89/2018)" },
    { id: "STAS 1478-90 / SR 1343-1", domeniu: "sanitare", titlu: "Alimentare cu apă la construcții civile — debite specifice" },
    { id: "SR 1846-1:2006 / STAS 1795-87", domeniu: "sanitare", titlu: "Canalizări exterioare și interioare" },
  ];

  // Texte standard de motiv pentru încadrarea în obligativitate (pentru memoriu).
  const PRAGURI = {
    hidrantiInterioriTurism:
      "P118/2-2013 mod. 2018 art. 4.1 alin. (1) lit. f): hidranți interiori obligatorii la clădiri de turism cu peste 50 locuri de cazare SAU Ac > 600 m² și peste 3 niveluri supraterane.",
    hidrantiExterioriTurism:
      "P118/2-2013 mod. 2018 art. 6.1 alin. (4) lit. j): hidranți exteriori obligatorii la clădiri de turism cu peste 100 locuri de cazare SAU Ac > 600 m² și peste 3 niveluri supraterane.",
    sprinklereParcajP2:
      "NP 127:2009 art. 10 + art. 52-53 și P118/2-2013 mod. 2018 art. 7: parcaj subteran tip P2 (101-300 locuri) — sistem automat de stingere cu apă obligatoriu, timp de funcționare 60 min.",
    cladireInalta:
      "P118/1:2025: H ≥ 28 m = clădire înaltă; H ≥ 45 m = clădire foarte înaltă.",
    hidrantiInterioriRezidential:
      "P118/2-2013 mod. 2018 art. 4.1: hidranți interiori obligatorii la clădiri de locuit colective cu peste P+4 niveluri sau Ac > 600 m² și peste 3 niveluri supraterane. (CALIBRARE — de confirmat pe un memoriu rezidențial real.)",
    hidrantiExterioriRezidential:
      "P118/2-2013 mod. 2018 art. 6.1 + Anexa 7: hidranți exteriori obligatorii la clădiri de locuit cu volum compartiment / număr de persoane peste pragurile din normativ. (CALIBRARE.)",
    hidrantiGeneric:
      "P118/2-2013 mod. 2018: hidranți interiori/exteriori obligatorii la clădiri civile cu Ac > 600 m² și peste 3 niveluri supraterane sau volum compartiment peste prag. (CALIBRARE pe tipul de clădire.)",
    officeRetail:
      "Zonă office/retail la parter (funcțiune mixtă): se tratează ca risc mediu; dacă depășește 200 persoane devine sală aglomerată (timp de funcționare hidranți 60 min).",
  };

  const api = { NORMATIVE, PRAGURI, listByDomeniu: (d) => NORMATIVE.filter((n) => n.domeniu === d) };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NORMATIVE_API = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
