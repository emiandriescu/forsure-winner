/* ===== SOWILO Dimensionare — Pagină de FEZABILITATE (Go / No-go) =====
   Un sumar de o pagină, brandat, pentru dezvoltator/bancă: cererea de utilități +
   riscul de racordare (semafor), CAPEX/m² + pe specialități, matrice de risc și
   termenele-capcană. Se generează din rezultatele deterministe + racordare + CRB.
*/
(function (root) {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const eur = (n) => Number(n || 0).toLocaleString("ro-RO") + " €";
  const capLbl = { "scăzut": "SCĂZUT", "moderat": "MODERAT", "ridicat": "RIDICAT", "critic": "CRITIC" };

  function buildFezabilitate({ company, project, dim, crb, racordare }) {
    const c = company || {}, p = project || {}, prof = (dim && dim.profile) || {};
    const util = (racordare && racordare.utilitati) || [];
    const verdict = (racordare && racordare.verdict) || "scăzut";

    const utilRows = util.map((u) =>
      `<tr><td><b>${esc(u.utilitate)}</b><br/><span class="mut">${esc(u.document)}</span></td>
        <td>${esc(u.solicitare)}</td>
        <td>${esc(u.cost)}</td>
        <td class="lvl lvl-${esc(u.nivel)}">${capLbl[u.nivel] || esc(u.nivel)}</td></tr>`).join("");

    const grup = (crb && crb.cost && crb.cost.grupuri) ? crb.cost.grupuri.slice().sort((a, b) => b.total - a.total) : [];
    const topCapex = grup.slice(0, 4).map((g) =>
      `<tr><td>${esc(g.specialitate)}</td><td class="num">${eur(g.total)}</td><td class="num">${g.pct}%</td></tr>`).join("");

    const risc = (crb && crb.risc) || [];
    const ord = { "critic": 0, "ridicat": 1, "moderat": 2, "scăzut": 3 };
    const topRisc = risc.slice().sort((a, b) => (ord[a.nivel] - ord[b.nivel])).slice(0, 4).map((x) =>
      `<tr><td>${esc(x.categorie)}</td><td class="lvl lvl-${esc(x.nivel)}">${capLbl[x.nivel] || esc(x.nivel)}</td><td>${esc(x.masura)}</td></tr>`).join("");

    const tl = (racordare && racordare.timeline) || [];
    const tlItems = tl.map((t) => `<li><b>${esc(t.pas)}</b> — ${esc(t.durata)} <span class="mut">(${esc(t.nota)})</span></li>`).join("");

    const cost = crb && crb.cost ? crb.cost : { total: 0, perMp: 0, opexAnual: 0 };
    const garantie = (racordare && racordare.garantieElectric) || 0;

    return `<div class="fez">
      <div class="fez-head">
        <div>${c.logo ? `<img class="fez-logo" src="${c.logo}" alt="" />` : ""}
          <div class="fez-firm">${esc(c.name || "SOWILO SRL")}${c.atestate && c.atestate.length ? " · " + esc(c.atestate.join(", ")) : ""}</div></div>
        <div class="fez-title"><h1>ANALIZĂ DE FEZABILITATE — UTILITĂȚI &amp; INSTALAȚII</h1>
          <div>${esc(p.name || "Obiectiv")} · ${esc(prof.functiune || "")} · ${esc(p.data || "")}</div></div>
      </div>

      <div class="fez-verdict lvl-${esc(verdict)}">
        <div class="fez-verd-l">VERDICT RACORDARE</div>
        <div class="fez-verd-v">${capLbl[verdict] || esc(verdict)}</div>
        <div class="fez-verd-n">nivel maxim de risc de capacitate între utilități — de confirmat cu operatorii</div>
      </div>

      <div class="fez-kpi">
        <div class="k"><div class="v">${eur(cost.total)}</div><div class="l">CAPEX total estimat</div></div>
        <div class="k"><div class="v">${eur(cost.perMp)}/m²</div><div class="l">Cost specific</div></div>
        <div class="k"><div class="v">${eur(cost.opexAnual)}/an</div><div class="l">OPEX (mentenanță)</div></div>
        <div class="k"><div class="v">${eur(garantie)}</div><div class="l">Garanție racordare electrică</div></div>
      </div>

      <h3>Cerințe de racordare la utilități</h3>
      <table class="fez-t"><thead><tr><th>Utilitate</th><th>De solicitat operatorului</th><th>Cost</th><th>Risc</th></tr></thead>
        <tbody>${utilRows}</tbody></table>

      <div class="fez-2col">
        <div>
          <h3>CAPEX pe specialități (top)</h3>
          <table class="fez-t"><thead><tr><th>Specialitate</th><th class="num">Cost</th><th class="num">Pondere</th></tr></thead>
            <tbody>${topCapex}<tr class="tot"><td>TOTAL</td><td class="num">${eur(cost.total)}</td><td class="num">100%</td></tr></tbody></table>
        </div>
        <div>
          <h3>Termene-capcană</h3>
          <ul class="fez-tl">${tlItems}</ul>
        </div>
      </div>

      <h3>Riscuri principale</h3>
      <table class="fez-t"><thead><tr><th>Categorie</th><th>Nivel</th><th>Măsură de atenuare</th></tr></thead>
        <tbody>${topRisc}</tbody></table>

      <p class="fez-foot">${esc(racordare && racordare.nota || "")} Document generat cu SOWILO Dimensionare${c.proiectant ? " · " + esc(c.proiectant) : ""}.</p>
    </div>`;
  }

  const api = { buildFezabilitate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FEZABILITATE = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
