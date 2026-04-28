// server.js — the agent. Receives "oi" via HTTP, sends to a 0G Compute
// provider, returns the LLM's reply. Nothing runs locally; the GPU lives
// somewhere on the 0G Compute network.
//
// Endpoints:
//   GET  /             -> serves index.html
//   GET  /api/info     -> shows wallet, model, provider, balances
//   POST /api/chat     -> { message, history? } -> { reply, model, provider, latencyMs }

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env loader
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
} catch {}

const RPC_URL = process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PORT = Number(process.env.PORT) || 5757;

if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  console.error('PRIVATE_KEY missing in .env. Run npm run setup first.');
  process.exit(1);
}

const selectedPath = path.join(__dirname, '.selected-provider.json');
if (!fs.existsSync(selectedPath)) {
  console.error('.selected-provider.json missing. Run npm run setup first.');
  process.exit(1);
}
const selected = JSON.parse(fs.readFileSync(selectedPath, 'utf8'));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const broker = await createZGComputeNetworkBroker(wallet);

console.log(`Wallet:   ${wallet.address}`);
console.log(`Provider: ${selected.provider}`);
console.log(`Model:    ${selected.model}`);

async function chatCompletion(message, history = []) {
  const { endpoint, model } = await broker.inference.getServiceMetadata(selected.provider);
  const headers = await broker.inference.getRequestHeaders(selected.provider);
  const messages = [...history, { role: 'user', content: message }];

  const t0 = Date.now();
  const r = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ messages, model }),
  });
  const latencyMs = Date.now() - t0;
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`provider returned ${r.status}: ${text}`);
  }
  const data = await r.json();
  return {
    reply: data.choices?.[0]?.message?.content ?? '(no content)',
    model,
    endpoint,
    latencyMs,
  };
}

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
      let ledger = null;
      try { ledger = await broker.ledger.getLedger(); } catch {}
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        wallet: wallet.address,
        rpcUrl: RPC_URL,
        ogBalance: ethers.formatEther(ogBalance),
        ledger: ledger ? { balance: ledger.balance?.toString?.() ?? ledger.balance } : null,
        provider: selected.provider,
        model: selected.model,
        selectedAt: selected.selectedAt,
      }, null, 2));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
      const { message, history } = await readBody(req);
      if (!message || typeof message !== 'string') throw new Error('message is required');
      const out = await chatCompletion(message, Array.isArray(history) ? history : []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(out));
      return;
    }

    res.writeHead(404);
    res.end('{}');
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.shortMessage || err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Agent UI: http://localhost:${PORT}`);
});
