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

  /* ---------- SETĂRI AI ---------- */
  const aiform = $("#ai-form");
  function fillAI() {
    if (!aiform) return;
    aiform.elements.proxy.value = (function () { try { return localStorage.getItem("sowilo_ai_proxy") || ""; } catch (e) { return ""; } })();
    aiform.elements.key.value = (function () { try { return localStorage.getItem("sowilo_anthropic_key") || ""; } catch (e) { return ""; } })();
  }
  if (aiform) {
    aiform.addEventListener("submit", (e) => {
      e.preventDefault();
      const proxy = aiform.elements.proxy.value.trim(), key = aiform.elements.key.value.trim();
      try {
        if (proxy) localStorage.setItem("sowilo_ai_proxy", proxy); else localStorage.removeItem("sowilo_ai_proxy");
        if (key) localStorage.setItem("sowilo_anthropic_key", key); else localStorage.removeItem("sowilo_anthropic_key");
      } catch (err) {}
      const h = $("#ai-saved"); h.hidden = false; setTimeout(() => (h.hidden = true), 1600); toast("Setări AI salvate");
    });
    $("#ai-clear").addEventListener("click", () => {
      try { localStorage.removeItem("sowilo_ai_proxy"); localStorage.removeItem("sowilo_anthropic_key"); } catch (err) {}
      aiform.reset(); toast("Setări AI șterse");
    });
  }

  /* ---------- CATALOG DE PREȚURI ---------- */
  function loadPreturiOverrides() { try { return JSON.parse(localStorage.getItem("sowilo_preturi") || "{}"); } catch (e) { return {}; } }
  function currentPreturi() { return CRB.mergePreturi(loadPreturiOverrides()); }
  const pretform = $("#pret-form");
  function fillPreturi() {
    const cont = $("#pret-fields"); if (!cont || typeof CRB === "undefined") return;
    const pr = currentPreturi();
    const grupuri = [];
    CRB.PRETURI_META.forEach((m) => { if (!grupuri.includes(m.grup)) grupuri.push(m.grup); });
    cont.innerHTML = grupuri.map((g) => {
      const fields = CRB.PRETURI_META.filter((m) => m.grup === g).map((m) => {
        const val = m.pct ? Math.round(pr[m.key] * 1000) / 10 : pr[m.key];
        return `<label class="field"><span>${esc(m.eticheta)} <small class="muted">${esc(m.unit)}</small></span>
          <input name="${esc(m.key)}" type="number" min="0" step="any" value="${val}" /></label>`;
      }).join("");
      return `<div class="pret-grup"><h4>${esc(g)}</h4><div class="pret-grid">${fields}</div></div>`;
    }).join("");
  }
  function recomputeAll() {
    state.projects.forEach((p) => computeProject(p));
    save();
    if (currentId && !$("#view-results").hidden) { const p = state.projects.find((x) => x.id === currentId); if (p) $("#res-body").innerHTML = renderResults(p); }
    renderList();
  }
  if (pretform) {
    pretform.addEventListener("submit", (e) => {
      e.preventDefault();
      const obj = {};
      CRB.PRETURI_META.forEach((m) => {
        const el = pretform.elements[m.key]; if (!el) return;
        let v = parseFloat(el.value); if (isNaN(v) || v < 0) return;
        if (m.pct) v = v / 100;
        obj[m.key] = v;
      });
      try { localStorage.setItem("sowilo_preturi", JSON.stringify(obj)); } catch (err) {}
      recomputeAll();
      const h = $("#pret-saved"); h.hidden = false; setTimeout(() => (h.hidden = true), 1800); toast("Catalog salvat — proiectele au fost recalculate");
    });
    $("#pret-reset").addEventListener("click", () => {
      try { localStorage.removeItem("sowilo_preturi"); } catch (err) {}
      fillPreturi(); recomputeAll(); toast("Catalog resetat la valorile implicite");
    });
  }

  /* ---------- PROJECTS ---------- */
  const modal = $("#proj-modal");
  const pform = $("#proj-form");

  // Configurație per tip de clădire: ce înseamnă câmpul principal + cel secundar.
  const TIPURI = {
    "hotel":              { tip: "turism",      unit: "Nr. camere",          uph: "90",   sec: "Locuri cazare (persoane)", sph: "180" },
    "locuințe colective": { tip: "rezidential", unit: "Nr. apartamente",     uph: "60",   sec: "Persoane / apartament",    sph: "2.5", secDef: 2.5 },
    "birouri":            { tip: "birouri",     unit: "Nr. persoane",        uph: "200" },
    "comercial":          { tip: "comercial",   unit: "Arie comercială (m²)", uph: "1500" },
    "industrial":         { tip: "industrial",  unit: "Nr. persoane",        uph: "50" },
    "spital":             { tip: "spital",      unit: "Nr. paturi",          uph: "120",  sec: "Persoane (estimat)",       sph: "300" },
    "învățământ":         { tip: "invatamant",  unit: "Nr. persoane",        uph: "400" },
  };
  const tipConf = (f) => TIPURI[f] || TIPURI["hotel"];

  function onFunctiuneChange() {
    const conf = tipConf(pform.elements.functiune.value);
    $("#lbl-unit").textContent = conf.unit;
    pform.elements.unitate.placeholder = conf.uph || "";
    const hasSec = !!conf.sec;
    $("#row-secundar").style.display = hasSec ? "" : "none";
    if (hasSec) { $("#lbl-secundar").textContent = conf.sec; pform.elements.secundar.placeholder = conf.sph || ""; }
  }
  function toggleOffice() {
    const on = pform.elements.officeAre.value === "true";
    $$(".office-f").forEach((el) => (el.hidden = !on));
  }

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
          <button class="btn btn-ghost btn-sm" data-dup="${p.id}">⧉ Scenariu</button>
          <button class="btn-danger" data-del="${p.id}">Șterge</button></div>`;
      list.appendChild(card);
    });
  }

  function blankProject() {
    return { id: "", name: "", beneficiar: "", adresa: "", functiune: "hotel", data: "",
      unitate: "", secundar: "", nrNiveluriSupraterane: "", acNivel: "", inaltimeUltimPlanseu: "",
      arieDesfasurata: "", arieAcoperis: "", i_ploaie: "",
      nivelStabilitate: "II", parcLocuri: "", nrNiveluriParcare: "", parcArie: "", volumCompartiment: "",
      saliAglomerate: "true", risc: "mediu", officeAre: "false", officeArie: "", officePersoane: "",
      d_mese: "", d_personal: "", d_bucatarie: "", d_piscina: "", d_spa: "", d_spalatorie: "", d_irigatii: "" };
  }

  function openProjectForm(p) {
    p = p || blankProject();
    $("#proj-modal-title").textContent = p.id ? "Editează proiect" : "Proiect nou";
    pform.elements.id.value = p.id;
    ["name","beneficiar","adresa","functiune","data","unitate","secundar","nrNiveluriSupraterane","acNivel","inaltimeUltimPlanseu","arieDesfasurata","arieAcoperis","i_ploaie","nivelStabilitate","parcLocuri","nrNiveluriParcare","parcArie","volumCompartiment","risc","officeArie","officePersoane","d_mese","d_personal","d_bucatarie","d_piscina","d_spa","d_spalatorie","d_irigatii"]
      .forEach((k) => { if (pform.elements[k]) pform.elements[k].value = p[k] != null ? p[k] : ""; });
    pform.elements.saliAglomerate.value = String(p.saliAglomerate !== false && p.saliAglomerate !== "false");
    pform.elements.officeAre.value = String(p.officeAre === true || p.officeAre === "true");
    const note = $("#ai-ipoteze-note"); if (note) { note.hidden = true; note.innerHTML = ""; }
    onFunctiuneChange(); toggleOffice(); livePreview();
    modal.showModal();
  }

  function readProjectForm() {
    const g = (k) => pform.elements[k] ? pform.elements[k].value : "";
    const num = (k) => { const v = parseFloat(g(k)); return isNaN(v) ? 0 : v; };
    return {
      id: g("id"), name: g("name").trim(), beneficiar: g("beneficiar").trim(), adresa: g("adresa").trim(),
      functiune: g("functiune"), data: g("data").trim(),
      unitate: num("unitate"), secundar: num("secundar"), nrNiveluriSupraterane: num("nrNiveluriSupraterane"),
      acNivel: num("acNivel"), inaltimeUltimPlanseu: num("inaltimeUltimPlanseu"),
      arieDesfasurata: num("arieDesfasurata"), arieAcoperis: num("arieAcoperis"), i_ploaie: num("i_ploaie"),
      nivelStabilitate: g("nivelStabilitate"), parcLocuri: num("parcLocuri"), nrNiveluriParcare: num("nrNiveluriParcare"),
      parcArie: num("parcArie"), volumCompartiment: num("volumCompartiment") || 30000,
      saliAglomerate: g("saliAglomerate") === "true", risc: g("risc"),
      officeAre: g("officeAre") === "true", officeArie: num("officeArie"), officePersoane: num("officePersoane"),
      d_mese: g("d_mese"), d_personal: g("d_personal"), d_bucatarie: g("d_bucatarie"), d_piscina: g("d_piscina"),
      d_spa: g("d_spa"), d_spalatorie: g("d_spalatorie"), d_irigatii: g("d_irigatii"),
    };
  }

  // mapează proiectul în profilul motorului de calcul (type-aware)
  function toProfile(p) {
    const conf = tipConf(p.functiune);
    // compatibilitate cu proiecte vechi (aveau nrCamere/locuriCazare)
    const unitate = p.unitate != null && p.unitate !== "" ? p.unitate : (p.nrCamere || 0);
    const secundar = p.secundar != null && p.secundar !== "" ? p.secundar : (p.locuriCazare || 0);

    let locuriCazare = 0, persoane = 0, nrApartamente = 0, etichetaUnit = conf.unit, valoareUnit = unitate;
    if (conf.tip === "turism") { locuriCazare = secundar; persoane = secundar; }
    else if (conf.tip === "rezidential") { nrApartamente = unitate; persoane = Math.round(unitate * (secundar || conf.secDef || 2.5)); }
    else if (conf.tip === "comercial") { persoane = Math.round(unitate / 5); } // ~1 pers/5 m² (orientativ)
    else { persoane = unitate; }

    let saliAglomerate = p.saliAglomerate;
    let risc = p.risc;
    const office = { are: !!p.officeAre, arie: p.officeArie || 0, persoane: p.officePersoane || 0 };
    if (office.are) { if (office.persoane > 200) saliAglomerate = true; if (risc === "mic") risc = "mediu"; }

    // dotări pentru calculul apei — doar valorile completate (gol → derivat din profil)
    const dotari = {};
    const dn = (k) => { const v = parseFloat(p["d_" + k]); return isNaN(v) ? undefined : v; };
    if (dn("mese") != null) dotari.mese = dn("mese");
    if (dn("personal") != null) dotari.personal = dn("personal");
    if (dn("bucatarie") != null) dotari.bucatarie_mc = dn("bucatarie");
    if (dn("piscina") != null) dotari.piscina_mc = dn("piscina");
    if (dn("spa") != null) dotari.spa_mc = dn("spa");
    if (dn("spalatorie") != null) dotari.spalatorie_mc = dn("spalatorie");
    if (dn("irigatii") != null) dotari.irigatii_mc = dn("irigatii");

    return {
      functiune: p.functiune, tip: conf.tip, etichetaUnit, valoareUnit,
      locuriCazare, persoane, nrApartamente, nrCamere: conf.tip === "turism" ? unitate : 0,
      acNivel: p.acNivel, nrNiveluriSupraterane: p.nrNiveluriSupraterane, inaltimeUltimPlanseu: p.inaltimeUltimPlanseu,
      arieDesfasurata: p.arieDesfasurata || (p.acNivel * p.nrNiveluriSupraterane) || 0,
      arieAcoperis: p.arieAcoperis || 0, i_ploaie: p.i_ploaie || 130,
      cotaGeodezica: p.inaltimeUltimPlanseu || 0,
      saliAglomerate, nivelStabilitate: p.nivelStabilitate, volumCompartiment: p.volumCompartiment, risc,
      office, dotari,
      parcaj: { locuri: p.parcLocuri || 0, arieProtejata: p.parcArie || 0, nrNiveluri: p.nrNiveluriParcare || 0 },
    };
  }

  function computeProject(p) {
    const profile = toProfile(p);
    const dim = STINGERE.dimensionareStingere(profile);
    p.dim = dim;
    p.apa = (typeof APA !== "undefined") ? APA.dimensionareApa(profile) : null;
    p.canalizare = (typeof CANALIZARE !== "undefined") ? CANALIZARE.dimensionareCanalizare(profile, p.apa && p.apa.debite) : null;
    p.electrice = (typeof ELECTRICE !== "undefined") ? ELECTRICE.dimensionareElectrice(profile) : null;
    p.gaze = (typeof GAZE !== "undefined") ? GAZE.dimensionareGaze(profile) : null;
    p.sisteme = (typeof SISTEME !== "undefined") ? SISTEME.dimensionareSisteme(profile) : null;
    p.racordare = (typeof RACORDARE !== "undefined") ? RACORDARE.dimensionareRacordare({ electrice: p.electrice, apa: p.apa, canalizare: p.canalizare, gaze: p.gaze, dim, profile }) : null;
    // Cost-risc-beneficiu pe TOATE specialitățile (după ce toate sunt calculate), cu catalogul utilizatorului
    p.crb = CRB.analizaExtinsa({ profile, dim, apa: p.apa, canalizare: p.canalizare, electrice: p.electrice, gaze: p.gaze, sisteme: p.sisteme }, currentPreturi());
    return p;
  }

  /* ---------- PREVIEW LIVE (recalculare în timp ce tastezi) ---------- */
  let lpTimer = null;
  function livePreview() {
    clearTimeout(lpTimer);
    lpTimer = setTimeout(() => {
      const box = $("#live-preview"); if (!box) return;
      try {
        const p = computeProject(readProjectForm()); // copie proaspătă — nu atinge proiectul salvat
        const sint = p.crb && p.crb.sinteza;
        const rac = p.racordare;
        box.hidden = false;
        box.innerHTML = `<span class="lp-l">⚡ Estimare live:</span>
          <b>${eur(p.crb.cost.total)}</b> CAPEX · <b>${eur(p.crb.cost.perMp)}/m²</b>
          ${sint && sint.perUnitate ? ` · <b>${eur(sint.perUnitate)}</b>/${esc(sint.unitateLabel)}` : ""}
          · rezervor incendiu <b>${p.dim.rezervor.adoptat} m³</b>
          · Pa <b>${p.electrice ? p.electrice.Pa : 0} kW</b>
          ${rac ? ` · racordare: <b class="lvl-txt-${esc(rac.verdict)}">${(rac.verdict || "").toUpperCase()}</b>` : ""}`;
      } catch (e) { box.hidden = true; }
    }, 250);
  }
  pform.addEventListener("input", livePreview);
  pform.addEventListener("change", livePreview);

  pform.elements.functiune.addEventListener("change", onFunctiuneChange);
  pform.elements.officeAre.addEventListener("change", toggleOffice);
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
  // recalculează proiectul dacă lipsește orice parte a schemei curente (proiect vechi din
  // localStorage sau import de backup dintr-o versiune anterioară) — calculul e determinist și ieftin
  function ensureComputed(p) {
    const stale = !p.dim || !p.crb || !p.crb.sinteza || !p.crb.cost || !p.crb.cost.grupuri || !p.racordare || !p.sisteme;
    if (stale) { computeProject(p); save(); }
    return p;
  }
  function openResults(id) {
    const p = state.projects.find((x) => x.id === id); if (!p) return;
    currentId = id;
    ensureComputed(p);
    $("#res-title").textContent = p.name;
    $("#res-sub").textContent = [p.functiune, p.beneficiar, p.adresa].filter(Boolean).join(" · ");
    $("#res-body").innerHTML = renderResults(p);
    fillCmpSelect(p);
    showResults();
  }

  /* ---------- COMPARAȚIE DE SCENARII (A vs B) ---------- */
  function fillCmpSelect(p) {
    const sel = $("#cmp-select"); if (!sel) return;
    const others = state.projects.filter((x) => x.id !== p.id);
    sel.innerHTML = `<option value="">⇄ Compară cu…</option>` +
      others.map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("");
    sel.value = "";
    const area = $("#cmp-area"); area.hidden = true; area.innerHTML = "";
  }

  // specificația indicatorilor comparați: eticheta + extractor + format
  const CMP_SPEC = [
    { grup: "Cost", label: "CAPEX total", get: (p) => p.crb.cost.total, fmt: "eur" },
    { grup: "Cost", label: "Cost specific", get: (p) => p.crb.cost.perMp, fmt: "eur_mp" },
    { grup: "Cost", label: "Cost / unitate", get: (p) => p.crb.sinteza.perUnitate, fmt: "eur" },
    { grup: "Cost", label: "OPEX anual", get: (p) => p.crb.cost.opexAnual, fmt: "eur" },
    { grup: "PSI", label: "Rezervor incendiu", get: (p) => p.dim.rezervor.adoptat, fmt: "m3" },
    { grup: "Apă", label: "Rezervor consum", get: (p) => p.apa && p.apa.rezervor.adoptat, fmt: "mc" },
    { grup: "Apă", label: "Qmax orar", get: (p) => p.apa && p.apa.debite.Qmax_orar_ls, fmt: "ls" },
    { grup: "Apă", label: "Branșament", get: (p) => p.apa && p.apa.debite.dn, fmt: "text" },
    { grup: "Electrice", label: "Putere absorbită Pa", get: (p) => p.electrice && p.electrice.Pa, fmt: "kw" },
    { grup: "Electrice", label: "Post trafo", get: (p) => p.electrice && p.electrice.trafo, fmt: "text" },
    { grup: "Electrice", label: "Grup electrogen", get: (p) => p.electrice && p.electrice.ge, fmt: "text" },
    { grup: "Electrice", label: "Garanție racordare", get: (p) => p.racordare && p.racordare.garantieElectric, fmt: "eur" },
    { grup: "Gaze", label: "Debit solicitat", get: (p) => p.gaze && p.gaze.q_solicitat, fmt: "mch" },
    { grup: "Gaze", label: "PRM", get: (p) => p.gaze && (p.gaze.prmLabel || p.gaze.prm), fmt: "text" },
    { grup: "Racordare", label: "Verdict risc", get: (p) => p.racordare && p.racordare.verdict, fmt: "text" },
  ];
  const CMP_UNIT = { eur: " €", eur_mp: " €/m²", m3: " m³", mc: " mc", ls: " l/s", kw: " kW", mch: " mc/h", text: "" };

  function renderCompare(a, b) {
    ensureComputed(a); ensureComputed(b);
    const fmtV = (v, f) => v == null ? "—" : (f === "text" ? esc(String(v)) : Number(v).toLocaleString("ro-RO") + CMP_UNIT[f]);
    let lastGrup = "";
    const rows = CMP_SPEC.map((s) => {
      let va, vb;
      try { va = s.get(a); } catch (e) { va = null; }
      try { vb = s.get(b); } catch (e) { vb = null; }
      if (va == null && vb == null) return "";
      let delta = "";
      if (s.fmt !== "text" && typeof va === "number" && typeof vb === "number" && va !== vb) {
        const d = vb - va;
        delta = `<span class="cmp-delta ${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${Math.abs(d).toLocaleString("ro-RO")}${CMP_UNIT[s.fmt]}</span>`;
      } else if (s.fmt === "text" && va !== vb) delta = `<span class="cmp-delta up">≠</span>`;
      const grupCell = s.grup !== lastGrup ? `<td class="cmp-grup">${esc(s.grup)}</td>` : `<td></td>`;
      lastGrup = s.grup;
      return `<tr>${grupCell}<td>${esc(s.label)}</td><td class="num">${fmtV(va, s.fmt)}</td><td class="num">${fmtV(vb, s.fmt)}</td><td class="num">${delta}</td></tr>`;
    }).join("");
    return `<div class="cmp-box">
      <div class="cmp-head"><b>⇄ Comparație scenarii</b>
        <button class="btn btn-ghost btn-sm" id="cmp-close">× Închide</button></div>
      <table class="risc-mat cmp-t"><thead><tr><th></th><th>Indicator</th><th class="num">A: ${esc(a.name)}</th><th class="num">B: ${esc(b.name)}</th><th class="num">Δ (B−A)</th></tr></thead>
        <tbody>${rows}</tbody></table>
      <p class="muted" style="margin:6px 0 0">Diferențele pozitive (roșu) = scenariul B costă/cere mai mult; negative (verde) = mai puțin.</p>
    </div>`;
  }

  const CH = (typeof CHARTS !== "undefined") ? CHARTS : (typeof require !== "undefined" ? null : null);
  function chartBox(title, sub, svg) {
    if (!svg) return "";
    return `<div class="chart-wrap"><p class="chart-title">${esc(title)}</p>${sub ? `<p class="chart-sub">${esc(sub)}</p>` : ""}${svg}</div>`;
  }

  function renderApa(apa) {
    if (!apa) return "";
    const d = apa.debite, rez = apa.rezervor, st = apa.statie;
    const cons = d.consumatori.map((c) => `<tr><td>${esc(c.nume)}</td><td class="num">${c.cantitate} ${esc(c.unit)}</td><td class="num">${c.specific_l ? c.specific_l + " l" : "—"}</td><td class="num">${c.Q} mc/zi</td></tr>`).join("");
    return `<h2>Apă rece — cerințe de racordare</h2>
      <div class="bignum">
        <div class="b"><div class="v">${d.Qmax_orar_ls} l/s</div><div class="l">Debit branșament (Qmax orar)</div></div>
        <div class="b"><div class="v">${esc(d.dn)}</div><div class="l">Diametru branșament</div></div>
        <div class="b"><div class="v">${rez.adoptat} mc</div><div class="l">Rezervor consum</div></div>
      </div>
      <table class="crb-cost"><thead><tr><th>Consumator</th><th class="num">Cantitate</th><th class="num">Consum specific</th><th class="num">Q</th></tr></thead>
        <tbody>${cons}<tr class="grand"><td>Q zilnic mediu</td><td></td><td></td><td class="num">${d.Qzi_med} mc/zi</td></tr></tbody></table>
      ${CH ? chartBox("Consum de apă pe consumatori", "Repartiția debitului zilnic mediu (mc/zi)", CH.chartConsumApa(d.consumatori)) : ""}
      <div class="sys-card"><h4>Debite de calcul <span class="nrm">(${esc(d.normativ)})</span></h4>
        <p class="params">Qzi,med = ${d.Qzi_med} mc/zi · Qmax,zi = ${d.Qmax_zi} mc/zi · Qmax,orar = ${d.Qmax_orar_mc} mc/h (${d.Qmax_orar_ls} l/s)</p>
        <ul>${d.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
      <div class="sys-card"><h4>${esc(rez.sistem)} <span class="nrm">(${esc(rez.normativ)})</span></h4>
        <p class="params">Volum adoptat: ${rez.adoptat} mc · autonomie ${rez.autonomie}h</p>
        <ul>${rez.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
      <div class="sys-card"><h4>${esc(st.sistem)} <span class="nrm">(${esc(st.normativ)})</span></h4>
        <p class="params">H = ${st.H_mCA} mCA (${st.H_bar} bar) · Q stație = ${st.Qstatie} l/s</p>
        <ul>${st.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`;
  }

  const sysCard = (titlu, normativ, params, steps) =>
    `<div class="sys-card"><h4>${esc(titlu)} <span class="nrm">(${esc(normativ || "")})</span></h4>` +
    (params ? `<p class="params">${esc(params)}</p>` : "") +
    `<ul>${(steps || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`;

  function renderCanalizare(c) {
    if (!c) return "";
    let out = `<h2>Canalizare</h2>`;
    out += sysCard(c.menajera.sistem, c.menajera.normativ, `Qu = ${c.menajera.Qu_zi} mc/zi · ${c.menajera.Qu_orar_ls} l/s · racord ${c.menajera.dn}`, c.menajera.steps);
    if (c.pluviala.necesar) out += sysCard(c.pluviala.sistem, c.pluviala.normativ, `Q = ${c.pluviala.Q} l/s · racord ${c.pluviala.dn}`, c.pluviala.steps);
    if (c.separatoare.length) out += `<div class="sys-card"><h4>Separatoare</h4><ul>${c.separatoare.map((s) => `<li>${esc(s.tip)} — ${esc(s.normativ)}</li>`).join("")}</ul></div>`;
    return out;
  }
  function renderElectrice(e) {
    if (!e) return "";
    return `<h2>Instalații electrice</h2>` + sysCard(e.sistem, e.normativ, `Pi = ${e.Pi} kW · Pa = ${e.Pa} kW · S = ${e.S} kVA · trafo ${e.trafo} · GE ${e.ge}`, e.steps);
  }
  function renderGaze(g) {
    if (!g) return "";
    return `<h2>Instalații gaze naturale</h2>` + sysCard(g.sistem, g.normativ, `P = ${g.P_total} kW · q = ${g.q} mc/h · PRM ${g.prmLabel || g.prm} mc/h`, g.steps);
  }
  function renderSisteme(s) {
    if (!s) return "";
    let out = `<h2>Analiza sistemelor de instalații</h2>`;
    out += sysCard(s.termice.sistem, s.termice.normativ, `Încălzire ${s.termice.Pinc} kW · Răcire ${s.termice.Prac} kW`, s.termice.steps);
    out += sysCard(s.ventilatie.sistem, s.ventilatie.normativ, `Aer camere ${s.ventilatie.aerCamere} mc/h · recuperare ≥ ${s.ventilatie.recuperare}%`, s.ventilatie.steps);
    out += sysCard(s.detectie.sistem, s.detectie.normativ, `${s.detectie.loops} bucle · ${s.detectie.obligatoriu ? "obligatoriu" : "recomandat"}`, s.detectie.steps);
    if (s.desfumare.necesar) out += sysCard(s.desfumare.sistem, s.desfumare.normativ, `Parcaj ${s.desfumare.Qparcaj} mc/h · presurizare ${s.desfumare.Qpresurizare} mc/h`, s.desfumare.steps);
    else out += sysCard(s.desfumare.sistem, s.desfumare.normativ, `Presurizare ${s.desfumare.Qpresurizare} mc/h`, s.desfumare.steps);
    return out;
  }

  const capLbl = { "scăzut": "SCĂZUT", "moderat": "MODERAT", "ridicat": "RIDICAT", "critic": "CRITIC" };
  function renderRacordare(rac) {
    if (!rac) return "";
    const rows = rac.utilitati.map((u) => {
      const links = (u.linkuri || []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener" class="op-link">${esc(l.nume)} ↗</a>`).join(" · ");
      return `<tr><td><b>${esc(u.utilitate)}</b><br/><span class="muted">${esc(u.document)}</span>${links ? `<br/>${links}` : ""}</td>
        <td>${esc(u.solicitare)}</td><td>${esc(u.cost)}</td>
        <td class="lvl lvl-${esc(u.nivel)}">${capLbl[u.nivel] || esc(u.nivel)}</td>
        <td>${esc(u.termen)}</td></tr>`;
    }).join("");
    return `<h2>Racordare la utilități — solicitări către operatori</h2>
      <div class="bignum">
        <div class="b"><div class="v">${capLbl[rac.verdict] || esc(rac.verdict)}</div><div class="l">Verdict racordare (risc max.)</div></div>
        <div class="b"><div class="v">${eur(rac.garantieElectric)}</div><div class="l">Garanție racordare electrică</div></div>
      </div>
      <table class="risc-mat"><thead><tr><th>Utilitate</th><th>De solicitat operatorului</th><th>Cost</th><th>Risc</th><th>Termen</th></tr></thead>
        <tbody>${rows}</tbody></table>
      <p class="muted" style="margin:6px 0">${esc(rac.nota || "")}</p>`;
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

    const costRows = crb.cost.grupuri.map((g) => {
      const ls = crb.cost.lines.filter((l) => l.specialitate === g.specialitate);
      return `<tr class="grp"><td>${esc(g.specialitate)}</td><td></td><td></td><td class="num">${eur(g.total)} · ${g.pct}%</td></tr>` +
        ls.map((l) => `<tr><td style="padding-left:16px">${esc(l.eticheta)}</td><td class="num">${l.qty} ${esc(l.unit)}</td><td class="num">${eur(l.pretUnit)}</td><td class="num">${eur(l.total)}</td></tr>`).join("");
    }).join("");
    const cost = `<table class="crb-cost"><thead><tr><th>Specialitate / element</th><th class="num">Cant.</th><th class="num">Preț unitar</th><th class="num">Total</th></tr></thead>
      <tbody>${costRows}<tr class="grand"><td>TOTAL CAPEX</td><td></td><td></td><td class="num">${eur(crb.cost.total)}</td></tr></tbody></table>`;

    const sint = crb.sinteza;
    const sinteza = `<div class="bignum">
      <div class="b"><div class="v">${eur(crb.cost.total)}</div><div class="l">CAPEX total</div></div>
      <div class="b"><div class="v">${eur(crb.cost.perMp)}/m²</div><div class="l">Cost specific</div></div>
      ${sint.perUnitate ? `<div class="b"><div class="v">${eur(sint.perUnitate)}</div><div class="l">Cost / ${esc(sint.unitateLabel)}</div></div>` : ""}
      <div class="b"><div class="v">${eur(crb.cost.opexAnual)}/an</div><div class="l">OPEX (mentenanță)</div></div>
      ${sint.specialitatePrincipala ? `<div class="b"><div class="v">${sint.specialitatePrincipala.pct}%</div><div class="l">${esc(sint.specialitatePrincipala.specialitate)}</div></div>` : ""}
    </div>`;

    const riscTbl = `<table class="risc-mat"><thead><tr><th>Categorie</th><th>Risc</th><th>Prob.</th><th>Impact</th><th>Nivel</th><th>Măsură</th></tr></thead><tbody>${
      crb.risc.map((x) => `<tr><td>${esc(x.categorie)}</td><td>${esc(x.descriere)}</td><td>${esc(x.probabilitate)}</td><td>${esc(x.impact)}</td><td class="lvl lvl-${esc(x.nivel)}">${esc(x.nivel)}</td><td>${esc(x.masura)}</td></tr>`).join("")
    }</tbody></table>`;

    const benef = `<ul class="crb-list">${crb.beneficiu.map((b) => `<li>${esc(b.text)}${b.cuantificare ? ` <span class="muted">— ${esc(b.cuantificare)}</span>` : ""}</li>`).join("")}</ul>`;

    const aiBlock = p.aiText ? `<div class="ai-note"><b>✨ Narativ AI (în memoriul PDF):</b>
      <p>${esc(p.aiText.descriere || "")}</p>
      <p>${esc(p.aiText.solutii || "")}</p>
      <p>${esc(p.aiText.concluzii || "")}</p></div>` : "";

    return `${big}
      ${renderAiReview(p.aiReview)}
      ${aiBlock}
      ${renderRacordare(p.racordare)}
      ${renderApa(p.apa)}
      ${renderCanalizare(p.canalizare)}
      ${renderElectrice(p.electrice)}
      ${renderGaze(p.gaze)}
      ${renderSisteme(p.sisteme)}
      <h2>Stingere incendiu — încadrare în obligativitate</h2>${oblig}
      <h2>Sisteme dimensionate (breviar de calcul)</h2>${sisteme}
      <h2>Rezervor de incendiu</h2>
      <div class="sys-card"><p class="params">Adoptat: ${dim.rezervor.adoptat} m³ (subtotal ${dim.rezervor.subtotal} m³ + marjă ${dim.rezervor.marja * 100}%)</p>
        <ul>${dim.rezervor.steps.map((st) => `<li>${esc(st)}</li>`).join("")}</ul></div>
      <h2>Grup de pompare</h2>
      <div class="sys-card"><ul>${dim.pompare.steps.map((st) => `<li>${esc(st)}</li>`).join("")}</ul></div>
      ${CH ? chartBox("Curbă caracteristică grup de pompare (H–Q)", "Punctul de funcționare al fiecărei pompe pe curba caracteristică estimată", CH.chartPompa(dim.pompare)) : ""}
      <h2>Cost · Risc · Beneficiu (toate specialitățile)</h2>
      ${sinteza}
      <h3 style="margin:8px 0">Cost (CAPEX orientativ, pe specialități)</h3>
      ${CH ? chartBox("Repartiția CAPEX pe specialități", `Total ${eur(crb.cost.total)} · ${eur(crb.cost.perMp)}/m²`, CH.chartCapex(crb.cost.grupuri)) : ""}
      ${cost}
      <p class="muted" style="margin:6px 0">OPEX estimat ≈ ${eur(crb.cost.opexAnual)}/an (mentenanță). Prețurile sunt orientative — se ajustează la faza de ofertare.</p>
      <h3 style="margin:14px 0 4px">Matrice de risc (probabilitate × impact)</h3>
      ${CH && typeof CRB !== "undefined" ? chartBox("Matrice de risc", "Numărul de riscuri identificate în fiecare celulă probabilitate × impact", CH.chartRiscMatrix(crb.risc, CRB.nivelRisc)) : ""}
      ${riscTbl}
      <h3 style="margin:14px 0 4px">Beneficii</h3>${benef}`;
  }

  /* ---------- AI: propune ipoteze (în formular) ---------- */
  async function aiPropuneIpoteze() {
    if (typeof AI === "undefined") return;
    if (!AI.configured()) { toast("Setează proxy-ul sau cheia AI în „Firma mea”."); return; }
    const btn = $("#btn-ai-ipoteze"); const old = btn.textContent; btn.disabled = true; btn.textContent = "Se gândește…";
    try {
      const known = readProjectForm();
      const raw = {};
      AI.CANDIDATE_FIELDS.forEach((c) => { if (pform.elements[c.camp]) raw[c.camp] = pform.elements[c.camp].value; });
      const candidates = AI.CANDIDATE_FIELDS.filter((c) => { const v = raw[c.camp]; return v == null || v === "" || v === "0"; });
      if (!candidates.length) { toast("Toate câmpurile relevante sunt completate."); return; }
      const ipoteze = await AI.proposeIpoteze(known, candidates);
      const { merged, applied } = AI.mergeIpoteze(raw, ipoteze, false);
      applied.forEach((ip) => { if (pform.elements[ip.camp]) pform.elements[ip.camp].value = merged[ip.camp]; });
      onFunctiuneChange(); toggleOffice();
      const note = $("#ai-ipoteze-note");
      if (applied.length) {
        note.hidden = false;
        note.innerHTML = `<b>✨ Ipoteze propuse (de confirmat):</b><ul>` +
          applied.map((ip) => `<li><b>${esc(ip.eticheta || ip.camp)}:</b> ${esc(ip.valoare)} <span class="muted">— ${esc(ip.motivare || "")}${ip.incredere ? " · încredere " + esc(ip.incredere) : ""}</span></li>`).join("") + `</ul>`;
        toast(`${applied.length} ipoteze propuse — verifică-le înainte de calcul.`);
      } else { note.hidden = true; toast("AI nu a propus ipoteze noi."); }
    } catch (e) { toast("Eroare AI: " + (e && e.message || e)); }
    finally { btn.disabled = false; btn.textContent = old; }
  }

  /* ---------- AI: redactează narativul memoriului ---------- */
  async function aiNarativ() {
    if (typeof AI === "undefined") return;
    if (!AI.configured()) { toast("Setează proxy-ul sau cheia AI în „Firma mea”."); return; }
    const p = state.projects.find((x) => x.id === currentId); if (!p) return;
    ensureComputed(p);
    const btn = $("#btn-ai-narativ"); const old = btn.textContent; btn.disabled = true; btn.textContent = "Se redactează…";
    try {
      p.aiText = await AI.redacteaza(AI.computedSummary(p));
      save();
      $("#res-body").innerHTML = renderResults(p);
      toast("Narativ AI adăugat — apare în memoriul PDF.");
    } catch (e) { toast("Eroare AI: " + (e && e.message || e)); }
    finally { btn.disabled = false; btn.textContent = old; }
  }

  /* ---------- AI: verificare proiect (scor de completitudine + probleme) ---------- */
  async function aiVerifica() {
    if (typeof AI === "undefined") return;
    if (!AI.configured()) { toast("Setează proxy-ul sau cheia AI în „Firma mea”."); return; }
    const p = state.projects.find((x) => x.id === currentId); if (!p) return;
    ensureComputed(p);
    const btn = $("#btn-ai-verifica"); const old = btn.textContent; btn.disabled = true; btn.textContent = "Se verifică…";
    try {
      const date = {};
      ["name", "functiune", "unitate", "secundar", "nrNiveluriSupraterane", "acNivel", "inaltimeUltimPlanseu",
        "arieDesfasurata", "arieAcoperis", "i_ploaie", "nivelStabilitate", "parcLocuri", "nrNiveluriParcare",
        "parcArie", "volumCompartiment", "saliAglomerate", "risc", "officeAre", "officeArie", "officePersoane",
        "d_mese", "d_personal", "d_bucatarie", "d_piscina", "d_spa", "d_spalatorie", "d_irigatii"]
        .forEach((k) => { date[k] = p[k]; });
      p.aiReview = await AI.revizuieste({ date_introduse: date, rezultate: AI.computedSummary(p) });
      save();
      $("#res-body").innerHTML = renderResults(p);
      toast(`Verificare AI: scor ${p.aiReview.scor}/100`);
    } catch (e) { toast("Eroare AI: " + (e && e.message || e)); }
    finally { btn.disabled = false; btn.textContent = old; }
  }

  function renderAiReview(r) {
    if (!r) return "";
    const cls = r.scor >= 80 ? "ok" : r.scor >= 60 ? "warn" : "bad";
    const sevLbl = { mare: "MARE", medie: "MEDIE", mica: "MICĂ" };
    const tipLbl = { lipsa: "lipsă", atipic: "atipic", inconsistenta: "inconsistență", recomandare: "recomandare" };
    const rows = (r.probleme || []).map((x) =>
      `<tr><td>${esc(x.zona)}</td><td>${esc(tipLbl[x.tip] || x.tip)}</td><td>${esc(x.descriere)}<br/><span class="muted">→ ${esc(x.sugestie)}</span></td><td class="rev-sev rev-${esc(x.severitate)}">${sevLbl[x.severitate] || esc(x.severitate)}</td></tr>`).join("");
    return `<div class="ai-review">
      <div class="rev-head"><span class="rev-scor rev-scor-${cls}">${r.scor}<small>/100</small></span>
        <div><b>🔍 Verificare AI — pregătirea proiectului</b><br/><span class="muted">${esc(r.verdict || "")}</span></div></div>
      ${rows ? `<table class="risc-mat"><thead><tr><th>Zonă</th><th>Tip</th><th>Problemă / sugestie</th><th>Sev.</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="muted">Nicio problemă semnalată.</p>`}
    </div>`;
  }

  function printMemoriu(p) {
    ensureComputed(p);
    $("#print-view").innerHTML = MEMORIU.buildMemoriu({ company: state.company, project: p, dim: p.dim, crb: p.crb, apa: p.apa, canalizare: p.canalizare, electrice: p.electrice, gaze: p.gaze, sisteme: p.sisteme, aiText: p.aiText });
    const t = document.title; document.title = `Memoriu - ${p.name}`;
    window.print(); setTimeout(() => (document.title = t), 500);
  }

  function printFezabilitate(p) {
    ensureComputed(p);
    if (typeof FEZABILITATE === "undefined") return;
    $("#print-view").innerHTML = FEZABILITATE.buildFezabilitate({ company: state.company, project: p, dim: p.dim, crb: p.crb, racordare: p.racordare });
    const t = document.title; document.title = `Fezabilitate - ${p.name}`;
    window.print(); setTimeout(() => (document.title = t), 500);
  }

  function exportDeviz(p) {
    ensureComputed(p);
    if (typeof EXPORTCSV === "undefined") return;
    const csv = "﻿" + EXPORTCSV.buildExportCSV(p); // BOM UTF-8 pentru diacritice în Excel
    const b = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "deviz-" + (p.name || "proiect").replace(/[^\w\-]+/g, "_") + ".csv";
    a.click(); URL.revokeObjectURL(a.href); toast("Deviz exportat (CSV pentru Excel)");
  }

  /* events */
  $("#btn-new").addEventListener("click", () => openProjectForm(null));
  $("#btn-back").addEventListener("click", () => { showList(); renderList(); });
  $("#btn-edit").addEventListener("click", () => { const p = state.projects.find((x) => x.id === currentId); if (p) openProjectForm(p); });
  $("#btn-pdf").addEventListener("click", () => { const p = state.projects.find((x) => x.id === currentId); if (p) printMemoriu(p); });
  $("#btn-ai-ipoteze").addEventListener("click", aiPropuneIpoteze);
  $("#btn-ai-narativ").addEventListener("click", aiNarativ);
  $("#btn-ai-verifica").addEventListener("click", aiVerifica);
  $("#cmp-select").addEventListener("change", () => {
    const area = $("#cmp-area");
    const otherId = $("#cmp-select").value;
    if (!otherId) { area.hidden = true; area.innerHTML = ""; return; }
    const a = state.projects.find((x) => x.id === currentId);
    const b = state.projects.find((x) => x.id === otherId);
    if (!a || !b) return;
    area.innerHTML = renderCompare(a, b);
    area.hidden = false;
    $("#cmp-close").addEventListener("click", () => { area.hidden = true; area.innerHTML = ""; $("#cmp-select").value = ""; });
  });
  $("#btn-fezabilitate").addEventListener("click", () => { const p = state.projects.find((x) => x.id === currentId); if (p) printFezabilitate(p); });
  $("#btn-export-deviz").addEventListener("click", () => { const p = state.projects.find((x) => x.id === currentId); if (p) exportDeviz(p); });
  $("#proj-list").addEventListener("click", (e) => {
    const t = e.target.dataset;
    if (t.open) openResults(t.open);
    else if (t.pdf) printMemoriu(state.projects.find((x) => x.id === t.pdf));
    else if (t.dup) {
      const src = state.projects.find((x) => x.id === t.dup); if (!src) return;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = uid(); copy.name = src.name + " — scenariu B"; delete copy.aiReview; delete copy.aiText;
      state.projects.push(computeProject(copy)); save(); renderList();
      toast("Scenariu duplicat — editează-l, apoi compară-le");
      openProjectForm(copy);
    }
    else if (t.del && confirm("Ștergi acest proiect?")) { state.projects = state.projects.filter((x) => x.id !== t.del); save(); renderList(); }
  });
  document.addEventListener("click", (e) => { if (e.target.dataset.action === "new") openProjectForm(null); });


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
  function renderAll() { fillCompany(); fillAI(); fillPreturi(); renderList(); showList(); }
  renderAll();

  /* Exemplu de calibrare (Hotel Sinaia) — se încarcă DOAR cu linkul special ?exemplu=sinaia.
     Nu apare în aplicație pentru vizitatorii obișnuiți. */
  function seedExemplu() {
    let param = "";
    try { param = new URLSearchParams(location.search).get("exemplu") || ""; } catch (e) { return; }
    if (param.toLowerCase() !== "sinaia") return;
    let p = state.projects.find((x) => /sinaia/i.test(x.name || ""));
    if (!p) {
      p = Object.assign(blankProject(), {
        id: uid(), name: "Hotel **** Sinaia (exemplu)", beneficiar: "Exemplu de calibrare",
        adresa: "Sinaia, jud. Prahova", functiune: "hotel", data: "Iunie 2026",
        unitate: 90, secundar: 180, nrNiveluriSupraterane: 4, acNivel: 1525, inaltimeUltimPlanseu: 17,
        arieDesfasurata: 11300, arieAcoperis: 7500, i_ploaie: 130,
        nivelStabilitate: "II", parcLocuri: 120, nrNiveluriParcare: 2, parcArie: 5000,
        volumCompartiment: 35000, saliAglomerate: true, risc: "mediu", officeAre: false,
        d_mese: 200, d_personal: 60, d_bucatarie: 5, d_piscina: 6, d_spa: 3, d_spalatorie: 8, d_irigatii: 5,
      });
      state.projects.push(computeProject(p));
      save(); renderList();
      toast("Exemplu Hotel Sinaia încărcat");
    }
    openResults(p.id);
  }
  seedExemplu();
})();
