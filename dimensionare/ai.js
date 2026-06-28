/* ===== SOWILO Dimensionare — strat AI (client) — FAZA 4 =====
   Apelează proxy-ul Claude (netlify/functions/claude.js) pentru:
   1) completareIpoteze(profile) — propune valorile lipsă (JSON structurat), marcate ca ipoteze
   2) redacteazaMemoriu(dim)     — redactează textul memoriului din cifrele deterministe
   Calculele numerice NU se fac aici — rămân deterministe în calc-stingere.js.

   Configurare endpoint: window.AI_ENDPOINT (implicit "/.netlify/functions/claude").
   Mod BYO-key (testare locală): dacă există localStorage.anthropic_key, se poate apela
   direct API-ul cu anthropic-dangerous-direct-browser-access (vezi README — doar pentru testele tale).
*/
(function (root) {
  "use strict";
  const ENDPOINT = () => root.AI_ENDPOINT || "/.netlify/functions/claude";

  async function call({ system, messages, output_config, max_tokens }) {
    const byo = (() => { try { return localStorage.getItem("anthropic_key"); } catch (e) { return null; } })();
    if (byo) {
      // Mod test local (cheia ta, în browser). NU pentru producție.
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": byo, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-opus-4-8", max_tokens: max_tokens || 8000, thinking: { type: "adaptive" }, system, messages, ...(output_config ? { output_config } : {}) }),
      });
      return r.json();
    }
    const r = await fetch(ENDPOINT(), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ system, messages, output_config, max_tokens }) });
    return r.json();
  }

  function textFrom(resp) {
    if (!resp || !resp.content) return "";
    const t = resp.content.find((b) => b.type === "text");
    return t ? t.text : "";
  }

  // 1) Completare ipoteze — ieșire structurată; fiecare valoare marcată „ipoteză — de confirmat"
  async function completareIpoteze(profile) {
    const schema = {
      type: "object", additionalProperties: false,
      required: ["ipoteze"],
      properties: {
        ipoteze: {
          type: "array",
          items: {
            type: "object", additionalProperties: false,
            required: ["camp", "valoarePropusa", "motiv"],
            properties: { camp: { type: "string" }, valoarePropusa: { type: "string" }, motiv: { type: "string" } },
          },
        },
      },
    };
    const resp = await call({
      system: "Ești inginer proiectant instalații PSI în România. Pe baza datelor minime de clădire, propui valorile lipsă necesare dimensionării (nivel stabilitate la foc, volum compartiment, clasă de risc, simultaneități), conform normativelor în vigoare (P118, NP 127). Fiecare valoare e o IPOTEZĂ de confirmat de inginer — nu o certitudine. NU faci calcule numerice de dimensionare.",
      messages: [{ role: "user", content: "Profil clădire (JSON):\n" + JSON.stringify(profile, null, 2) + "\n\nPropune ipotezele lipsă necesare dimensionării stingerii." }],
      output_config: { format: { type: "json_schema", schema } },
      max_tokens: 4000,
    });
    try { return JSON.parse(textFrom(resp)); } catch (e) { return { ipoteze: [], _raw: resp }; }
  }

  // 2) Redactare memoriu — primește rezultatele deterministe; NU inventează cifre
  async function redacteazaMemoriu(dim) {
    const resp = await call({
      system: "Ești inginer proiectant instalații PSI în România. Redactezi un memoriu tehnic în limba română (diacritice corecte) folosind EXCLUSIV cifrele și pașii de calcul primiți — NU inventezi valori. Structură: date generale, încadrare normativă, soluția de stingere cu breviar de calcul, concluzii. Ton tehnic, sobru.",
      messages: [{ role: "user", content: "Rezultate determinist calculate (JSON):\n" + JSON.stringify(dim, null, 2) + "\n\nRedactează memoriul tehnic pe baza acestor cifre." }],
      max_tokens: 12000,
    });
    return textFrom(resp);
  }

  const api = { completareIpoteze, redacteazaMemoriu, call };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AI = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
