/* ===== SOWILO Dimensionare — EXPORT deviz structurat (Excel) =====
   Produce un fișier care se deschide curat în Excel ca TABEL formatat, cu
   capitole pe specialități, subcapitole (echipamente / armături / distribuție),
   poziții pe rânduri și subtotaluri. Formatul e un tabel HTML salvat ca .xls —
   Excel îl deschide nativ, cu coloane corecte și fără ghicit de separator.
   Se păstrează și un export CSV simplu (buildExportCSV) pentru compatibilitate.
   Funcții pure → șir de text (descărcarea se face în app.js).
*/
(function (root) {
  "use strict";
  const esc = (v) => v == null ? "" : String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const nf = (n) => (n == null || isNaN(n)) ? "" : Number(n).toLocaleString("ro-RO");
  const nf2 = (n) => (n == null || isNaN(n)) ? "" : Number(n).toLocaleString("ro-RO", { maximumFractionDigits: 2 });

  // ---- Excel (tabel HTML .xls): capitole → subcapitole → poziții + subtotaluri ----
  function buildExportXLS(p) {
    const prof = (p.dim && p.dim.profile) || {};
    const crb = p.crb || {};
    const cost = crb.cost || {};
    const R = [];
    const push = (html) => R.push(html);
    const td = (v, cls) => `<td${cls ? ` class="${cls}"` : ""}>${esc(v)}</td>`;
    const tdn = (v, cls) => `<td class="n${cls ? " " + cls : ""}">${v === "" ? "" : nf(v)}</td>`;

    push('<table border="1">');
    // Antet obiectiv
    push(`<tr><td class="h1" colspan="6">SOWILO Dimensionare — deviz estimativ pe specialități</td></tr>`);
    push(`<tr>${td("Obiectiv", "k")}<td colspan="5">${esc(p.name || "")}</td></tr>`);
    push(`<tr>${td("Beneficiar", "k")}<td colspan="5">${esc(p.beneficiar || "")}</td></tr>`);
    push(`<tr>${td("Amplasament", "k")}<td colspan="5">${esc(p.adresa || "")}</td></tr>`);
    push(`<tr>${td("Funcțiune", "k")}<td colspan="5">${esc(p.functiune || "")}</td></tr>`);
    push(`<tr>${td("Arie desfășurată", "k")}<td colspan="5">${esc(nf(prof.arieDesfasurata) + (prof.arieDesfasurata ? " m²" : ""))}</td></tr>`);
    push('<tr><td colspan="6"></td></tr>');

    // Antet coloane deviz
    const head = () => push(`<tr class="hd"><td>Nr.</td><td>Denumire</td><td>U.M.</td><td class="n">Cant.</td><td class="n">Preț unit. (€)</td><td class="n">Total (€)</td></tr>`);

    if (cost.capitole && cost.capitole.length) {
      head();
      let nc = 0;
      cost.capitole.forEach((cap) => {
        nc++;
        push(`<tr class="cap"><td>${nc}.</td><td colspan="4">${esc(cap.specialitate)}</td><td class="n">${nf(cap.total)}</td></tr>`);
        cap.subcapitole.forEach((sub, si) => {
          push(`<tr class="sub"><td>${nc}.${si + 1}</td><td colspan="4">${esc(sub.nume)}</td><td class="n">${nf(sub.subtotal)}</td></tr>`);
          sub.pozitii.forEach((it, ii) => {
            push(`<tr><td class="ix">${nc}.${si + 1}.${ii + 1}</td>${td(it.denumire)}${td(it.um)}<td class="n">${nf2(it.cant)}</td><td class="n">${nf2(it.pu)}</td><td class="n">${nf(it.total)}</td></tr>`);
          });
        });
      });
      push(`<tr class="tot"><td colspan="5">TOTAL CAPEX (€)</td><td class="n">${nf(cost.total)}</td></tr>`);
      push('<tr><td colspan="6"></td></tr>');
      push(`<tr>${td("Cost specific (€/m²)", "k")}<td colspan="4"></td><td class="n">${nf(cost.perMp)}</td></tr>`);
      push(`<tr>${td("OPEX mentenanță (€/an)", "k")}<td colspan="4"></td><td class="n">${nf(cost.opexAnual)}</td></tr>`);
    } else if (cost.lines && cost.lines.length) {
      // fallback (proiect vechi, fără capitole): grupare simplă pe specialitate
      head();
      const specs = [];
      cost.lines.forEach((l) => { if (!specs.includes(l.specialitate)) specs.push(l.specialitate); });
      specs.forEach((sp, si) => {
        const ls = cost.lines.filter((l) => l.specialitate === sp);
        push(`<tr class="cap"><td>${si + 1}.</td><td colspan="4">${esc(sp)}</td><td class="n">${nf(ls.reduce((s, l) => s + l.total, 0))}</td></tr>`);
        ls.forEach((l, ii) => push(`<tr><td class="ix">${si + 1}.${ii + 1}</td>${td(l.eticheta)}${td(l.unit)}<td class="n">${nf2(l.qty)}</td><td class="n">${nf2(l.pretUnit)}</td><td class="n">${nf(l.total)}</td></tr>`));
      });
      push(`<tr class="tot"><td colspan="5">TOTAL CAPEX (€)</td><td class="n">${nf(cost.total)}</td></tr>`);
    }

    // Solicitări de racordare (tabel separat, jos)
    if (p.racordare && p.racordare.utilitati) {
      push('<tr><td colspan="6"></td></tr>');
      push(`<tr class="cap"><td colspan="6">Solicitări de racordare</td></tr>`);
      push(`<tr class="hd"><td>Utilitate</td><td colspan="2">De solicitat operatorului</td><td>Cost</td><td>Risc</td><td>Termen</td></tr>`);
      p.racordare.utilitati.forEach((u) => {
        push(`<tr>${td(u.utilitate)}<td colspan="2">${esc(u.solicitare)}</td>${td(u.cost)}${td(u.nivel)}${td(u.termen)}</tr>`);
      });
    }

    push('<tr><td colspan="6"></td></tr>');
    push(`<tr><td colspan="6" class="ft">Estimare preliminară (faza DTAC), sub responsabilitatea proiectantului. Prețurile și cantitățile sunt orientative — se confirmă la Proiectul Tehnic.</td></tr>`);
    push("</table>");

    const style = `<style>
      table{border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt}
      td{border:0.5pt solid #d0d0d0;padding:3px 7px;vertical-align:top}
      td.n{text-align:right;mso-number-format:"\\#\\,\\#\\#0"}
      td.h1{background:#1f4e79;color:#fff;font-size:13pt;font-weight:bold;border:none}
      td.k{color:#555;font-weight:bold;width:150px}
      tr.hd td{background:#4472c4;color:#fff;font-weight:bold}
      tr.cap td{background:#dbe5f1;font-weight:bold;font-size:11.5pt}
      tr.sub td{background:#eef3fa;font-weight:bold;font-style:italic;color:#1f4e79}
      td.ix{color:#999;text-align:center}
      tr.tot td{background:#1f4e79;color:#fff;font-weight:bold;font-size:12pt}
      td.ft{color:#777;font-style:italic;font-size:9.5pt;border:none}
    </style>`;
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8">${style}</head><body>${R.join("\n")}</body></html>`;
  }

  // ---- CSV simplu (compatibilitate; folosește structura pe capitole dacă există) ----
  const SEP = ";";
  const cell = (v) => {
    if (v == null) return "";
    if (typeof v === "number") return String(v).replace(".", ",");
    const s = String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const row = (arr) => arr.map(cell).join(SEP);

  function buildExportCSV(p) {
    const L = [];
    const prof = (p.dim && p.dim.profile) || {};
    L.push(row(["SOWILO Dimensionare — deviz & cantități (estimare preliminară)"]));
    L.push(row(["Obiectiv", p.name || ""]));
    L.push(row(["Amplasament", p.adresa || ""]));
    L.push(row(["Funcțiune", p.functiune || ""]));
    L.push(row(["Arie desfășurată (m²)", prof.arieDesfasurata || ""]));
    L.push("");
    const cost = (p.crb && p.crb.cost) || {};
    if (cost.capitole && cost.capitole.length) {
      L.push(row(["Capitol", "Subcapitol", "Denumire", "U.M.", "Cantitate", "Preț unitar (€)", "Total (€)"]));
      cost.capitole.forEach((cap) => {
        cap.subcapitole.forEach((sub) => {
          sub.pozitii.forEach((it) => L.push(row([cap.specialitate, sub.nume, it.denumire, it.um, it.cant, it.pu, it.total])));
        });
      });
      L.push(row(["", "", "", "", "", "TOTAL CAPEX (€)", cost.total]));
      L.push("");
      L.push(row(["Cost specific (€/m²)", cost.perMp]));
      L.push(row(["OPEX mentenanță (€/an)", cost.opexAnual]));
    }
    return L.join("\r\n");
  }

  const api = { buildExportXLS, buildExportCSV };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EXPORTCSV = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
