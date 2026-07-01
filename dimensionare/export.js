/* ===== SOWILO Dimensionare — EXPORT deviz + cantități + solicitări (CSV/Excel) =====
   Construiește un CSV (delimitator ; pentru Excel RO) cu: datele obiectivului,
   solicitările de racordare, devizul pe specialități (cantități + prețuri) și
   sinteza de cost. Funcție pură → șir CSV (descărcarea se face în app.js, cu BOM UTF-8).
*/
(function (root) {
  "use strict";
  const SEP = ";";
  const cell = (v) => {
    if (v == null) return "";
    if (typeof v === "number") return String(v).replace(".", ","); // zecimală RO, fără separator de mii
    const s = String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const row = (arr) => arr.map(cell).join(SEP);

  function buildExportCSV(p) {
    const L = [];
    const prof = (p.dim && p.dim.profile) || {};
    L.push(row(["SOWILO Dimensionare — deviz & cantități (estimare preliminară)"]));
    L.push(row(["Obiectiv", p.name || ""]));
    L.push(row(["Beneficiar", p.beneficiar || ""]));
    L.push(row(["Amplasament", p.adresa || ""]));
    L.push(row(["Funcțiune", p.functiune || ""]));
    L.push(row(["Arie desfășurată (m²)", prof.arieDesfasurata || ""]));
    L.push("");

    // Solicitări de racordare
    if (p.racordare && p.racordare.utilitati) {
      L.push(row(["SOLICITĂRI DE RACORDARE"]));
      L.push(row(["Utilitate", "Document", "De solicitat", "Risc", "Termen"]));
      p.racordare.utilitati.forEach((u) => L.push(row([u.utilitate, u.document, u.solicitare, u.nivel, u.termen])));
      L.push("");
    }

    // Deviz pe specialități (cantități + prețuri)
    if (p.crb && p.crb.cost) {
      L.push(row(["DEVIZ ESTIMATIV PE SPECIALITĂȚI"]));
      L.push(row(["Specialitate", "Element", "Cantitate", "U.M.", "Preț unitar (€)", "Total (€)"]));
      p.crb.cost.lines.forEach((l) => L.push(row([l.specialitate, l.eticheta, l.qty, l.unit, l.pretUnit, l.total])));
      L.push(row(["", "", "", "", "TOTAL CAPEX (€)", p.crb.cost.total]));
      L.push("");
      L.push(row(["Cost specific (€/m²)", p.crb.cost.perMp]));
      L.push(row(["OPEX mentenanță (€/an)", p.crb.cost.opexAnual]));
    }
    L.push("");
    L.push(row(["Estimare preliminară (faza DTAC), sub responsabilitatea proiectantului. Prețurile sunt orientative."]));
    return L.join("\r\n");
  }

  const api = { buildExportCSV };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EXPORTCSV = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
