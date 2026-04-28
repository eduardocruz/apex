// Twin onboarding server.
// Serves index.html and persists minted twins to ../../citizens/<ens>/.
// On mint:
//   1. Generate a fresh secp256k1 wallet for the twin (stored locally,
//      gitignored — Day 3 will prompt the human owner's wallet to sign
//      ERC-7857 mint instead).
//   2. Write SOUL.md, ROLE.md, traits.json, agentic-id.json, ledger.json,
//      wallet.json to citizens/<slug>/.
//   3. Register `<slug>.apex-ns.eth` via Namestone (off-chain ENS subname,
//      ENS sponsor partner, free). Text records: role, traits, voice,
//      parental_advice_weight, soul_status. Address: the twin's wallet.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Wallet } from 'ethers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const CITIZENS_DIR = path.join(REPO_ROOT, 'phase2', 'citizens');
const PORT = Number(process.env.PORT) || 5858;

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

const NAMESTONE_API_KEY = process.env.NAMESTONE_API_KEY || '';
const APEX_PARENT_ENS = process.env.APEX_PARENT_ENS || 'apex-ns.eth';
const NAMESTONE_ENDPOINT = 'https://namestone.com/api/public_v1/set-name';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

async function registerSubname({ slug, address, role, traits, voice, parentalAdviceWeight }) {
  if (!NAMESTONE_API_KEY) {
    return { skipped: true, reason: 'NAMESTONE_API_KEY not set in .env' };
  }
  const body = {
    domain: APEX_PARENT_ENS,
    name: slug,
    address,
    text_records: {
      'apex.role': role,
      'apex.traits': JSON.stringify(traits),
      'apex.voice': voice.join(','),
      'apex.parental_advice_weight': String(parentalAdviceWeight),
      'apex.soul_status': 'local-only-mock; cipher hash pending 0G Storage',
      'description': `Apex citizen — ${role} — voice: ${voice.join(', ')}`,
    },
  };
  try {
    const r = await fetch(NAMESTONE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': NAMESTONE_API_KEY },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
    if (!r.ok) return { ok: false, status: r.status, response: json };
    return { ok: true, status: r.status, response: json, fullName: `${slug}.${APEX_PARENT_ENS}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function safeMint(payload) {
  const { ensName, role, traits, voice, parentalAdviceWeight, soulMd, traitsJson, agenticIdJson } = payload;
  if (!ensName || !role || !traits || !soulMd) {
    return { ok: false, error: 'missing fields' };
  }
  const slug = slugify(ensName);
  if (!slug) return { ok: false, error: 'invalid ens name' };

  const dir = path.join(CITIZENS_DIR, slug);
  if (fs.existsSync(dir)) {
    return { ok: false, error: `citizen "${slug}" already exists`, dir: path.relative(REPO_ROOT, dir) };
  }
  fs.mkdirSync(dir, { recursive: true });

  // 1. Generate twin wallet
  const wallet = Wallet.createRandom();
  const twinAddress = wallet.address;

  // 2. Update agentic-id.json with real address + parent ens
  const fullEns = `${slug}.${APEX_PARENT_ENS}`;
  const idDoc = {
    ...agenticIdJson,
    ensName: fullEns,
    twinAddress,
  };

  // 3. Persist files
  fs.writeFileSync(path.join(dir, 'SOUL.md'), soulMd);
  fs.writeFileSync(path.join(dir, 'traits.json'), JSON.stringify(traitsJson, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'agentic-id.json'), JSON.stringify(idDoc, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'ROLE.md'), `# Role: ${role}\n\nSee \`phase2/citizen/SCHEMA.md\` for role definitions.\nOperational instructions for "${role}" land here when Day 5 ships per-role behavior.\n`);
  fs.writeFileSync(path.join(dir, 'ledger.json'), JSON.stringify({
    ens: fullEns,
    role,
    balance_og: 0,
    runway_actions: 0,
    actions: [],
    minted_at: new Date().toISOString(),
    status: 'local-only-mock',
  }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'wallet.json'), JSON.stringify({
    address: twinAddress,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || null,
    _warning: 'Plaintext for hackathon. Day 3 moves this into a TEE / encrypted store.',
  }, null, 2) + '\n', { mode: 0o600 });

  // 4. Register Namestone subname
  const namestone = await registerSubname({
    slug, address: twinAddress, role, traits, voice, parentalAdviceWeight,
  });

  return {
    ok: true,
    slug,
    dir: path.relative(REPO_ROOT, dir),
    ens: fullEns,
    twinAddress,
    files: ['SOUL.md', 'ROLE.md', 'traits.json', 'agentic-id.json', 'ledger.json', 'wallet.json'],
    namestone,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
      return;
    }

    if (req.method === 'GET' && req.url === '/api/citizens') {
      const list = fs.existsSync(CITIZENS_DIR)
        ? fs.readdirSync(CITIZENS_DIR).filter(n => !n.startsWith('.') && fs.statSync(path.join(CITIZENS_DIR, n)).isDirectory())
        : [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ count: list.length, citizens: list, parent: APEX_PARENT_ENS, namestone_configured: !!NAMESTONE_API_KEY }));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/mint') {
      const body = await readBody(req);
      const result = await safeMint(body);
      res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result, null, 2));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end('{}');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Twin onboarding: http://localhost:${PORT}`);
  console.log(`Citizens dir:    ${path.relative(REPO_ROOT, CITIZENS_DIR)}/`);
  console.log(`Parent ENS:      ${APEX_PARENT_ENS}`);
  console.log(`Namestone:       ${NAMESTONE_API_KEY ? 'configured' : 'NOT CONFIGURED — subnames will be skipped'}`);
});
