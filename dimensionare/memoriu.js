/* ===== SOWILO Dimensionare — construire memoriu tehnic (print-view → PDF) =====
   Generează HTML-ul memoriului în structura standard (oglindă după Hotel Sinaia).
   Faza curentă: secțiunea Stingere incendiu, completă, cu breviar de calcul.
*/
(function (root) {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const eur = (n) => Number(n || 0).toLocaleString("ro-RO") + " €";

  function buildMemoriu({ company, project, dim, crb }) {
    const c = company || {};
    const p = project || {};
    const prof = dim.profile;

    const firmContact = [c.proiectant && "Proiectant: " + c.proiectant, c.cui && "CUI: " + c.cui, c.phone, c.email].filter(Boolean).join(" · ");
    const atestate = (c.atestate && c.atestate.length) ? c.atestate.join(", ") : "";

    // Tabel obligativitate
    const oblig = dim.obligativitate.map((o) =>
      `<tr><td>${esc(o.sistem)}</td><td class="${o.obligatoriu ? "da" : "nu"}">${o.obligatoriu ? "DA" : "NU"}</td><td>${esc(o.motiv || "")}</td></tr>`
    ).join("");

    // Sisteme cu breviar de calcul
    const sisteme = dim.sisteme.map((s) => {
      const steps = (s.steps || []).map((st) => `<li>${esc(st)}</li>`).join("");
      const params = [];
      if (s.Q != null) params.push(`Q = ${s.Q} l/s`);
      if (s.rezerva != null) params.push(`rezervă = ${s.rezerva} m³`);
      if (s.timp != null) params.push(`t = ${s.timp} min`);
      if (s.nrHidranti != null) params.push(`${s.nrHidranti} hidranți`);
      if (s.capeteTotal) params.push(`≈ ${s.capeteTotal} capete`);
      return `<div class="sys"><h4>${esc(s.sistem)} <span class="nrm">(${esc(s.normativ || "")})</span></h4>
        <p class="params">${params.join(" · ")}</p>
        <ul class="breviar">${steps}</ul></div>`;
    }).join("");

    // Rezervor
    const rez = dim.rezervor;
    const rezComp = rez.componente.map((x) => `<tr><td>${esc(x.eticheta)}</td><td class="num">${x.rezerva} m³</td></tr>`).join("");

    // Grup pompare
    const gp = dim.pompare;

    // Cost
    const costLines = crb.cost.lines.map((l) =>
      `<tr><td>${esc(l.eticheta)}</td><td class="num">${l.qty} ${esc(l.unit)}</td><td class="num">${eur(l.pretUnit)}</td><td class="num">${eur(l.total)}</td></tr>`
    ).join("");

    const riscItems = crb.risc.map((x) => `<li>${esc(x.text)}</li>`).join("");
    const benItems = crb.beneficiu.map((x) => `<li>${esc(x.text)}</li>`).join("");

    return `<div class="doc">
      <div class="doc-head">
        <div class="doc-firm">
          ${c.logo ? `<img class="doc-logo" src="${c.logo}" alt="" />` : ""}
          <h2>${esc(c.name || "SOWILO SRL")}</h2>
          ${atestate ? `<p>${esc(atestate)}</p>` : ""}
          ${firmContact ? `<p>${esc(firmContact)}</p>` : ""}
        </div>
        <div class="doc-title"><h1>MEMORIU TEHNIC</h1><p>Dimensionare instalații de stingere a incendiilor</p>
          <p>${esc(p.name || "Obiectiv")}</p><p>${esc(p.data || "")}</p></div>
      </div>

      <h3>1. Date generale ale obiectivului</h3>
      <table class="kv">
        <tr><td>Denumire obiectiv</td><td>${esc(p.name || "—")}</td></tr>
        <tr><td>Beneficiar</td><td>${esc(p.beneficiar || "—")}</td></tr>
        <tr><td>Amplasament</td><td>${esc(p.adresa || "—")}</td></tr>
        <tr><td>Funcțiune</td><td>${esc(prof.functiune || "—")}</td></tr>
        <tr><td>Locuri de cazare / camere</td><td>${prof.locuriCazare || "—"} locuri / ${prof.nrCamere || "—"} camere</td></tr>
        <tr><td>Niveluri supraterane / înălțime ultim planșeu</td><td>${prof.nrNiveluriSupraterane || "—"} / ${prof.inaltimeUltimPlanseu || "—"} m</td></tr>
        <tr><td>Nivel de stabilitate la foc</td><td>${esc(prof.nivelStabilitate || "—")}</td></tr>
        <tr><td>Parcaj subteran</td><td>${prof.parcaj && prof.parcaj.locuri ? prof.parcaj.locuri + " locuri, ~" + (prof.parcaj.arieProtejata || 0) + " m² protejați" : "—"}</td></tr>
      </table>

      <h3>1.1. Încadrarea în normativele de securitate la incendiu</h3>
      <table class="grid">
        <thead><tr><th>Sistem</th><th>Obligatoriu</th><th>Temei normativ</th></tr></thead>
        <tbody>${oblig}</tbody>
      </table>

      <h3>2. Dimensionarea sistemelor de stingere (breviar de calcul)</h3>
      ${sisteme}

      <h3>3. Rezervor de incendiu (rezervă intangibilă)</h3>
      <table class="grid"><tbody>${rezComp}
        <tr class="sum"><td>Subtotal</td><td class="num">${rez.subtotal} m³</td></tr>
        <tr class="sum"><td>Marjă de proiectare +${rez.marja * 100}%</td><td class="num"></td></tr>
        <tr class="grand"><td>VOLUM REZERVOR ADOPTAT</td><td class="num">${rez.adoptat} m³</td></tr>
      </tbody></table>
      <p class="note">Recompletare automată din branșamentul de apă rece, timp maxim ≤ 24h. Cuvă impermeabilizată, control nivel prin sonde cu transmisie BMS, două compartimente cu by-pass pentru întreținere.</p>

      <h3>4. Grup de pompare incendiu</h3>
      <table class="kv">
        <tr><td>Pompe principale (sprinklere + hidranți interiori)</td><td>${gp.pompePrincipale.Q} l/s · ${gp.pompePrincipale.H_mCA} mCA · ${esc(gp.pompePrincipale.config)}</td></tr>
        <tr><td>Pompe hidranți exteriori</td><td>${gp.pompeHidrantiExt.Q} l/s · ${gp.pompeHidrantiExt.H_mCA} mCA · ${esc(gp.pompeHidrantiExt.config)}</td></tr>
        <tr><td>Pompă pilot (jockey)</td><td>${gp.jockey.Q} l/s · ${gp.jockey.H_mCA} mCA</td></tr>
      </table>
      <p class="note">Pompe atestate IGSU/MAI, alimentare din TGD + AAR la grup electrogen (consumator vital cf. I7/2023), încăpere cu separare EI 120.</p>

      <h3>5. Analiză cost–risc–beneficiu</h3>
      <h4>5.1. Estimare cost (CAPEX orientativ)</h4>
      <table class="grid"><thead><tr><th>Element</th><th class="num">Cantitate</th><th class="num">Preț unitar</th><th class="num">Total</th></tr></thead>
        <tbody>${costLines}<tr class="grand"><td>TOTAL estimat</td><td></td><td></td><td class="num">${eur(crb.cost.total)}</td></tr></tbody></table>
      <h4>5.2. Riscuri / atenționări</h4><ul class="breviar">${riscItems}</ul>
      <h4>5.3. Beneficii</h4><ul class="breviar">${benItems}</ul>

      <h3>6. Concluzii</h3>
      <p>Soluția de stingere a fost dimensionată conform normativelor în vigoare. Rezerva intangibilă adoptată este de <b>${rez.adoptat} m³</b>, asigurată dintr-un rezervor propriu și un grup de pompare atestat IGSU. Dimensionările au caracter preliminar (faza DTAC); calculul hidraulic complet și numărul exact de capete sprinkler se confirmă la faza Proiect Tehnic.</p>

      <div class="doc-sign"><div class="sig">Întocmit,<br/>${esc(c.name || "SOWILO SRL")}${c.proiectant ? "<br/>" + esc(c.proiectant) : ""}</div><div class="sig">Verificat</div></div>
      <div class="doc-foot"><span>${esc(c.name || "")}</span><span>Generat cu SOWILO Dimensionare</span></div>
    </div>`;
  }

  const api = { buildMemoriu };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MEMORIU = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
