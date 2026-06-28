/* ===== DevizRapid — logică aplicație (vanilla JS, fără dependențe) ===== */
(function () {
  "use strict";

  const KEY = "devizrapid_v1";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- state ---------- */
  const defaultState = () => ({
    company: { name: "", cui: "", regCom: "", phone: "", email: "", website: "", address: "", iban: "", bank: "", logo: "", currency: "RON", tvaRate: "21", offerPrefix: "OF" },
    catalog: [],
    offers: [],
    seq: 1,
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      console.warn("load failed", e);
      return defaultState();
    }
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  const uid = () => Date.now().toString(36) + Math.floor(performance.now() % 1000).toString(36) + (state.seq++).toString(36);

  /* ---------- helpers ---------- */
  const sym = () => (state.company.currency === "EUR" ? "€" : "lei");
  function fmt(n) {
    n = Number(n) || 0;
    return n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  const money = (n) => fmt(n) + " " + sym();
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 2200);
  }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const todayISO = () => new Date().toISOString().slice(0, 10);
  function addDays(iso, days) {
    const d = iso ? new Date(iso) : new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("ro-RO") : "—");

  /* ---------- tabs ---------- */
  $$(".tab").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".tab").forEach((x) => x.classList.toggle("is-active", x === b));
      $$(".panel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === b.dataset.tab));
    })
  );

  /* ====================================================================
     COMPANY
  ==================================================================== */
  const companyForm = $("#company-form");
  function fillCompany() {
    const c = state.company;
    for (const k in c) {
      const el = companyForm.elements[k];
      if (el && k !== "logo") el.value = c[k] || "";
    }
    const img = $("#logo-preview");
    if (c.logo) { img.src = c.logo; img.hidden = false; } else { img.hidden = true; }
  }
  companyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(companyForm);
    for (const [k, v] of fd.entries()) state.company[k] = v;
    save();
    const hint = $("#company-saved");
    hint.hidden = false; setTimeout(() => (hint.hidden = true), 1800);
    toast("Datele firmei au fost salvate");
  });
  $("#logo-input").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) { toast("Logo prea mare (max ~1.5MB)"); return; }
    const r = new FileReader();
    r.onload = () => {
      state.company.logo = r.result;
      const img = $("#logo-preview"); img.src = r.result; img.hidden = false;
      save();
    };
    r.readAsDataURL(f);
  });
  $("#logo-clear").addEventListener("click", () => {
    state.company.logo = ""; $("#logo-preview").hidden = true; $("#logo-input").value = ""; save();
  });

  /* ====================================================================
     CATALOG
  ==================================================================== */
  const itemModal = $("#item-modal");
  const itemForm = $("#item-form");

  function renderCatalog() {
    const body = $("#catalog-body");
    const empty = $("#catalog-empty");
    const wrap = $("#catalog-table").closest(".table-wrap");
    body.innerHTML = "";
    if (!state.catalog.length) {
      wrap.style.display = "none"; empty.classList.add("show");
    } else {
      wrap.style.display = ""; empty.classList.remove("show");
      const sorted = [...state.catalog].sort((a, b) => (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name));
      for (const it of sorted) {
        const tr = document.createElement("tr");
        tr.innerHTML =
          `<td>${esc(it.name)}</td><td>${esc(it.category || "—")}</td>` +
          `<td class="num">${esc(it.unit || "—")}</td><td class="num">${money(it.price)}</td>` +
          `<td class="num"><button class="btn-danger" data-edit="${it.id}">Edit</button>` +
          `<button class="btn-danger" data-del="${it.id}">Șterge</button></td>`;
        body.appendChild(tr);
      }
    }
    refreshCatalogDatalists();
  }
  function refreshCatalogDatalists() {
    const dl = $("#catalog-list");
    dl.innerHTML = state.catalog.map((i) => `<option value="${esc(i.name)}">`).join("");
  }
  function openItem(item) {
    $("#item-modal-title").textContent = item ? "Editează articol" : "Articol nou";
    itemForm.reset();
    itemForm.elements.id.value = item ? item.id : "";
    if (item) {
      itemForm.elements.name.value = item.name;
      itemForm.elements.category.value = item.category || "";
      itemForm.elements.unit.value = item.unit || "";
      itemForm.elements.price.value = item.price;
    }
    itemModal.showModal();
  }
  itemForm.addEventListener("submit", (e) => {
    if (e.submitter && e.submitter.value === "cancel") return;
    if (!itemForm.elements.name.value.trim() || itemForm.elements.price.value === "") { e.preventDefault(); return; }
    const id = itemForm.elements.id.value;
    const data = {
      name: itemForm.elements.name.value.trim(),
      category: itemForm.elements.category.value.trim(),
      unit: itemForm.elements.unit.value.trim(),
      price: parseFloat(itemForm.elements.price.value) || 0,
    };
    if (id) {
      const it = state.catalog.find((x) => x.id === id);
      if (it) Object.assign(it, data);
    } else {
      state.catalog.push(Object.assign({ id: uid() }, data));
    }
    save(); renderCatalog(); toast("Articol salvat");
  });
  $("#catalog-body").addEventListener("click", (e) => {
    const ed = e.target.dataset.edit, del = e.target.dataset.del;
    if (ed) openItem(state.catalog.find((x) => x.id === ed));
    if (del) {
      if (confirm("Ștergi acest articol din catalog?")) {
        state.catalog = state.catalog.filter((x) => x.id !== del);
        save(); renderCatalog();
      }
    }
  });
  $("#btn-new-item").addEventListener("click", () => openItem(null));

  // seed examples
  const SEED = [
    { category: "Manoperă", unit: "oră", name: "Manoperă electrician autorizat", price: 80 },
    { category: "Manoperă", unit: "punct", name: "Montaj priză / întrerupător", price: 45 },
    { category: "Manoperă", unit: "corp", name: "Montaj corp iluminat", price: 60 },
    { category: "Materiale", unit: "ml", name: "Cablu CYY-F 3x2.5 mmp", price: 6.5 },
    { category: "Materiale", unit: "ml", name: "Cablu CYY-F 3x1.5 mmp", price: 4.2 },
    { category: "Materiale", unit: "buc", name: "Tablou electric 12 module", price: 120 },
    { category: "Materiale", unit: "buc", name: "Disjunctor 16A curba C", price: 28 },
    { category: "Materiale", unit: "buc", name: "Întrerupător diferențial 40A/30mA", price: 95 },
    { category: "Echipamente", unit: "buc", name: "Detector fum optic adresabil", price: 145 },
    { category: "Servicii", unit: "proiect", name: "Proiect instalație electrică (avizare)", price: 1500 },
    { category: "Servicii", unit: "buc", name: "Verificare PRAM + buletin", price: 350 },
    { category: "Transport", unit: "buc", name: "Deplasare echipă", price: 100 },
  ];
  $("#btn-seed-catalog").addEventListener("click", () => {
    SEED.forEach((s) => state.catalog.push(Object.assign({ id: uid() }, s)));
    save(); renderCatalog(); toast("Exemple adăugate — editează-le cu prețurile tale");
  });

  /* ====================================================================
     OFFERS
  ==================================================================== */
  const offerModal = $("#offer-modal");
  const offerForm = $("#offer-form");
  let lines = []; // working lines for the open offer

  function nextNumber() {
    const prefix = state.company.offerPrefix || "OF";
    const nums = state.offers
      .map((o) => { const m = String(o.number || "").match(/(\d+)\s*$/); return m ? parseInt(m[1], 10) : 0; });
    const max = nums.length ? Math.max(...nums) : 0;
    return `${prefix}-${String(max + 1).padStart(4, "0")}`;
  }

  function renderOffers() {
    const list = $("#offers-list");
    const empty = $("#offers-empty");
    list.innerHTML = "";
    if (!state.offers.length) { empty.classList.add("show"); return; }
    empty.classList.remove("show");
    const sorted = [...state.offers].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    for (const o of sorted) {
      const tot = computeTotals(o);
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        `<div class="card-top"><span class="card-num">${esc(o.number)}</span>` +
        `<span class="card-meta">${fmtDate(o.date)}</span></div>` +
        `<div class="card-client">${esc(o.client?.name || "—")}</div>` +
        `<div class="card-meta">${o.items.length} articole · valabilă până ${fmtDate(o.validUntil)}</div>` +
        `<div class="card-total">${money(tot.total)}</div>` +
        `<div class="card-actions">` +
        `<button class="btn btn-ghost btn-sm" data-open="${o.id}">Deschide</button>` +
        `<button class="btn btn-ghost btn-sm" data-pdf="${o.id}">PDF</button>` +
        `<button class="btn btn-ghost btn-sm" data-dup="${o.id}">Dublează</button>` +
        `<button class="btn-danger" data-del="${o.id}">Șterge</button></div>`;
      list.appendChild(card);
    }
  }

  function computeTotals(o) {
    const subtotal = (o.items || []).reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
    const discount = subtotal * ((Number(o.discount) || 0) / 100);
    const base = subtotal - discount;
    const tva = base * ((Number(o.tvaRate) || 0) / 100);
    return { subtotal, discount, base, tva, total: base + tva };
  }

  function blankOffer() {
    return {
      id: "", number: nextNumber(), date: todayISO(), validUntil: addDays(todayISO(), 15),
      client: { name: "", cui: "", address: "", contact: "" },
      items: [], notes: "", discount: 0, tvaRate: state.company.tvaRate || "21",
    };
  }

  function openOffer(o) {
    o = o || blankOffer();
    $("#offer-modal-title").textContent = o.id ? `Ofertă ${o.number}` : "Ofertă nouă";
    offerForm.elements.id.value = o.id;
    offerForm.elements.number.value = o.number;
    offerForm.elements.date.value = o.date;
    offerForm.elements.validUntil.value = o.validUntil;
    offerForm.elements.clientName.value = o.client?.name || "";
    offerForm.elements.clientCui.value = o.client?.cui || "";
    offerForm.elements.clientAddress.value = o.client?.address || "";
    offerForm.elements.clientContact.value = o.client?.contact || "";
    offerForm.elements.notes.value = o.notes || "";
    $("#discount-input").value = o.discount || 0;
    $("#tva-select").value = o.tvaRate || "21";
    lines = (o.items || []).map((l) => Object.assign({}, l));
    renderLines();
    offerModal.showModal();
  }

  function renderLines() {
    const body = $("#lines-body");
    const empty = $("#lines-empty");
    body.innerHTML = "";
    empty.style.display = lines.length ? "none" : "block";
    lines.forEach((l, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td class="cell-w-name"><input data-i="${i}" data-f="name" value="${esc(l.name)}" /></td>` +
        `<td class="num cell-w-sm"><input data-i="${i}" data-f="unit" value="${esc(l.unit || "")}" /></td>` +
        `<td class="num cell-w-sm"><input data-i="${i}" data-f="qty" type="number" step="0.01" min="0" value="${l.qty}" /></td>` +
        `<td class="num cell-w-md"><input data-i="${i}" data-f="price" type="number" step="0.01" min="0" value="${l.price}" /></td>` +
        `<td class="num line-total">${money((Number(l.qty) || 0) * (Number(l.price) || 0))}</td>` +
        `<td class="num"><button type="button" class="btn-danger" data-rm="${i}">✕</button></td>`;
      body.appendChild(tr);
    });
    recalc();
  }

  $("#lines-body").addEventListener("input", (e) => {
    const i = e.target.dataset.i, f = e.target.dataset.f;
    if (i == null) return;
    let v = e.target.value;
    if (f === "qty" || f === "price") v = parseFloat(v) || 0;
    lines[i][f] = v;
    // update just this row's total + grand totals (avoid full re-render to keep focus)
    const tot = (Number(lines[i].qty) || 0) * (Number(lines[i].price) || 0);
    const cell = e.target.closest("tr").querySelector(".line-total");
    if (cell) cell.textContent = money(tot);
    recalc();
  });
  $("#lines-body").addEventListener("click", (e) => {
    const rm = e.target.dataset.rm;
    if (rm != null) { lines.splice(Number(rm), 1); renderLines(); }
  });

  function addLine(name) {
    name = (name || "").trim();
    const fromCat = state.catalog.find((c) => c.name.toLowerCase() === name.toLowerCase());
    lines.push({
      name: fromCat ? fromCat.name : name || "Articol nou",
      unit: fromCat ? fromCat.unit : "",
      qty: 1,
      price: fromCat ? fromCat.price : 0,
    });
    renderLines();
  }
  $("#btn-add-line").addEventListener("click", () => {
    const inp = $("#line-search");
    addLine(inp.value);
    inp.value = ""; inp.focus();
  });
  $("#line-search").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); $("#btn-add-line").click(); }
  });

  function recalc() {
    const draft = readOfferForm();
    const t = computeTotals(draft);
    $("#t-subtotal").textContent = money(t.subtotal);
    $("#t-discount").textContent = "− " + money(t.discount);
    $("#t-tva").textContent = money(t.tva);
    $("#t-total").textContent = money(t.total);
  }
  $("#discount-input").addEventListener("input", recalc);
  $("#tva-select").addEventListener("change", recalc);

  function readOfferForm() {
    return {
      id: offerForm.elements.id.value,
      number: offerForm.elements.number.value.trim() || nextNumber(),
      date: offerForm.elements.date.value || todayISO(),
      validUntil: offerForm.elements.validUntil.value,
      client: {
        name: offerForm.elements.clientName.value.trim(),
        cui: offerForm.elements.clientCui.value.trim(),
        address: offerForm.elements.clientAddress.value.trim(),
        contact: offerForm.elements.clientContact.value.trim(),
      },
      items: lines.filter((l) => l.name && l.name.trim()),
      notes: offerForm.elements.notes.value.trim(),
      discount: parseFloat($("#discount-input").value) || 0,
      tvaRate: $("#tva-select").value,
    };
  }

  function persistOffer() {
    const draft = readOfferForm();
    if (!draft.client.name) { toast("Completează numele clientului"); offerForm.elements.clientName.focus(); return null; }
    if (!draft.items.length) { toast("Adaugă cel puțin un articol"); return null; }
    if (draft.id) {
      const idx = state.offers.findIndex((o) => o.id === draft.id);
      if (idx >= 0) state.offers[idx] = draft;
    } else {
      draft.id = uid();
      state.offers.push(draft);
    }
    offerForm.elements.id.value = draft.id;
    save(); renderOffers();
    return draft;
  }

  $("#btn-save-offer").addEventListener("click", () => {
    const d = persistOffer();
    if (d) { toast("Ofertă salvată"); offerModal.close(); }
  });
  $("#btn-save-pdf").addEventListener("click", () => {
    const d = persistOffer();
    if (d) { offerModal.close(); printOffer(d); }
  });

  $("#offers-list").addEventListener("click", (e) => {
    const t = e.target.dataset;
    if (t.open) openOffer(state.offers.find((o) => o.id === t.open));
    else if (t.pdf) printOffer(state.offers.find((o) => o.id === t.pdf));
    else if (t.dup) {
      const src = state.offers.find((o) => o.id === t.dup);
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = ""; copy.number = nextNumber(); copy.date = todayISO(); copy.validUntil = addDays(todayISO(), 15);
      openOffer(copy);
    } else if (t.del) {
      if (confirm("Ștergi această ofertă?")) {
        state.offers = state.offers.filter((o) => o.id !== t.del);
        save(); renderOffers();
      }
    }
  });

  $("#btn-new-offer").addEventListener("click", () => openOffer(null));

  /* ====================================================================
     PRINT / PDF
  ==================================================================== */
  function printOffer(o) {
    if (!o) return;
    const c = state.company;
    const t = computeTotals(o);
    const rows = o.items.map((l, i) =>
      `<tr><td>${i + 1}. ${esc(l.name)}</td><td class="num">${esc(l.unit || "")}</td>` +
      `<td class="num">${fmt(l.qty)}</td><td class="num">${money(l.price)}</td>` +
      `<td class="num">${money((Number(l.qty) || 0) * (Number(l.price) || 0))}</td></tr>`
    ).join("");

    const firmContact = [c.phone && "Tel: " + c.phone, c.email, c.website].filter(Boolean).join(" · ");
    const firmLegal = [c.cui && "CUI: " + c.cui, c.regCom].filter(Boolean).join(" · ");

    $("#print-view").innerHTML =
      `<div class="doc">
        <div class="doc-head">
          <div class="doc-firm">
            ${c.logo ? `<img class="doc-logo" src="${c.logo}" alt="" />` : `<h2>${esc(c.name || "Firma mea")}</h2>`}
            ${c.logo ? `<h2>${esc(c.name || "")}</h2>` : ""}
            ${c.address ? `<p>${esc(c.address)}</p>` : ""}
            ${firmLegal ? `<p>${esc(firmLegal)}</p>` : ""}
            ${firmContact ? `<p>${esc(firmContact)}</p>` : ""}
          </div>
          <div class="doc-title">
            <h1>OFERTĂ</h1>
            <p><b>${esc(o.number)}</b></p>
            <p>Data: ${fmtDate(o.date)}</p>
            ${o.validUntil ? `<p>Valabilă până: ${fmtDate(o.validUntil)}</p>` : ""}
          </div>
        </div>

        <div class="doc-parties">
          <div class="box">
            <h4>Către (client)</h4>
            <p><b>${esc(o.client.name)}</b></p>
            ${o.client.cui ? `<p>${esc(o.client.cui)}</p>` : ""}
            ${o.client.address ? `<p>${esc(o.client.address)}</p>` : ""}
            ${o.client.contact ? `<p>${esc(o.client.contact)}</p>` : ""}
          </div>
        </div>

        <table>
          <thead><tr><th>Denumire</th><th class="num">U.M.</th><th class="num">Cant.</th><th class="num">Preț unitar</th><th class="num">Valoare</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="doc-totals">
          <table>
            <tr><td>Subtotal</td><td class="num">${money(t.subtotal)}</td></tr>
            ${t.discount ? `<tr><td>Discount (${fmt(o.discount)}%)</td><td class="num">− ${money(t.discount)}</td></tr>` : ""}
            <tr><td>TVA (${fmt(o.tvaRate)}%)</td><td class="num">${money(t.tva)}</td></tr>
            <tr class="grand"><td>TOTAL</td><td class="num">${money(t.total)}</td></tr>
          </table>
        </div>

        ${o.notes ? `<div class="doc-notes"><h4>Observații</h4><p>${esc(o.notes).replace(/\n/g, "<br/>")}</p></div>` : ""}

        <div class="doc-sign">
          <div class="sig">Ofertant<br/>${esc(c.name || "")}</div>
          <div class="sig">Beneficiar</div>
        </div>

        <div class="doc-foot">
          <span>${esc(c.name || "")}${c.iban ? " · IBAN: " + esc(c.iban) : ""}${c.bank ? " · " + esc(c.bank) : ""}</span>
          <span>Generat cu DevizRapid</span>
        </div>
      </div>`;

    document.title = `${o.number} - ${o.client.name || "oferta"}`;
    window.print();
    setTimeout(() => (document.title = "DevizRapid"), 500);
  }

  /* ====================================================================
     EXPORT / IMPORT
  ==================================================================== */
  $("#btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devizrapid-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Copie de siguranță descărcată");
  });
  $("#btn-import").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || typeof data !== "object") throw new Error("format");
        if (!confirm("Importul înlocuiește datele actuale din acest browser. Continui?")) return;
        state = Object.assign(defaultState(), data);
        save(); renderAll();
        toast("Date importate");
      } catch (err) {
        toast("Fișier invalid");
      }
      e.target.value = "";
    };
    r.readAsText(f);
  });

  /* ---------- global empty-state buttons ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.dataset.action;
    if (a === "new-offer") openOffer(null);
    if (a === "new-item") openItem(null);
  });

  /* ---------- init ---------- */
  function renderAll() {
    fillCompany();
    renderCatalog();
    renderOffers();
  }
  renderAll();
})();
