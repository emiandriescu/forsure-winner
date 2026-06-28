/* Proxy serverless pentru Claude (Netlify Function).
   Ține ANTHROPIC_API_KEY ca variabilă de mediu — frontend-ul NU vede cheia.
   Deploy: pune folderul pe Netlify; setează env var ANTHROPIC_API_KEY în dashboard.
   Endpoint rezultat: /.netlify/functions/claude

   Body așteptat: { system, messages, output_config?, max_tokens? }
   Răspuns: corpul JSON de la /v1/messages.

   FAZA 4 — folosit de ai.js pentru: (1) completarea ipotezelor lipsă (JSON structurat),
   (2) redactarea memoriului. Calculele numerice rămân 100% deterministe în frontend.
*/
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY nu este setat" }) };

  let req;
  try { req = JSON.parse(event.body || "{}"); } catch (e) { return { statusCode: 400, body: "JSON invalid" }; }

  const body = {
    model: req.model || "claude-opus-4-8",
    max_tokens: req.max_tokens || 8000,
    thinking: { type: "adaptive" }, // adaptiv — FĂRĂ budget_tokens/temperature pe Opus 4.8
    system: req.system,
    messages: req.messages,
  };
  if (req.output_config) body.output_config = req.output_config; // ieșiri structurate (nu prefill)

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return { statusCode: resp.status, headers: { "content-type": "application/json" }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e) }) };
  }
};
