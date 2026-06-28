/* ===== SOWILO Dimensionare — orchestrare UI ===== */
(function () {
  "use strict";
  const KEY = "sowilo_dim_v1";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const eur = (n) => Number(n || 0).toLocaleString("ro-RO") + " €";

  const defaultState = () => ({ company: { name: "SOWILO SRL", atestate: [] }, projects: [], seq: 1 });
  let state = load();
  function load() { try { const r = localStorage.getItem(KEY); return r ? Object.assign(defaultState(), JSON.parse(r)) : defaultState(); } catch (e) { return defaultState(); } }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  const uid = () => Date.now().toString(36) + (state.seq++).toString(36);
  function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 2200); }

  /* tabs */
  $$(".tab").forEach((b) => b.addEventListener("click", () => {
    $$(".tab").forEach((x) => x.classList.toggle("is-active", x === b));
    $$(".panel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === b.dataset.tab));
    showList();
  }));

  /* ---------- COMPANY ---------- */
  const cform = $("#company-form");
  function fillCompany() {
    const c = state.company;
    cform.elements.name.value = c.name || "";
    cform.elements.cui.value = c.cui || "";
    cform.elements.proiectant.value = c.proiectant || "";
    cform.elements.atestate.value = (c.atestate || []).join(", ");
    cform.elements.phone.value = c.phone || "";
    cform.elements.email.value = c.email || "";
    const img = $("#logo-preview"); if (c.logo) { img.src = c.logo; img.hidden = false; } else img.hidden = true;
  }
  cform.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = state.company;
    c.name = cform.elements.name.value.trim();
    c.cui = cform.elements.cui.value.trim();
    c.proiectant = cform.elements.proiectant.value.trim();
    c.atestate = cform.elements.atestate.value.split(",").map((s) => s.trim()).filter(Boolean);
    c.phone = cform.elements.phone.value.trim();
    c.email = cform.elements.email.value.trim();
    save(); const h = $("#company-saved"); h.hidden = false; setTimeout(() => (h.hidden = true), 1600); toast("Date firmă salvate");
  });
  $("#logo-input").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { state.company.logo = r.result; const img = $("#logo-preview"); img.src = r.result; img.hidden = false; save(); }; r.readAsDataURL(f);
  });
  $("#logo-clear").addEventListener("click", () => { state.company.logo = ""; $("#logo-preview").hidden = true; $("#logo-input").value = ""; save(); });

  /* ---------- PROJECTS ---------- */
  const modal = $("#proj-modal");
  const pform = $("#proj-form");

  function showList() { $("#view-list").hidden = false; $("#view-results").hidden = true; }
  function showResults() { $("#view-list").hidden = true; $("#view-results").hidden = false; }

  function renderList() {
    const list = $("#proj-list"); const empty = $("#proj-empty");
    list.innerHTML = "";
    if (!state.projects.length) { empty.classList.add("show"); return; }
    empty.classList.remove("show");
    state.projects.forEach((p) => {
      const dim = p.dim;
      const card = document.createElement("div"); card.className = "card";
      card.innerHTML = `<div class="card-title">${esc(p.name)}</div>
        <div class="card-meta">${esc(p.functiune || "")}${p.beneficiar ? " · " + esc(p.beneficiar) : ""}</div>
        <div class="card-meta">Rezervor incendiu: <b>${dim ? dim.rezervor.adoptat + " m³" : "—"}</b></div>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" data-open="${p.id}">Deschide</button>
          <button class="btn btn-ghost btn-sm" data-pdf="${p.id}">PDF</button>
          <button class="btn-danger" data-del="${p.id}">Șterge</button></div>`;
      list.appendChild(card);
    });
  }

  function blankProject() {
    return { id: "", name: "", beneficiar: "", adresa: "", functiune: "hotel", data: "",
      locuriCazare: "", nrCamere: "", nrNiveluriSupraterane: "", acNivel: "", inaltimeUltimPlanseu: "",
      nivelStabilitate: "II", parcLocuri: "", parcArie: "", volumCompartiment: "", saliAglomerate: "true", risc: "mediu" };
  }

  function openProjectForm(p) {
    p = p || blankProject();
    $("#proj-modal-title").textContent = p.id ? "Editează proiect" : "Proiect nou";
    pform.elements.id.value = p.id;
    ["name","beneficiar","adresa","functiune","data","locuriCazare","nrCamere","nrNiveluriSupraterane","acNivel","inaltimeUltimPlanseu","nivelStabilitate","volumCompartiment","risc"].forEach((k) => { if (pform.elements[k]) pform.elements[k].value = p[k] != null ? p[k] : ""; });
    pform.elements.parcLocuri.value = p.parcLocuri != null ? p.parcLocuri : "";
    pform.elements.parcArie.value = p.parcArie != null ? p.parcArie : "";
    pform.elements.saliAglomerate.value = String(p.saliAglomerate !== false && p.saliAglomerate !== "false");
    modal.showModal();
  }

  function readProjectForm() {
    const g = (k) => pform.elements[k] ? pform.elements[k].value : "";
    const num = (k) => { const v = parseFloat(g(k)); return isNaN(v) ? 0 : v; };
    return {
      id: g("id"), name: g("name").trim(), beneficiar: g("beneficiar").trim(), adresa: g("adresa").trim(),
      functiune: g("functiune"), data: g("data").trim(),
      locuriCazare: num("locuriCazare"), nrCamere: num("nrCamere"), nrNiveluriSupraterane: num("nrNiveluriSupraterane"),
      acNivel: num("acNivel"), inaltimeUltimPlanseu: num("inaltimeUltimPlanseu"),
      nivelStabilitate: g("nivelStabilitate"), parcLocuri: num("parcLocuri"), parcArie: num("parcArie"),
      volumCompartiment: num("volumCompartiment") || 30000,
      saliAglomerate: g("saliAglomerate") === "true", risc: g("risc"),
    };
  }

  // mapează proiectul în profilul motorului de calcul
  function toProfile(p) {
    return {
      functiune: p.functiune, locuriCazare: p.locuriCazare, nrCamere: p.nrCamere,
      acNivel: p.acNivel, nrNiveluriSupraterane: p.nrNiveluriSupraterane, inaltimeUltimPlanseu: p.inaltimeUltimPlanseu,
      saliAglomerate: p.saliAglomerate, nivelStabilitate: p.nivelStabilitate,
      volumCompartiment: p.volumCompartiment, risc: p.risc,
      parcaj: { locuri: p.parcLocuri || 0, arieProtejata: p.parcArie || 0 },
    };
  }

  function computeProject(p) {
    const dim = STINGERE.dimensionareStingere(toProfile(p));
    const crb = CRB.costRiscBeneficiu(dim);
    p.dim = dim; p.crb = crb;
    return p;
  }

  $("#proj-cancel").addEventListener("click", () => modal.close());
  pform.addEventListener("submit", (e) => {
    if (!pform.elements.name.value.trim()) { e.preventDefault(); return; }
    const data = readProjectForm();
    if (data.id) { const idx = state.projects.findIndex((x) => x.id === data.id); if (idx >= 0) data.dim = state.projects[idx].dim; state.projects[idx] = computeProject(data); }
    else { data.id = uid(); state.projects.push(computeProject(data)); }
    save(); renderList(); openResults(data.id); toast("Proiect calculat");
  });

  /* ---------- RESULTS ---------- */
  let currentId = null;
  function openResults(id) {
    const p = state.projects.find((x) => x.id === id); if (!p) return;
    currentId = id;
    if (!p.dim) computeProject(p), save();
    $("#res-title").textContent = p.name;
    $("#res-sub").textContent = [p.functiune, p.beneficiar, p.adresa].filter(Boolean).join(" · ");
    $("#res-body").innerHTML = renderResults(p);
    showResults();
  }

  function renderResults(p) {
    const dim = p.dim, crb = p.crb;
    const oblig = `<table class="oblig"><thead><tr><th>Sistem</th><th>Obligatoriu</th><th>Temei normativ</th></tr></thead><tbody>${
      dim.obligativitate.map((o) => `<tr><td>${esc(o.sistem)}</td><td class="${o.obligatoriu ? "da" : "nu"}">${o.obligatoriu ? "DA" : "NU"}</td><td>${esc(o.motiv || "")}</td></tr>`).join("")
    }</tbody></table>`;

    const sisteme = dim.sisteme.map((s) => {
      const params = [];
      if (s.Q != null) params.push(`Q = ${s.Q} l/s`);
      if (s.rezerva != null) params.push(`rezervă = ${s.rezerva} m³`);
      if (s.timp != null) params.push(`t = ${s.timp} min`);
      if (s.nrHidranti != null) params.push(`${s.nrHidranti} hidranți`);
      if (s.capeteTotal) params.push(`≈ ${s.capeteTotal} capete`);
      return `<div class="sys-card"><h4>${esc(s.sistem)} <span class="nrm">(${esc(s.normativ || "")})</span></h4>
        <p class="params">${params.join(" · ")}</p>
        <ul>${(s.steps || []).map((st) => `<li>${esc(st)}</li>`).join("")}</ul></div>`;
    }).join("");

    const big = `<div class="bignum">
      <div class="b"><div class="v">${dim.rezervor.adoptat} m³</div><div class="l">Rezervor de incendiu</div></div>
      <div class="b"><div class="v">${dim.pompare.pompePrincipale.Q} l/s</div><div class="l">Debit pompe principale</div></div>
      <div class="b"><div class="v">${eur(crb.cost.total)}</div><div class="l">Cost estimat (CAPEX)</div></div>
    </div>`;

    const cost = `<table class="crb-cost"><thead><tr><th>Element</th><th class="num">Cant.</th><th class="num">Preț unitar</th><th class="num">Total</th></tr></thead><tbody>${
      crb.cost.lines.map((l) => `<tr><td>${esc(l.eticheta)}</td><td class="num">${l.qty} ${esc(l.unit)}</td><td class="num">${eur(l.pretUnit)}</td><td class="num">${eur(l.total)}</td></tr>`).join("")
    }<tr class="grand"><td>TOTAL</td><td></td><td></td><td class="num">${eur(crb.cost.total)}</td></tr></tbody></table>`;

    return `${big}
      <h2>Încadrare în obligativitate</h2>${oblig}
      <h2>Sisteme dimensionate (breviar de calcul)</h2>${sisteme}
      <h2>Rezervor de incendiu</h2>
      <div class="sys-card"><p class="params">Adoptat: ${dim.rezervor.adoptat} m³ (subtotal ${dim.rezervor.subtotal} m³ + marjă ${dim.rezervor.marja * 100}%)</p>
        <ul>${dim.rezervor.steps.map((st) => `<li>${esc(st)}</li>`).join("")}</ul></div>
      <h2>Grup de pompare</h2>
      <div class="sys-card"><ul>${dim.pompare.steps.map((st) => `<li>${esc(st)}</li>`).join("")}</ul></div>
      <h2>Cost · Risc · Beneficiu</h2>
      <h3 style="margin:8px 0">Cost (CAPEX orientativ)</h3>${cost}
      <h3 style="margin:14px 0 4px">Riscuri / atenționări</h3><ul class="crb-list">${crb.risc.map((x) => `<li>${esc(x.text)}</li>`).join("")}</ul>
      <h3 style="margin:14px 0 4px">Beneficii</h3><ul class="crb-list">${crb.beneficiu.map((x) => `<li>${esc(x.text)}</li>`).join("")}</ul>`;
  }

  function printMemoriu(p) {
    if (!p.dim) computeProject(p);
    $("#print-view").innerHTML = MEMORIU.buildMemoriu({ company: state.company, project: p, dim: p.dim, crb: p.crb });
    const t = document.title; document.title = `Memoriu - ${p.name}`;
    window.print(); setTimeout(() => (document.title = t), 500);
  }

  /* events */
  $("#btn-new").addEventListener("click", () => openProjectForm(null));
  $("#btn-back").addEventListener("click", () => { showList(); renderList(); });
  $("#btn-edit").addEventListener("click", () => { const p = state.projects.find((x) => x.id === currentId); if (p) openProjectForm(p); });
  $("#btn-pdf").addEventListener("click", () => { const p = state.projects.find((x) => x.id === currentId); if (p) printMemoriu(p); });
  $("#proj-list").addEventListener("click", (e) => {
    const t = e.target.dataset;
    if (t.open) openResults(t.open);
    else if (t.pdf) printMemoriu(state.projects.find((x) => x.id === t.pdf));
    else if (t.del && confirm("Ștergi acest proiect?")) { state.projects = state.projects.filter((x) => x.id !== t.del); save(); renderList(); }
  });
  document.addEventListener("click", (e) => { if (e.target.dataset.action === "new") openProjectForm(null); });

  /* demo Hotel Sinaia */
  $("#btn-demo").addEventListener("click", () => {
    const demo = { id: uid(), name: "Hotel **** Sinaia", beneficiar: "Conform contract", adresa: "Str. Mănăstirii nr. 7, Sinaia, jud. Prahova",
      functiune: "hotel", data: "Iunie 2026", locuriCazare: 180, nrCamere: 90, nrNiveluriSupraterane: 4, acNivel: 1525,
      inaltimeUltimPlanseu: 17, nivelStabilitate: "II", parcLocuri: 120, parcArie: 5000, volumCompartiment: 35000, saliAglomerate: true, risc: "mediu" };
    state.projects.push(computeProject(demo)); save(); renderList(); openResults(demo.id); toast("Exemplu Hotel Sinaia încărcat");
  });

  /* export / import */
  $("#btn-export").addEventListener("click", () => {
    const b = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "sowilo-dimensionare-backup.json"; a.click(); URL.revokeObjectURL(a.href); toast("Backup descărcat");
  });
  $("#btn-import").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); if (!confirm("Importul înlocuiește datele actuale. Continui?")) return; state = Object.assign(defaultState(), d); save(); renderAll(); toast("Date importate"); } catch (err) { toast("Fișier invalid"); } finally { e.target.value = ""; } };
    r.readAsText(f);
  });

  /* init */
  function renderAll() { fillCompany(); renderList(); showList(); }
  renderAll();
})();
