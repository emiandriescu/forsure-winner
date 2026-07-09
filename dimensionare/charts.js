/* ===== SOWILO Dimensionare — GRAFICE (SVG inline, zero dependențe) =====
   Reprezentări grafice ale rezultatelor deterministe: repartiția CAPEX pe
   specialități, consumul de apă pe consumatori, matricea de risc și curba
   caracteristică a grupului de pompare (H–Q).
   Funcții pure: primesc datele deja calculate și întorc un string SVG.
   Se pot refolosi 1:1 în calculatoarele publice (marketing) și în memoriu.
*/
(function (root) {
  "use strict";

  // Paletă categorială — distinctă pe fundal închis, ordine stabilă pe specialități
  const PALETA = ["#38bdf8", "#a78bfa", "#4ade80", "#fbbf24", "#f472b6", "#2dd4bf", "#fb923c", "#818cf8", "#e879f9", "#22d3ee"];
  const NIVEL_FILL = { "scăzut": "#16351f", "moderat": "#3a2e0a", "ridicat": "#3a230c", "critic": "#3a1414" };
  const NIVEL_TEXT = { "scăzut": "#4ade80", "moderat": "#fbbf24", "ridicat": "#fb923c", "critic": "#f87171" };
  const TXT = "#e8ebf2", MUT = "#94a0b8", LINE = "#28303f", GRID = "#1c2230";

  const nf = (n) => Math.round(n).toLocaleString("ro-RO");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // scurtează etichetele lungi ca să încapă în coloana de stânga
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  function svg(w, h, inner) {
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">${inner}</svg>`;
  }

  /* ---- Bare orizontale generice (CAPEX, consum apă) ---- */
  function bareOrizontale(rows, opts = {}) {
    // rows: [{ eticheta, valoare, valoareText, color }]
    if (!rows || !rows.length) return "";
    const W = 680, rowH = 34, padT = 10, padB = 8;
    const labelW = opts.labelW || 168, valueW = opts.valueW || 132, gap = 12;
    const barX = labelW, barMaxW = W - labelW - valueW - gap;
    const H = rows.length * rowH + padT + padB;
    const max = Math.max.apply(null, rows.map((r) => r.valoare)) || 1;
    let inner = "";
    rows.forEach((r, i) => {
      const y = padT + i * rowH, cy = y + rowH / 2;
      const bw = Math.max(2, (r.valoare / max) * barMaxW);
      const color = r.color || PALETA[i % PALETA.length];
      inner += `<text x="${labelW - 10}" y="${cy}" fill="${TXT}" font-size="13" text-anchor="end" dominant-baseline="middle">${esc(trunc(r.eticheta, 26))}</text>`;
      inner += `<rect x="${barX}" y="${y + 6}" width="${bw}" height="${rowH - 14}" rx="4" fill="${color}"/>`;
      inner += `<text x="${W - 6}" y="${cy}" fill="${TXT}" font-size="13" font-weight="700" text-anchor="end" dominant-baseline="middle">${esc(r.valoareText)}</text>`;
    });
    return svg(W, H, inner);
  }

  function chartCapex(grupuri) {
    if (!grupuri || !grupuri.length) return "";
    const rows = grupuri.slice().sort((a, b) => b.total - a.total).map((g, i) => ({
      eticheta: g.specialitate, valoare: g.total, valoareText: `${nf(g.total)} € · ${g.pct}%`,
      color: PALETA[i % PALETA.length],
    }));
    return bareOrizontale(rows);
  }

  function chartConsumApa(consumatori) {
    if (!consumatori || !consumatori.length) return "";
    const rows = consumatori.filter((c) => c.Q > 0).sort((a, b) => b.Q - a.Q).map((c, i) => ({
      eticheta: c.nume, valoare: c.Q, valoareText: `${nf(c.Q)} mc/zi`, color: PALETA[i % PALETA.length],
    }));
    return bareOrizontale(rows, { valueW: 96 });
  }

  /* ---- Matrice de risc: probabilitate (rânduri) × impact (coloane) ---- */
  function chartRiscMatrix(risc, nivelOf) {
    if (!risc || !risc.length || typeof nivelOf !== "function") return "";
    const impactCols = [["mic", "Mic"], ["mediu", "Mediu"], ["mare", "Mare"], ["critic", "Critic"]];
    const probRows = [["mare", "Mare"], ["medie", "Medie"], ["mica", "Mică"]]; // mare sus
    const W = 680, cellW = 128, cellH = 68, x0 = 150, y0 = 40;
    const H = y0 + probRows.length * cellH + 46;
    let inner = "";
    // titluri axe
    inner += `<text x="${x0 + (impactCols.length * cellW) / 2}" y="20" fill="${MUT}" font-size="12" font-weight="700" text-anchor="middle">IMPACT →</text>`;
    inner += `<text x="18" y="${y0 + (probRows.length * cellH) / 2}" fill="${MUT}" font-size="12" font-weight="700" text-anchor="middle" transform="rotate(-90 18 ${y0 + (probRows.length * cellH) / 2})">PROBABILITATE →</text>`;
    // capete de coloană
    impactCols.forEach((c, j) => {
      inner += `<text x="${x0 + j * cellW + cellW / 2}" y="${y0 - 8}" fill="${MUT}" font-size="12" text-anchor="middle">${esc(c[1])}</text>`;
    });
    // celule
    probRows.forEach((pr, i) => {
      inner += `<text x="${x0 - 12}" y="${y0 + i * cellH + cellH / 2}" fill="${MUT}" font-size="12" text-anchor="end" dominant-baseline="middle">${esc(pr[1])}</text>`;
      impactCols.forEach((c, j) => {
        const niv = nivelOf(pr[0], c[0]);
        const x = x0 + j * cellW, y = y0 + i * cellH;
        const hits = risc.filter((r) => r.probabilitate === pr[0] && r.impact === c[0]);
        inner += `<rect x="${x + 3}" y="${y + 3}" width="${cellW - 6}" height="${cellH - 6}" rx="7" fill="${NIVEL_FILL[niv]}" stroke="${LINE}"/>`;
        if (hits.length) {
          inner += `<circle cx="${x + cellW / 2}" cy="${y + cellH / 2 - 4}" r="14" fill="${NIVEL_TEXT[niv]}"/>`;
          inner += `<text x="${x + cellW / 2}" y="${y + cellH / 2 - 4}" fill="#0d1017" font-size="14" font-weight="800" text-anchor="middle" dominant-baseline="central">${hits.length}</text>`;
          inner += `<text x="${x + cellW / 2}" y="${y + cellH - 12}" fill="${NIVEL_TEXT[niv]}" font-size="10" text-anchor="middle" text-transform="uppercase">${esc(niv)}</text>`;
        }
      });
    });
    // legendă
    const leg = [["scăzut", "Scăzut"], ["moderat", "Moderat"], ["ridicat", "Ridicat"], ["critic", "Critic"]];
    const ly = y0 + probRows.length * cellH + 24;
    let lx = x0;
    leg.forEach((l) => {
      inner += `<rect x="${lx}" y="${ly - 9}" width="12" height="12" rx="3" fill="${NIVEL_FILL[l[0]]}" stroke="${NIVEL_TEXT[l[0]]}"/>`;
      inner += `<text x="${lx + 18}" y="${ly}" fill="${MUT}" font-size="11" dominant-baseline="middle">${esc(l[1])}</text>`;
      lx += 100;
    });
    return svg(W, H, inner);
  }

  /* ---- Curbă caracteristică grup de pompare (H–Q) ---- */
  function chartPompa(pompare) {
    if (!pompare) return "";
    const pts = [];
    if (pompare.pompePrincipale) pts.push({ nume: "Pompe principale", Q: pompare.pompePrincipale.Q, H: pompare.pompePrincipale.H_mCA, color: "#38bdf8" });
    if (pompare.pompeHidrantiExt && pompare.pompeHidrantiExt.Q > 0) pts.push({ nume: "Hidranți exteriori", Q: pompare.pompeHidrantiExt.Q, H: pompare.pompeHidrantiExt.H_mCA, color: "#a78bfa" });
    if (pompare.jockey) pts.push({ nume: "Jockey (pilot)", Q: pompare.jockey.Q, H: pompare.jockey.H_mCA, color: "#fbbf24" });
    if (!pts.length) return "";

    const W = 680, H = 340, mL = 54, mR = 16, mT = 18, mB = 46;
    const plotW = W - mL - mR, plotH = H - mT - mB;
    const qMax = Math.max.apply(null, pts.map((p) => p.Q)) * 1.5 || 10;
    const hMax = Math.max.apply(null, pts.map((p) => p.H)) * 1.25 || 100;
    const sx = (q) => mL + (q / qMax) * plotW;
    const sy = (h) => mT + plotH - (h / hMax) * plotH;

    let inner = "";
    // grilă + axe
    const xTicks = 5, yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const h = (hMax / yTicks) * i, y = sy(h);
      inner += `<line x1="${mL}" y1="${y}" x2="${mL + plotW}" y2="${y}" stroke="${GRID}"/>`;
      inner += `<text x="${mL - 8}" y="${y}" fill="${MUT}" font-size="11" text-anchor="end" dominant-baseline="middle">${Math.round(h)}</text>`;
    }
    for (let i = 0; i <= xTicks; i++) {
      const q = (qMax / xTicks) * i, x = sx(q);
      inner += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + plotH}" stroke="${GRID}"/>`;
      inner += `<text x="${x}" y="${mT + plotH + 16}" fill="${MUT}" font-size="11" text-anchor="middle">${Math.round(q)}</text>`;
    }
    inner += `<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${mT + plotH}" stroke="${LINE}"/>`;
    inner += `<line x1="${mL}" y1="${mT + plotH}" x2="${mL + plotW}" y2="${mT + plotH}" stroke="${LINE}"/>`;
    // titluri axe
    inner += `<text x="${mL + plotW / 2}" y="${H - 6}" fill="${MUT}" font-size="12" text-anchor="middle">Debit Q (l/s)</text>`;
    inner += `<text x="14" y="${mT + plotH / 2}" fill="${MUT}" font-size="12" text-anchor="middle" transform="rotate(-90 14 ${mT + plotH / 2})">Înălțime de pompare H (mCA)</text>`;

    // curbă caracteristică descrescătoare prin fiecare punct de funcționare: H(q)=H0-(H0-Hop)(q/Qop)²
    pts.forEach((p) => {
      const H0 = p.H * 1.2, qEnd = p.Q * 1.35;
      let d = "";
      const N = 24;
      for (let k = 0; k <= N; k++) {
        const q = (qEnd / N) * k;
        const h = H0 - (H0 - p.H) * Math.pow(p.Q ? q / p.Q : 0, 2);
        d += (k ? "L" : "M") + sx(q).toFixed(1) + " " + sy(Math.max(0, h)).toFixed(1) + " ";
      }
      inner += `<path d="${d}" fill="none" stroke="${p.color}" stroke-width="2" opacity="0.85"/>`;
      // punct de funcționare + proiecții
      const px = sx(p.Q), py = sy(p.H);
      inner += `<line x1="${px}" y1="${py}" x2="${px}" y2="${mT + plotH}" stroke="${p.color}" stroke-dasharray="3 3" opacity="0.5"/>`;
      inner += `<line x1="${mL}" y1="${py}" x2="${px}" y2="${py}" stroke="${p.color}" stroke-dasharray="3 3" opacity="0.5"/>`;
      inner += `<circle cx="${px}" cy="${py}" r="5" fill="${p.color}" stroke="#0d1017" stroke-width="1.5"/>`;
      inner += `<text x="${px + 8}" y="${py - 8}" fill="${p.color}" font-size="11" font-weight="700">${p.Q} l/s · ${p.H} mCA</text>`;
    });
    // legendă — jos-stânga (zona liberă a graficului, sub curbe)
    let lx = mL + 12, ly = mT + plotH - 18 - (pts.length - 1) * 18;
    pts.forEach((p) => {
      inner += `<rect x="${lx}" y="${ly - 8}" width="18" height="4" rx="2" fill="${p.color}"/>`;
      inner += `<text x="${lx + 24}" y="${ly}" fill="${TXT}" font-size="11" dominant-baseline="middle">${esc(p.nume)}</text>`;
      ly += 18;
    });

    return svg(W, H, inner);
  }

  const api = { chartCapex, chartConsumApa, chartRiscMatrix, chartPompa, bareOrizontale, PALETA };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CHARTS = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
