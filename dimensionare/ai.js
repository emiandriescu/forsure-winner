/* ===== SOWILO Dimensionare — STRAT AI (Claude) =====
   Rol strict limitat:
     1) propune IPOTEZE pentru câmpurile lipsă (de confirmat de proiectant);
     2) redactează NARATIVUL memoriului pe baza cifrelor deterministe.
   REGULĂ ABSOLUTĂ: AI nu inventează și nu modifică nicio cifră de dimensionare.
   Cheia API NU stă în browser — apelurile trec printr-un proxy serverless
   (Netlify Function) care ține ANTHROPIC_API_KEY. Pentru testul propriu al
   inginerului există modul „cheie în localStorage" (apel direct, doar local).
*/
(function (root) {
  "use strict";

  const MODEL = "claude-opus-4-8";
  const ANTHROPIC_VERSION = "2023-06-01";
  const PROXY_DEFAULT = "/.netlify/functions/claude";

  // ---------- Scheme de ieșire structurată (output_config.format) ----------
  const IPOTEZE_SCHEMA = {
    type: "object",
    properties: {
      ipoteze: {
        type: "array",
        items: {
          type: "object",
          properties: {
            camp: { type: "string", description: "numele câmpului din formular" },
            eticheta: { type: "string", description: "denumire lizibilă" },
            valoare: { type: "string", description: "valoarea propusă (un singur token pentru completarea formularului)" },
            motivare: { type: "string", description: "1 frază: temei normativ sau de practică" },
            incredere: { type: "string", enum: ["mare", "medie", "mica"] },
          },
          required: ["camp", "eticheta", "valoare", "motivare", "incredere"],
          additionalProperties: false,
        },
      },
    },
    required: ["ipoteze"],
    additionalProperties: false,
  };

  const REDACTARE_SCHEMA = {
    type: "object",
    properties: {
      descriere: { type: "string", description: "1 paragraf — prezentarea obiectivului și scopul memoriului" },
      solutii: { type: "string", description: "1-2 paragrafe — justificarea soluțiilor, cu exact cifrele și normativele date" },
      concluzii: { type: "string", description: "1 paragraf — concluzie" },
    },
    required: ["descriere", "solutii", "concluzii"],
    additionalProperties: false,
  };

  // ---------- Catalog câmpuri pentru care AI poate propune ipoteze ----------
  const CANDIDATE_FIELDS = [
    { camp: "nrNiveluriSupraterane", eticheta: "Niveluri supraterane", unit: "buc", hint: "regim de înălțime tipic pentru funcțiune" },
    { camp: "inaltimeUltimPlanseu", eticheta: "Înălțime ultim planșeu", unit: "m", hint: "≈ niveluri × 3 m" },
    { camp: "acNivel", eticheta: "Arie construită / nivel", unit: "m²", hint: "din arie desfășurată / niveluri, dacă lipsește" },
    { camp: "arieDesfasurata", eticheta: "Arie desfășurată totală", unit: "m²", hint: "≈ Ac/nivel × niveluri (+ parcaj)" },
    { camp: "arieAcoperis", eticheta: "Arie acoperiș + platforme", unit: "m²", hint: "pentru debitul pluvial" },
    { camp: "i_ploaie", eticheta: "Intensitate ploaie i", unit: "l/s/ha", hint: "STAS 9470 — după localitate (Sinaia ≈ 130)" },
    { camp: "nivelStabilitate", eticheta: "Nivel stabilitate la foc", unit: "I–V", hint: "I sau II la clădiri importante de zid/beton" },
    { camp: "volumCompartiment", eticheta: "Volum compartiment incendiu", unit: "m³", hint: "≈ arie desfășurată × 3 m" },
    { camp: "risc", eticheta: "Risc de incendiu", unit: "mic/mediu/mare", hint: "mediu uzual la cazare/birouri" },
    { camp: "saliAglomerate", eticheta: "Săli aglomerate >200 pers", unit: "true/false", hint: "true dacă există sală/restaurant mare" },
    { camp: "parcLocuri", eticheta: "Locuri parcaj subteran", unit: "buc", hint: "după norma de parcare locală" },
    { camp: "nrNiveluriParcare", eticheta: "Niveluri parcare", unit: "buc", hint: "1–2 la subteran uzual" },
    { camp: "parcArie", eticheta: "Arie parcaj protejată", unit: "m²", hint: "≈ locuri × 30 m²" },
    { camp: "d_mese", eticheta: "Restaurant (nr. mese)", unit: "buc", hint: "≈ camere × 1.5 la hotel cu restaurant" },
    { camp: "d_personal", eticheta: "Personal", unit: "pers", hint: "≈ camere × 0.6 la hotel" },
    { camp: "d_piscina", eticheta: "Piscină", unit: "mc/zi", hint: "împrospătare zilnică, dacă există" },
    { camp: "d_spa", eticheta: "Spa", unit: "mc/zi", hint: "dacă există zonă wellness" },
    { camp: "d_irigatii", eticheta: "Irigații", unit: "mc/zi", hint: "după aria spațiilor verzi" },
  ];

  // ---------- Construirea cererilor /v1/messages ----------
  function ipotezeUserText(known, candidates) {
    const lines = candidates.map((c) => `- ${c.camp} (${c.eticheta}${c.unit ? ", " + c.unit : ""}): ${c.hint || ""}`).join("\n");
    return [
      "Profil clădire cunoscut (JSON):",
      JSON.stringify(known, null, 2),
      "",
      "Câmpuri lipsă pentru care îți cer ipoteze de pornire:",
      lines,
      "",
      "Propune o valoare implicită rezonabilă pentru fiecare câmp lipsă unde ai temei (normativ/practică curentă).",
      "Valoarea trebuie să fie un singur token potrivit pentru completarea unui formular (un număr, sau exact una dintre opțiunile permise).",
      "Returnează DOAR câmpurile pe care le poți susține. Fiecare valoare e o ipoteză de confirmat de proiectant.",
    ].join("\n");
  }

  function redactareUserText(c) {
    return [
      "Cifrele de dimensionare (deterministe — NU le modifica, NU le rotunji, NU adăuga altele) — JSON:",
      JSON.stringify(c, null, 2),
      "",
      "Redactează trei secțiuni narative în limba română, ton profesional de memoriu tehnic:",
      "1) descriere — un paragraf de prezentare a obiectivului și a scopului memoriului;",
      "2) solutii — unul-două paragrafe care justifică soluțiile de instalații, referind EXACT cifrele și normativele din date;",
      "3) concluzii — un paragraf de concluzie.",
      "Folosește exclusiv valorile numerice din date. Nu introduce cifre noi.",
    ].join("\n");
  }

  const SYS_IPOTEZE =
    "Ești inginer proiectant de instalații în România. Propui valori implicite rezonabile pentru câmpurile lipsă " +
    "dintr-un profil de clădire, ca punct de pornire pentru predimensionare. Te bazezi pe normativele românești " +
    "(P118/1-2, NP 127, I9, I7, I5, I13, NTPEE, STAS) și pe practica curentă. Fiecare valoare e o IPOTEZĂ de confirmat " +
    "de proiectant — nu o certitudine. Nu pretinde că ai date despre clădirea reală; propui doar ipoteze de pornire.";

  const SYS_REDACTARE =
    "Ești inginer proiectant de instalații în România. Redactezi textul narativ al unui memoriu tehnic, în limba română, " +
    "ton profesional, pe baza EXCLUSIV a cifrelor de dimensionare furnizate. REGULĂ ABSOLUTĂ: nu modifici, nu rotunjești " +
    "și nu inventezi nicio valoare numerică — folosești exact cifrele din date. Scrii proză de legătură (descriere, " +
    "justificarea soluțiilor, concluzii), nu tabele și nu liste de cifre.";

  function ipotezeRequest(known, candidates) {
    return {
      model: MODEL,
      max_tokens: 4096,
      system: SYS_IPOTEZE,
      output_config: { format: { type: "json_schema", schema: IPOTEZE_SCHEMA } },
      messages: [{ role: "user", content: ipotezeUserText(known, candidates || CANDIDATE_FIELDS) }],
    };
  }

  function redactareRequest(computed) {
    return {
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: SYS_REDACTARE,
      output_config: { format: { type: "json_schema", schema: REDACTARE_SCHEMA } },
      messages: [{ role: "user", content: redactareUserText(computed) }],
    };
  }

  // ---------- Rezumat determinist pentru redactare (doar cifrele finale) ----------
  function computedSummary(p) {
    const prof = p.dim && p.dim.profile ? p.dim.profile : {};
    const s = {
      obiectiv: { nume: p.name, beneficiar: p.beneficiar, amplasament: p.adresa, functiune: p.functiune,
        unitate: prof.valoareUnit, persoane: prof.persoane, niveluri: prof.nrNiveluriSupraterane },
    };
    if (p.apa) s.apa = { Qzi_med: p.apa.debite.Qzi_med, Qmax_orar_ls: p.apa.debite.Qmax_orar_ls, dn: p.apa.debite.dn,
      rezervor_mc: p.apa.rezervor.adoptat, hidrofor_mCA: p.apa.statie.H_mCA, normativ: p.apa.debite.normativ };
    if (p.canalizare) s.canalizare = { menajera_ls: p.canalizare.menajera.Qu_orar_ls,
      pluviala_ls: p.canalizare.pluviala.necesar ? p.canalizare.pluviala.Q : null, normativ: p.canalizare.menajera.normativ };
    if (p.electrice) s.electrice = { Pi: p.electrice.Pi, Pa: p.electrice.Pa, S: p.electrice.S, trafo: p.electrice.trafo, ge: p.electrice.ge, normativ: p.electrice.normativ };
    if (p.gaze) s.gaze = { P_total: p.gaze.P_total, q: p.gaze.q, prm: p.gaze.prm, normativ: p.gaze.normativ };
    if (p.sisteme) s.sisteme = {
      termice: { Pinc: p.sisteme.termice.Pinc, Prac: p.sisteme.termice.Prac },
      ventilatie: { aerCamere: p.sisteme.ventilatie.aerCamere, recuperare: p.sisteme.ventilatie.recuperare },
      detectie: { loops: p.sisteme.detectie.loops, obligatoriu: p.sisteme.detectie.obligatoriu },
      desfumare: { Qparcaj: p.sisteme.desfumare.Qparcaj, Qpresurizare: p.sisteme.desfumare.Qpresurizare },
    };
    if (p.dim) s.stingere = { rezervor_incendiu_mc: p.dim.rezervor.adoptat,
      pompe_ls: p.dim.pompare.pompePrincipale.Q, normativ: "P118/2, NP 127, SR EN 12845" };
    if (p.crb) s.cost_estimat_eur = p.crb.cost.total;
    return s;
  }

  // ---------- Aplicarea ipotezelor (pur, testabil) ----------
  // current: obiect cu valorile curente ale formularului; întoarce {merged, applied}.
  function mergeIpoteze(current, ipoteze, overwrite) {
    const merged = Object.assign({}, current);
    const applied = [];
    (ipoteze || []).forEach((ip) => {
      if (!ip || !ip.camp) return;
      const v = current[ip.camp];
      const empty = v == null || v === "" || (typeof v === "number" && v === 0);
      if (overwrite || empty) { merged[ip.camp] = ip.valoare; applied.push(ip); }
    });
    return { merged, applied };
  }

  // ---------- Extragerea JSON din răspuns ----------
  function extractJSON(message) {
    const blocks = (message && message.content) || [];
    const block = blocks.find((b) => b && b.type === "text" && b.text);
    if (!block) throw new Error("Răspuns AI fără conținut text.");
    return JSON.parse(block.text);
  }

  // ---------- Rețea (proxy serverless sau cheie locală pentru test) ----------
  function ls(k) { try { return typeof localStorage !== "undefined" ? localStorage.getItem(k) : null; } catch (e) { return null; } }

  async function callAnthropic(body) {
    if (typeof fetch === "undefined") throw new Error("fetch indisponibil în acest mediu.");
    const key = ls("sowilo_anthropic_key");
    if (key) {
      // MOD TEST LOCAL — apel direct din browser (doar pentru inginer; nu în producție)
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": ANTHROPIC_VERSION,
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("API " + r.status + ": " + (await r.text()));
      return r.json();
    }
    const proxy = ls("sowilo_ai_proxy") || PROXY_DEFAULT;
    const r = await fetch(proxy, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error("Proxy " + r.status + ": " + (await r.text()));
    return r.json();
  }

  function configured() { return !!(ls("sowilo_anthropic_key") || ls("sowilo_ai_proxy")); }

  // ---------- API de nivel înalt ----------
  async function proposeIpoteze(known, candidates) {
    const msg = await callAnthropic(ipotezeRequest(known, candidates));
    const out = extractJSON(msg);
    return out.ipoteze || [];
  }

  async function redacteaza(computed) {
    const msg = await callAnthropic(redactareRequest(computed));
    return extractJSON(msg);
  }

  const api = {
    MODEL, PROXY_DEFAULT, CANDIDATE_FIELDS, IPOTEZE_SCHEMA, REDACTARE_SCHEMA,
    ipotezeRequest, redactareRequest, computedSummary, mergeIpoteze, extractJSON,
    proposeIpoteze, redacteaza, configured,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AI = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
