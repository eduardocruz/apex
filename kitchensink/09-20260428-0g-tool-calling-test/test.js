// kitchensink/09 — Does 0G Compute pass through OpenAI tool-calling?
//
// Hypothesis: qwen-2.5-7b-instruct supports tools natively (HF model card
// confirms). Open question: does the 0G broker/serving layer forward
// `tools` + `tool_choice` from the request to the model, and surface
// `tool_calls` in the response?
//
// Experiment: send a chat completion with a single function tool the
// model can ONLY satisfy by calling. If `choices[0].message.tool_calls`
// is populated → tool-calling works through 0G.
//
// Run:  cp ../07-20260427-agent-0g-compute-hello/.env .env
//       cp ../07-20260427-agent-0g-compute-hello/.selected-provider.json .
//       npm install && npm test
//
// Output: writes results-<timestamp>.json with full request/response,
// prints a verdict to stdout.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env loader
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

const RPC_URL = process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) { console.error('PRIVATE_KEY missing in .env'); process.exit(1); }

const selectedPath = path.join(__dirname, '.selected-provider.json');
if (!fs.existsSync(selectedPath)) {
  console.error('.selected-provider.json missing. Copy from /07.');
  process.exit(1);
}
const selected = JSON.parse(fs.readFileSync(selectedPath, 'utf8'));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const broker = await createZGComputeNetworkBroker(wallet);

console.log(`Wallet:   ${wallet.address}`);
console.log(`Provider: ${selected.provider}`);
console.log(`Model:    ${selected.model}\n`);

const { endpoint, model } = await broker.inference.getServiceMetadata(selected.provider);
const headers = await broker.inference.getRequestHeaders(selected.provider);

// One function the model can only fulfill by tool-calling.
// Phrasing forces it: "Use the get_weather tool". A non-tool-aware
// model would just hallucinate the answer.
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current temperature in Celsius for a city. Returns an integer.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name, e.g. "Recife"' },
        },
        required: ['city'],
      },
    },
  },
];

const messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant. When the user asks about weather, you MUST call the get_weather tool. Do not answer without calling it.',
  },
  { role: 'user', content: 'What is the weather in Recife right now?' },
];

const requestBody = { model, messages, tools, tool_choice: 'auto' };
console.log('REQUEST:');
console.log(JSON.stringify(requestBody, null, 2));
console.log();

const t0 = Date.now();
const r = await fetch(`${endpoint}/chat/completions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(requestBody),
});
const latencyMs = Date.now() - t0;

const text = await r.text();
let data;
try { data = JSON.parse(text); }
catch { data = { _raw: text, _parseFailed: true }; }

console.log(`RESPONSE (HTTP ${r.status}, ${latencyMs}ms):`);
console.log(JSON.stringify(data, null, 2));
console.log();

const choice = data?.choices?.[0]?.message;
const toolCalls = choice?.tool_calls;
const content = choice?.content;

const verdict = {
  ok: r.ok,
  status: r.status,
  hasToolCalls: Array.isArray(toolCalls) && toolCalls.length > 0,
  toolCallsCount: Array.isArray(toolCalls) ? toolCalls.length : 0,
  contentEmpty: !content || content.trim() === '',
  contentSnippet: content ? content.slice(0, 200) : null,
};

console.log('VERDICT:');
console.log(JSON.stringify(verdict, null, 2));
console.log();

if (verdict.hasToolCalls) {
  console.log('✓ NATIVE TOOL CALLING WORKS via 0G Compute.');
  console.log('  → SKILL.md MVP can use OpenAI tools schema directly.');
  console.log('  → MCP integration in Phase 3 is a clean shim.');
} else if (verdict.ok) {
  console.log('✗ Tools were NOT called. Model returned plain text.');
  console.log('  Possible causes: broker strips `tools`, model not tool-trained, or prompt insufficient.');
  console.log('  → Fallback plan: text-tagged tool dispatch in our orchestrator.');
} else {
  console.log('✗ HTTP error. Tool-calling status undetermined.');
}

const outPath = path.join(__dirname, `results-${Date.now()}.json`);
fs.writeFileSync(outPath, JSON.stringify({ requestBody, status: r.status, latencyMs, response: data, verdict }, null, 2));
console.log(`\nFull dump: ${outPath}`);
