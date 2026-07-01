/* Teste pentru părțile pure ale stratului AI (fără rețea).
   Rulare: node dimensionare/ai.test.js */
const AI = require("./ai.js");
let pass = 0, fail = 0;
function ok(name, cond, got) { console.log(`${cond ? "✓" : "✗"} ${name}: ${got}`); cond ? pass++ : fail++; }
function eq(name, got, exp) { ok(name, got === exp, got + (got === exp ? "" : " (așteptat " + exp + ")")); }

// ---- Cererile respectă constrângerile API opus-4-8 ----
const reqI = AI.ipotezeRequest({ functiune: "hotel", unitate: 90 });
eq("ipoteze model = claude-opus-4-8", reqI.model, "claude-opus-4-8");
ok("ipoteze FĂRĂ temperature", reqI.temperature === undefined, String(reqI.temperature));
ok("ipoteze FĂRĂ budget_tokens", !(reqI.thinking && reqI.thinking.budget_tokens), JSON.stringify(reqI.thinking));
ok("ipoteze are output_config.format json_schema", reqI.output_config.format.type === "json_schema", reqI.output_config.format.type);
ok("ipoteze include datele cunoscute în prompt", reqI.messages[0].content.includes('"functiune": "hotel"'), "ok");
ok("ipoteze listează câmpuri candidate", reqI.messages[0].content.includes("nivelStabilitate"), "ok");

const reqR = AI.redactareRequest({ obiectiv: { nume: "Hotel Test" } });
eq("redactare model = claude-opus-4-8", reqR.model, "claude-opus-4-8");
ok("redactare thinking adaptive", reqR.thinking && reqR.thinking.type === "adaptive", JSON.stringify(reqR.thinking));
ok("redactare FĂRĂ temperature", reqR.temperature === undefined, String(reqR.temperature));
ok("redactare schema cere descriere/solutii/concluzii",
  ["descriere", "solutii", "concluzii"].every((k) => reqR.output_config.format.schema.properties[k]), "ok");

// ---- Schemele sunt valide pentru structured outputs (additionalProperties:false) ----
ok("IPOTEZE_SCHEMA additionalProperties:false", AI.IPOTEZE_SCHEMA.additionalProperties === false, "ok");
ok("REDACTARE_SCHEMA additionalProperties:false", AI.REDACTARE_SCHEMA.additionalProperties === false, "ok");

// ---- mergeIpoteze: completează doar câmpurile goale (overwrite=false) ----
const current = { nivelStabilitate: "II", volumCompartiment: "", risc: 0, parcLocuri: 120 };
const ipoteze = [
  { camp: "nivelStabilitate", valoare: "I" },     // ocupat → nu se schimbă
  { camp: "volumCompartiment", valoare: "35000" }, // gol → se aplică
  { camp: "risc", valoare: "mediu" },              // 0 → tratat ca gol → se aplică
  { camp: "parcLocuri", valoare: "200" },          // ocupat → nu se schimbă
  { camp: "i_ploaie", valoare: "130" },            // absent → se aplică
];
const m = AI.mergeIpoteze(current, ipoteze, false);
eq("nu suprascrie câmp ocupat (nivelStabilitate)", m.merged.nivelStabilitate, "II");
eq("completează câmp gol (volumCompartiment)", m.merged.volumCompartiment, "35000");
eq("tratează 0 ca gol (risc)", m.merged.risc, "mediu");
eq("nu suprascrie numeric ocupat (parcLocuri)", m.merged.parcLocuri, 120);
eq("aplică câmp absent (i_ploaie)", m.merged.i_ploaie, "130");
eq("applied conține doar cele 3 modificate", m.applied.length, 3);

// ---- mergeIpoteze overwrite=true suprascrie tot ----
const m2 = AI.mergeIpoteze(current, ipoteze, true);
eq("overwrite schimbă și câmpul ocupat", m2.merged.nivelStabilitate, "I");
eq("overwrite aplică toate", m2.applied.length, 5);

// ---- extractJSON: din răspunsul Anthropic ----
const fakeMsg = { content: [{ type: "thinking", thinking: "" }, { type: "text", text: '{"ipoteze":[{"camp":"risc","valoare":"mediu"}]}' }] };
const parsed = AI.extractJSON(fakeMsg);
eq("extractJSON sare peste thinking, ia textul", parsed.ipoteze[0].camp, "risc");

let threw = false;
try { AI.extractJSON({ content: [] }); } catch (e) { threw = true; }
ok("extractJSON aruncă pe răspuns gol", threw, String(threw));

// ---- computedSummary: rezumat doar cu cifre deterministe ----
const proj = {
  name: "Hotel Sinaia", beneficiar: "X", adresa: "Sinaia", functiune: "hotel",
  dim: { profile: { valoareUnit: 90, persoane: 180, nrNiveluriSupraterane: 4 },
    rezervor: { adoptat: 210 }, pompare: { pompePrincipale: { Q: 25 } } },
  apa: { debite: { Qzi_med: 74.5, Qmax_orar_ls: 2.4, dn: "DN 100", normativ: "I9-2022" }, rezervor: { adoptat: 110 }, statie: { H_mCA: 57 } },
  electrice: { Pi: 1752, Pa: 1051, S: 1142, trafo: 1250, ge: 550, normativ: "I7/2023" },
  crb: { cost: { total: 123456 } },
};
const sum = AI.computedSummary(proj);
eq("summary preia rezervorul de incendiu", sum.stingere.rezervor_incendiu_mc, 210);
eq("summary preia DN-ul branșamentului", sum.apa.dn, "DN 100");
eq("summary preia trafo", sum.electrice.trafo, 1250);
eq("summary preia costul", sum.cost_estimat_eur, 123456);
ok("summary NU conține câmpuri de tip steps (doar cifre finale)",
  JSON.stringify(sum).indexOf('"steps"') === -1, "ok");

console.log(`\n${pass} trecute, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
