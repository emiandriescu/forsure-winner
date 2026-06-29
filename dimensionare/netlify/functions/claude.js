/* Proxy serverless pentru Claude (Netlify Function) — zero dependențe.
   Ține ANTHROPIC_API_KEY ca variabilă de mediu; frontend-ul NU vede cheia.
   Rol: redirecționează fidel corpul /v1/messages construit de ai.js și
   injectează cheia. Calculele de dimensionare rămân 100% deterministe în frontend.

   Deploy (Netlify): pune folderul „dimensionare" pe Netlify (drag & drop sau Git),
   apoi Site settings → Environment variables → ANTHROPIC_API_KEY = sk-ant-...
   Endpoint rezultat: /.netlify/functions/claude   (rulează pe Node 18+ — fetch nativ)
*/
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: "Method Not Allowed" };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "ANTHROPIC_API_KEY nu este setat în mediul Netlify." }) };

  let req;
  try { req = JSON.parse(event.body || "{}"); } catch (e) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "JSON invalid" }) }; }
  if (!req.messages) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Lipsește câmpul messages." }) };

  // Forward fidel: păstrăm model/thinking/output_config/max_tokens trimise de client,
  // cu valori implicite sigure pe Opus 4.8 (FĂRĂ temperature/budget_tokens).
  const body = {
    model: req.model || "claude-opus-4-8",
    max_tokens: req.max_tokens || 8000,
    system: req.system,
    messages: req.messages,
  };
  if (req.thinking) body.thinking = req.thinking;             // adaptive (sau absent)
  if (req.output_config) body.output_config = req.output_config; // ieșiri structurate

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await resp.text();
    return { statusCode: resp.status, headers: { ...CORS, "content-type": "application/json" }, body: data };
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: String(e && e.message || e) }) };
  }
};
