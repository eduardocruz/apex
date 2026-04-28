// server.js — full agent loop demo for 0G Compute tool calling.
//
// Endpoints:
//   GET  /             -> serves index.html
//   GET  /api/info     -> wallet, provider, model
//   POST /api/probe    -> { message } -> { turns:[...], finalAnswer, totalLatencyMs }
//
// What this proves:
//   The LLM never "calls" anything. It only emits structured requests
//   describing tool calls. WE — the server — execute the tools and feed
//   results back. The model then writes the human-friendly answer.
//
// Tools live HERE (`TOOL_IMPLEMENTATIONS` below). They're our code, not
// 0G's, not OpenAI's. In Phase 3 the implementations will be MCP servers
// — same protocol, different dispatcher.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

const RPC_URL = process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PORT = Number(process.env.PORT) || 5959;

if (!PRIVATE_KEY) { console.error('PRIVATE_KEY missing in .env'); process.exit(1); }
const selectedPath = path.join(__dirname, '.selected-provider.json');
if (!fs.existsSync(selectedPath)) {
  console.error('.selected-provider.json missing. Copy from /07 first.');
  process.exit(1);
}
const selected = JSON.parse(fs.readFileSync(selectedPath, 'utf8'));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const broker = await createZGComputeNetworkBroker(wallet);

console.log(`Wallet:   ${wallet.address}`);
console.log(`Provider: ${selected.provider}`);
console.log(`Model:    ${selected.model}\n`);

// -------- TOOLS

// Schemas: how we describe the tools to the model.
const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current temperature in Celsius and a one-word condition for a city. Returns { temperature_c: int, condition: string }.',
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

// Implementations: WE write these. The model never executes any code.
// `get_weather` hits Open-Meteo (free, no auth):
//   https://open-meteo.com/  — geocoding + forecast endpoints.
// Two calls per invocation: (1) resolve city → lat/lon, (2) fetch current weather.
// In Phase 3 (apex/phase2) the equivalent will be an MCP server hosted by the
// citizen's company — same dispatcher, different executor.

const WMO_CODES = {
  0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'fog', 48: 'depositing rime fog',
  51: 'light drizzle', 53: 'moderate drizzle', 55: 'dense drizzle',
  61: 'light rain', 63: 'moderate rain', 65: 'heavy rain',
  71: 'light snow', 73: 'moderate snow', 75: 'heavy snow',
  80: 'rain showers', 81: 'heavy rain showers', 82: 'violent rain showers',
  95: 'thunderstorm', 96: 'thunderstorm with hail', 99: 'severe thunderstorm',
};

const TOOL_IMPLEMENTATIONS = {
  get_weather: async ({ city }) => {
    if (!city || typeof city !== 'string') return { error: 'city is required' };

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoR = await fetch(geoUrl);
    if (!geoR.ok) return { error: `geocoding HTTP ${geoR.status}` };
    const geo = await geoR.json();
    const place = geo?.results?.[0];
    if (!place) return { error: `city not found: ${city}`, _source: 'open-meteo geocoding' };

    const fxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
    const fxR = await fetch(fxUrl);
    if (!fxR.ok) return { error: `forecast HTTP ${fxR.status}` };
    const fx = await fxR.json();
    const c = fx?.current;
    if (!c) return { error: 'no current weather in response' };

    return {
      city: place.name,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      temperature_c: c.temperature_2m,
      wind_speed_kmh: c.wind_speed_10m,
      condition: WMO_CODES[c.weather_code] ?? `unknown (wmo:${c.weather_code})`,
      observed_at: c.time,
      _source: 'open-meteo.com (live, no auth)',
    };
  },
};

async function dispatchTool(name, argsJson) {
  const impl = TOOL_IMPLEMENTATIONS[name];
  if (!impl) return { error: `unknown tool: ${name}` };
  let args;
  try { args = JSON.parse(argsJson); }
  catch (e) { return { error: `bad arguments JSON: ${e.message}` }; }
  try { return await impl(args); }
  catch (e) { return { error: e.message }; }
}

// -------- Agent loop

async function callOnce(messages) {
  const { endpoint, model } = await broker.inference.getServiceMetadata(selected.provider);
  const headers = await broker.inference.getRequestHeaders(selected.provider);

  const requestBody = { model, messages, tools: TOOL_SCHEMAS, tool_choice: 'auto' };
  const t0 = Date.now();
  const r = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(requestBody),
  });
  const latencyMs = Date.now() - t0;
  const text = await r.text();
  let response; try { response = JSON.parse(text); } catch { response = { _raw: text }; }
  return { requestBody, response, status: r.status, latencyMs };
}

const MAX_TURNS = 6;

async function runAgent(userMessage) {
  const turns = [];
  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant. When the user asks something that requires data ' +
        '(like the weather), call the appropriate tool. After the tool returns, ' +
        'use the result to write a short, friendly answer in plain English.',
    },
    { role: 'user', content: userMessage },
  ];

  for (let i = 0; i < MAX_TURNS; i++) {
    const { requestBody, response, status, latencyMs } = await callOnce(messages);
    const choice = response?.choices?.[0]?.message;
    const finish = response?.choices?.[0]?.finish_reason;

    turns.push({
      n: i + 1,
      kind: 'llm-call',
      status,
      latencyMs,
      finish_reason: finish,
      assistant: choice,
    });

    // If model emitted tool calls, execute each, push tool results, loop.
    if (Array.isArray(choice?.tool_calls) && choice.tool_calls.length > 0) {
      // Push the assistant message that requested tool calls (required by spec).
      messages.push(choice);

      for (const call of choice.tool_calls) {
        const result = await dispatchTool(call.function.name, call.function.arguments);
        const resultStr = JSON.stringify(result);
        turns.push({
          n: i + 1,
          kind: 'tool-dispatch',
          tool: call.function.name,
          arguments: call.function.arguments,
          result: resultStr,
          executedBy: 'server.js (TOOL_IMPLEMENTATIONS)',
        });
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: resultStr,
        });
      }
      continue;
    }

    // No tool calls — model gave its final answer. Done.
    return {
      turns,
      finalAnswer: choice?.content || '(empty)',
      finishReason: finish,
      totalTurns: turns.length,
    };
  }

  return {
    turns,
    finalAnswer: '(max turns reached without final answer)',
    finishReason: 'max_turns',
    totalTurns: turns.length,
  };
}

// -------- HTTP

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
      return;
    }

    if (req.method === 'GET' && req.url === '/api/info') {
      const ogBalance = await provider.getBalance(wallet.address);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        wallet: wallet.address,
        ogBalance: ethers.formatEther(ogBalance),
        provider: selected.provider,
        model: selected.model,
        toolsAvailable: TOOL_SCHEMAS.map(t => t.function.name),
        toolsImplementedBy: 'server.js — local hardcoded mocks; never the LLM',
      }, null, 2));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/probe') {
      const t0 = Date.now();
      const { message } = await readBody(req);
      const out = await runAgent(message || 'What is the weather in Recife right now?');
      out.totalLatencyMs = Date.now() - t0;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(out, null, 2));
      return;
    }

    res.writeHead(404);
    res.end('{}');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.shortMessage || err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Tool-calling demo: http://localhost:${PORT}`);
});
