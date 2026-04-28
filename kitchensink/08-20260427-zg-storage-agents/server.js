// server.js — Phase 1: agents stored as immutable bundles on 0G Storage.
//
// STATUS (2026-04-28): code matches official 0G SDK docs but upload
// currently fails against the Galileo testnet — TCP block from BR
// residential ISP, contract revert from a clean GCP route. See README
// "Current state" + FEEDBACK-0g.md. Compute (server-prompted chat
// against a loaded agent) works the moment a valid manifestHash is in
// hand, so the round-trip is unblocked as soon as Storage is healthy.
//
// Concept:
//   An agent = AGENTS.md + SOUL.md, plus a manifest.json that points to both.
//   The manifest's rootHash IS the agent's stable identity. Anyone with the
//   hash can resolve the agent's full definition by fetching three files
//   from 0G Storage. Talking to the agent = build system prompt from those
//   files + send to 0G Compute.
//
// Endpoints:
//   GET  /                         -> index.html
//   GET  /api/info                 -> wallet, balance, compute target, indexer
//   GET  /api/templates            -> AGENTS.md.tpl + SOUL.md.tpl as plain text
//   POST /api/agents/save          -> { agentsMd, soulMd } -> { manifestHash, agentsHash, soulHash }
//   GET  /api/agents/:manifestHash -> { manifest, agentsMd, soulMd, parsed }
//   POST /api/agents/:manifestHash/chat -> { message, history? } -> { reply, model, latencyMs }
//
// Storage shape (v1, simple):
//   agents.md       (raw bytes)            -> agentsHash
//   soul.md         (raw bytes)            -> soulHash
//   manifest.json   {agents, soul, schema} -> manifestHash    <- THIS IS THE AGENT ID

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';
import { Indexer, MemData, ZgFile } from '@0glabs/0g-ts-sdk';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '.agent-cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });

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

const RPC_URL     = process.env.ZG_RPC_URL     || 'https://evmrpc-testnet.0g.ai';
const INDEXER_URL = process.env.ZG_INDEXER_URL || 'https://indexer-storage-testnet-turbo.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PORT        = Number(process.env.PORT) || 5858;

if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  console.error('PRIVATE_KEY missing in .env. Run `npm run setup` first.');
  process.exit(1);
}

const computeTargetPath = path.join(__dirname, '.compute-target.json');
if (!fs.existsSync(computeTargetPath)) {
  console.error('.compute-target.json missing. Run `npm run setup` first.');
  process.exit(1);
}
const computeTarget = JSON.parse(fs.readFileSync(computeTargetPath, 'utf8'));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
const indexer  = new Indexer(INDEXER_URL);
// Default in open-jsonrpc-provider is 30s — too short for testnet uploads
// (segment publish + on-chain commit can run 60-90s). Bump to 3 minutes.
indexer.timeout = 180000;
const broker   = await createZGComputeNetworkBroker(wallet);

console.log(`Wallet:           ${wallet.address}`);
console.log(`Indexer:          ${INDEXER_URL}`);
console.log(`Compute provider: ${computeTarget.computeProvider}  (${computeTarget.computeModel})`);

// -------- helpers

async function uploadBytes(bytes, label) {
  // Write to a temp file, upload via ZgFile, return rootHash.
  const tmp = path.join(os.tmpdir(), `zg-${Date.now()}-${Math.random().toString(36).slice(2)}-${label}`);
  fs.writeFileSync(tmp, bytes);
  try {
    const file = await ZgFile.fromFilePath(tmp);
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr) throw new Error(`merkleTree(${label}): ${treeErr.message || treeErr}`);
    const rootHash = tree.rootHash();
    const [tx, uploadErr] = await indexer.upload(file, RPC_URL, wallet);
    if (uploadErr && !/already exists|root hash already exists/i.test(String(uploadErr))) {
      throw new Error(`upload(${label}): ${uploadErr.message || uploadErr}`);
    }
    await file.close();
    return { rootHash, txHash: tx?.txHash };
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

async function downloadBytes(rootHash) {
  // Cache by hash so retries are cheap.
  const cached = path.join(CACHE_DIR, rootHash.replace(/^0x/, ''));
  if (!fs.existsSync(cached)) {
    const err = await indexer.download(rootHash, cached, /*verify=*/true);
    if (err) throw new Error(`download(${rootHash}): ${err.message || err}`);
  }
  return fs.readFileSync(cached);
}

async function chatWithAgent({ agentsMd, soulMd, message, history }) {
  const agentBody = matter(agentsMd).content.trim();
  const soulBody  = matter(soulMd).content.trim();

  const systemPrompt = [
    '# Who you are (SOUL)',
    soulBody,
    '',
    '# How you operate (AGENTS)',
    agentBody,
  ].join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history : []),
    { role: 'user', content: message },
  ];

  const { endpoint, model } = await broker.inference.getServiceMetadata(computeTarget.computeProvider);
  const headers = await broker.inference.getRequestHeaders(computeTarget.computeProvider);

  const t0 = Date.now();
  const r = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ model, messages }),
  });
  const latencyMs = Date.now() - t0;
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`provider returned ${r.status}: ${text}`);
  }
  const data = await r.json();
  return {
    reply: data.choices?.[0]?.message?.content ?? '(empty)',
    model,
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

function readTemplate(name) {
  return fs.readFileSync(path.join(__dirname, 'templates', name), 'utf8');
}

// -------- HTTP

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/info') {
      const ogBalance = await provider.getBalance(wallet.address);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        wallet: wallet.address,
        rpcUrl: RPC_URL,
        indexerUrl: INDEXER_URL,
        ogBalance: ethers.formatEther(ogBalance),
        compute: computeTarget,
      }, null, 2));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/templates') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        agentsMd: readTemplate('AGENTS.md.tpl'),
        soulMd: readTemplate('SOUL.md.tpl'),
      }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/agents/save') {
      const { agentsMd, soulMd } = await readBody(req);
      if (!agentsMd || !soulMd) throw new Error('agentsMd and soulMd are required');

      // Validate frontmatter parses cleanly so the agent is loadable later.
      try { matter(agentsMd); } catch (e) { throw new Error(`AGENTS.md frontmatter invalid: ${e.message}`); }
      try { matter(soulMd); }   catch (e) { throw new Error(`SOUL.md frontmatter invalid: ${e.message}`); }

      const agentsBytes = new TextEncoder().encode(agentsMd);
      const soulBytes   = new TextEncoder().encode(soulMd);

      const agentsRes = await uploadBytes(agentsBytes, 'AGENTS.md');
      const soulRes   = await uploadBytes(soulBytes, 'SOUL.md');

      const manifest = {
        schema: 'agentcompanies/v1',
        kind: 'agent-bundle',
        files: { 'AGENTS.md': agentsRes.rootHash, 'SOUL.md': soulRes.rootHash },
        savedAt: new Date().toISOString(),
        savedBy: wallet.address,
      };
      const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest, null, 2));
      const manifestRes = await uploadBytes(manifestBytes, 'manifest.json');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        manifestHash: manifestRes.rootHash,
        agentsHash:   agentsRes.rootHash,
        soulHash:     soulRes.rootHash,
        txHashes: {
          manifest: manifestRes.txHash,
          agents:   agentsRes.txHash,
          soul:     soulRes.txHash,
        },
        manifest,
      }, null, 2));
      return;
    }

    const agentMatch = url.pathname.match(/^\/api\/agents\/(0x[0-9a-fA-F]+)(?:\/(\w+))?$/);
    if (agentMatch && req.method === 'GET' && !agentMatch[2]) {
      const manifestHash = agentMatch[1];
      const manifestBytes = await downloadBytes(manifestHash);
      const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
      const agentsBytes = await downloadBytes(manifest.files['AGENTS.md']);
      const soulBytes   = await downloadBytes(manifest.files['SOUL.md']);
      const agentsMd = new TextDecoder().decode(agentsBytes);
      const soulMd   = new TextDecoder().decode(soulBytes);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        manifest,
        agentsMd,
        soulMd,
        parsed: {
          agents: matter(agentsMd).data,
          soul:   matter(soulMd).data,
        },
      }));
      return;
    }

    if (agentMatch && req.method === 'POST' && agentMatch[2] === 'chat') {
      const manifestHash = agentMatch[1];
      const { message, history } = await readBody(req);
      if (!message) throw new Error('message is required');
      const manifestBytes = await downloadBytes(manifestHash);
      const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
      const agentsBytes = await downloadBytes(manifest.files['AGENTS.md']);
      const soulBytes   = await downloadBytes(manifest.files['SOUL.md']);
      const agentsMd = new TextDecoder().decode(agentsBytes);
      const soulMd   = new TextDecoder().decode(soulBytes);
      const out = await chatWithAgent({ agentsMd, soulMd, message, history });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ...out,
        agent: { manifestHash, name: matter(agentsMd).data.name },
      }));
      return;
    }

    res.writeHead(404);
    res.end('{}');
  } catch (err) {
    console.error('handler error:', err);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.shortMessage || err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Agent storage UI: http://localhost:${PORT}`);
});
