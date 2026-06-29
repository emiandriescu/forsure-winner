/* ===== SOWILO Dimensionare — construire memoriu tehnic (print-view → PDF) =====
   Generează HTML-ul memoriului în structura standard (oglindă după Hotel Sinaia).
   Faza curentă: secțiunea Stingere incendiu, completă, cu breviar de calcul.
*/
(function (root) {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const eur = (n) => Number(n || 0).toLocaleString("ro-RO") + " €";

  function buildMemoriu({ company, project, dim, crb, apa, canalizare, electrice, gaze }) {
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

    // ---- Capitol RACORDARE UTILITĂȚI (apă + canalizare + electrice + gaze) ----
    const sysDoc = (titlu, normativ, params, steps) =>
      `<div class="sys"><h4>${esc(titlu)} <span class="nrm">(${esc(normativ || "")})</span></h4>` +
      (params ? `<p class="params">${esc(params)}</p>` : "") +
      `<ul class="breviar">${(steps || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`;

    let apaHtml = "";
    if (apa || canalizare || electrice || gaze) {
      apaHtml += `<h3>2. Cerințe de racordare la utilități publice</h3>`;
      if (apa) {
        const ad = apa.debite;
        const consRows = ad.consumatori.map((cc) => `<tr><td>${esc(cc.nume)}</td><td class="num">${cc.cantitate} ${esc(cc.unit)}</td><td class="num">${cc.specific_l ? cc.specific_l + " l" : "—"}</td><td class="num">${cc.Q} mc/zi</td></tr>`).join("");
        apaHtml += `<h4>2.1. Apă rece</h4>
          <table class="grid"><thead><tr><th>Consumator</th><th class="num">Cantitate</th><th class="num">Consum specific</th><th class="num">Q</th></tr></thead>
            <tbody>${consRows}<tr class="grand"><td>Q zilnic mediu</td><td></td><td></td><td class="num">${ad.Qzi_med} mc/zi</td></tr></tbody></table>
          ${sysDoc("Debite de calcul", ad.normativ, `Qzi,med = ${ad.Qzi_med} mc/zi · Qmax,zi = ${ad.Qmax_zi} mc/zi · Qmax,orar = ${ad.Qmax_orar_mc} mc/h (${ad.Qmax_orar_ls} l/s)`, ad.steps)}
          <p class="note"><b>Solicitare apă rece:</b> debit nominal ≈ ${ad.Qnominal_ls} l/s, ${esc(ad.dn)} (PEID PE100), presiune ≥ ${ad.presiune_bar} bar, apometru cu transmisie la distanță.</p>`;
      }
      if (canalizare) {
        const cn = canalizare;
        apaHtml += `<h4>2.2. Canalizare</h4>` +
          sysDoc(cn.menajera.sistem, cn.menajera.normativ, `Qu = ${cn.menajera.Qu_zi} mc/zi · ${cn.menajera.Qu_orar_ls} l/s · racord ${cn.menajera.dn}`, cn.menajera.steps) +
          (cn.pluviala.necesar ? sysDoc(cn.pluviala.sistem, cn.pluviala.normativ, `Q = ${cn.pluviala.Q} l/s · racord ${cn.pluviala.dn}`, cn.pluviala.steps) : "") +
          (cn.separatoare.length ? `<p class="note"><b>Separatoare obligatorii:</b> ${cn.separatoare.map((s) => esc(s.tip) + " (" + esc(s.normativ) + ")").join("; ")}.</p>` : "");
      }
      if (electrice) {
        const e = electrice;
        apaHtml += `<h4>2.3. Energie electrică</h4>` +
          sysDoc(e.sistem, e.normativ, `Pi = ${e.Pi} kW · Pa = ${e.Pa} kW · S = ${e.S} kVA · post trafo ${e.trafo} · grup electrogen ${e.ge}`, e.steps);
      }
      if (gaze) {
        const g = gaze;
        apaHtml += `<h4>2.4. Gaze naturale</h4>` +
          sysDoc(g.sistem, g.normativ, `P instalată = ${g.P_total} kW · debit gaz q = ${g.q} mc/h · PRM ${g.prm} mc/h`, g.steps);
      }
    }
    if (apa) {
      const ar = apa.rezervor, as = apa.statie;
      apaHtml += `<h3>3. Instalații sanitare — rezervor de consum și stație hidrofor</h3>
        ${sysDoc(ar.sistem, ar.normativ, `Volum adoptat: ${ar.adoptat} mc · autonomie ${ar.autonomie}h`, ar.steps)}
        ${sysDoc(as.sistem, as.normativ, `H = ${as.H_mCA} mCA (${as.H_bar} bar) · Q stație = ${as.Qstatie} l/s`, as.steps)}`;
    }

    return `<div class="doc">
      <div class="doc-head">
        <div class="doc-firm">
          ${c.logo ? `<img class="doc-logo" src="${c.logo}" alt="" />` : ""}
          <h2>${esc(c.name || "SOWILO SRL")}</h2>
          ${atestate ? `<p>${esc(atestate)}</p>` : ""}
          ${firmContact ? `<p>${esc(firmContact)}</p>` : ""}
        </div>
        <div class="doc-title"><h1>MEMORIU TEHNIC</h1><p>${apa ? "Racordare utilități + dimensionare instalații (apă rece, stingere incendiu)" : "Dimensionare instalații de stingere a incendiilor"}</p>
          <p>${esc(p.name || "Obiectiv")}</p><p>${esc(p.data || "")}</p></div>
      </div>

      <h3>1. Date generale ale obiectivului</h3>
      <table class="kv">
        <tr><td>Denumire obiectiv</td><td>${esc(p.name || "—")}</td></tr>
        <tr><td>Beneficiar</td><td>${esc(p.beneficiar || "—")}</td></tr>
        <tr><td>Amplasament</td><td>${esc(p.adresa || "—")}</td></tr>
        <tr><td>Funcțiune</td><td>${esc(prof.functiune || "—")}</td></tr>
        <tr><td>${esc(prof.etichetaUnit || "Unități")}</td><td>${prof.valoareUnit || "—"}${prof.persoane ? " · " + prof.persoane + " persoane (estimat)" : ""}</td></tr>
        <tr><td>Niveluri supraterane / înălțime ultim planșeu</td><td>${prof.nrNiveluriSupraterane || "—"} / ${prof.inaltimeUltimPlanseu || "—"} m</td></tr>
        <tr><td>Nivel de stabilitate la foc</td><td>${esc(prof.nivelStabilitate || "—")}</td></tr>
        <tr><td>Parcaj subteran</td><td>${prof.parcaj && prof.parcaj.locuri ? prof.parcaj.locuri + " locuri" + (prof.parcaj.nrNiveluri ? " pe " + prof.parcaj.nrNiveluri + " niveluri" : "") + ", ~" + (prof.parcaj.arieProtejata || 0) + " m² protejați" : "—"}</td></tr>
        ${prof.office && prof.office.are ? `<tr><td>Zonă office/retail la parter</td><td>~${prof.office.arie || 0} m² · ${prof.office.persoane || 0} persoane</td></tr>` : ""}
      </table>

      <h3>1.1. Stingere incendiu — încadrarea în normativele de securitate la incendiu</h3>
      <table class="grid">
        <thead><tr><th>Sistem</th><th>Obligatoriu</th><th>Temei normativ</th></tr></thead>
        <tbody>${oblig}</tbody>
      </table>
      ${apaHtml}
      <h3>4. Stingere incendiu — dimensionarea sistemelor (breviar de calcul)</h3>
      ${sisteme}

      <h3>5. Rezervor de incendiu (rezervă intangibilă)</h3>
      <table class="grid"><tbody>${rezComp}
        <tr class="sum"><td>Subtotal</td><td class="num">${rez.subtotal} m³</td></tr>
        <tr class="sum"><td>Marjă de proiectare +${rez.marja * 100}%</td><td class="num"></td></tr>
        <tr class="grand"><td>VOLUM REZERVOR ADOPTAT</td><td class="num">${rez.adoptat} m³</td></tr>
      </tbody></table>
      <p class="note">Recompletare automată din branșamentul de apă rece, timp maxim ≤ 24h. Cuvă impermeabilizată, control nivel prin sonde cu transmisie BMS, două compartimente cu by-pass pentru întreținere.</p>

      <h3>6. Grup de pompare incendiu</h3>
      <table class="kv">
        <tr><td>Pompe principale (sprinklere + hidranți interiori)</td><td>${gp.pompePrincipale.Q} l/s · ${gp.pompePrincipale.H_mCA} mCA · ${esc(gp.pompePrincipale.config)}</td></tr>
        <tr><td>Pompe hidranți exteriori</td><td>${gp.pompeHidrantiExt.Q} l/s · ${gp.pompeHidrantiExt.H_mCA} mCA · ${esc(gp.pompeHidrantiExt.config)}</td></tr>
        <tr><td>Pompă pilot (jockey)</td><td>${gp.jockey.Q} l/s · ${gp.jockey.H_mCA} mCA</td></tr>
      </table>
      <p class="note">Pompe atestate IGSU/MAI, alimentare din TGD + AAR la grup electrogen (consumator vital cf. I7/2023), încăpere cu separare EI 120.</p>

      <h3>7. Analiză cost–risc–beneficiu</h3>
      <h4>7.1. Estimare cost (CAPEX orientativ)</h4>
      <table class="grid"><thead><tr><th>Element</th><th class="num">Cantitate</th><th class="num">Preț unitar</th><th class="num">Total</th></tr></thead>
        <tbody>${costLines}<tr class="grand"><td>TOTAL estimat</td><td></td><td></td><td class="num">${eur(crb.cost.total)}</td></tr></tbody></table>
      <h4>7.2. Riscuri / atenționări</h4><ul class="breviar">${riscItems}</ul>
      <h4>7.3. Beneficii</h4><ul class="breviar">${benItems}</ul>

      <h3>8. Concluzii</h3>
      <p>Soluția de stingere a fost dimensionată conform normativelor în vigoare. Rezerva intangibilă adoptată este de <b>${rez.adoptat} m³</b>, asigurată dintr-un rezervor propriu și un grup de pompare atestat IGSU. Dimensionările au caracter preliminar (faza DTAC); calculul hidraulic complet și numărul exact de capete sprinkler se confirmă la faza Proiect Tehnic.</p>

      <div class="doc-sign"><div class="sig">Întocmit,<br/>${esc(c.name || "SOWILO SRL")}${c.proiectant ? "<br/>" + esc(c.proiectant) : ""}</div><div class="sig">Verificat</div></div>
      <div class="doc-foot"><span>${esc(c.name || "")}</span><span>Generat cu SOWILO Dimensionare</span></div>
    </div>`;
  }

  const api = { buildMemoriu };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MEMORIU = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
