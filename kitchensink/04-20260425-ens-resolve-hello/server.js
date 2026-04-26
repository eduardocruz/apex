// server.js — tiny ENS resolver hello world.
//
// Two endpoints:
//   POST /api/forward   { name }     -> { address, avatar, ...textRecords }
//   POST /api/reverse   { address }  -> { name }
//
// Reads RPC URL from .env (ETH_RPC_URL). Defaults to https://eth.drpc.org.
// No signing. No writes. No deps beyond viem.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, http as viemHttp, isAddress } from 'viem';
import { normalize } from 'viem/ens';
import { mainnet } from 'viem/chains';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env loader (no dep)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
} catch {}

const RPC_URL = process.env.ETH_RPC_URL || 'https://eth.drpc.org';
const PORT = Number(process.env.PORT) || 5757;

const client = createPublicClient({ chain: mainnet, transport: viemHttp(RPC_URL) });

// Text records the standard ENS resolver supports — we ask for the popular ones.
const TEXT_KEYS = ['avatar', 'description', 'url', 'com.twitter', 'com.github', 'email'];

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
  });
}

async function forward(name) {
  const normalized = normalize(name);
  const address = await client.getEnsAddress({ name: normalized });
  if (!address) return { name: normalized, address: null, note: 'no resolver / no address record' };
  const records = {};
  await Promise.all(
    TEXT_KEYS.map(async (key) => {
      try {
        const value = await client.getEnsText({ name: normalized, key });
        if (value) records[key] = value;
      } catch {}
    })
  );
  return { name: normalized, address, records };
}

async function reverse(address) {
  if (!isAddress(address)) throw new Error('not a valid 0x address');
  const name = await client.getEnsName({ address });
  return { address, name: name || null };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return;
  }

  if (req.method !== 'POST') { res.writeHead(404); res.end('{}'); return; }

  try {
    const body = await readBody(req);
    if (req.url === '/api/forward') {
      const out = await forward(String(body.name || ''));
      res.writeHead(200); res.end(JSON.stringify(out, null, 2));
    } else if (req.url === '/api/reverse') {
      const out = await reverse(String(body.address || ''));
      res.writeHead(200); res.end(JSON.stringify(out, null, 2));
    } else {
      res.writeHead(404); res.end('{}');
    }
  } catch (err) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`ENS resolver hello world: http://localhost:${PORT}`);
  console.log(`RPC: ${RPC_URL}`);
});
