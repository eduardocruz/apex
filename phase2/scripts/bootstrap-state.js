// Bootstrap the network-state treasury.
//
// Generates a single secp256k1 wallet for the state treasury, registers
// `treasury.state.apex-ns.eth` on Namestone pointing to it, persists
// state files locally. Idempotent — skips if treasury wallet exists.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Wallet } from 'ethers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(REPO_ROOT, 'phase2', 'state');
const TREASURY_DIR = path.join(STATE_DIR, 'treasury');

// Load .env from the onboarding/twin/.env (single source of truth for the parent ENS + API key)
const envPath = path.join(REPO_ROOT, 'phase2', 'onboarding', 'twin', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

const NAMESTONE_API_KEY = process.env.NAMESTONE_API_KEY;
const APEX_PARENT_ENS = process.env.APEX_PARENT_ENS || 'apex-ns.eth';
const STATE_NAMESPACE = 'state';

if (!NAMESTONE_API_KEY) {
  console.error('NAMESTONE_API_KEY missing. Set it in phase2/onboarding/twin/.env first.');
  process.exit(1);
}

async function ensureTreasury() {
  fs.mkdirSync(TREASURY_DIR, { recursive: true });
  const walletPath = path.join(TREASURY_DIR, 'wallet.json');

  let wallet;
  if (fs.existsSync(walletPath)) {
    const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    wallet = new Wallet(data.privateKey);
    console.log(`Treasury wallet already exists: ${wallet.address}`);
  } else {
    wallet = Wallet.createRandom();
    fs.writeFileSync(walletPath, JSON.stringify({
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || null,
      _warning: 'Plaintext provisional EOA. Migrates to Safe post-constitution. See STATE.md.',
    }, null, 2) + '\n', { mode: 0o600 });
    console.log(`Generated treasury wallet: ${wallet.address}`);
  }

  // Persist treasury state file (public — checked into git)
  const ensName = `treasury.${STATE_NAMESPACE}.${APEX_PARENT_ENS}`;
  const statePath = path.join(TREASURY_DIR, 'treasury.json');
  const state = {
    ens: ensName,
    address: wallet.address,
    type: 'EOA-provisional',
    purpose: 'public-goods treasury — receives 15% of audit fees, 100% of heartbeat tax, all reactivation fees',
    governance: 'Provisional Rules until Constitution Article II §3 ratifies; then Safe multisig per Article V',
    inflows: [],
    outflows: [],
    balance_og: 0,
    created_at: fs.existsSync(statePath)
      ? JSON.parse(fs.readFileSync(statePath, 'utf8')).created_at
      : new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');

  // Register Namestone subname
  const r = await fetch('https://namestone.com/api/public_v1/set-name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': NAMESTONE_API_KEY },
    body: JSON.stringify({
      domain: APEX_PARENT_ENS,
      name: `treasury.${STATE_NAMESPACE}`,
      address: wallet.address,
      text_records: {
        'apex.kind': 'state-treasury',
        'apex.governance': 'provisional-eoa-pending-constitution',
        'apex.inflows': '15% audit fees, 100% heartbeat tax, reactivation fees',
        'description': 'Apex Network State — public-goods treasury (provisional EOA, migrates to Safe post-constitution)',
      },
    }),
  });
  console.log(`Namestone register: ${r.status} ${await r.text()}`);
  console.log(`Treasury ENS:       ${ensName}`);
}

ensureTreasury().catch(e => { console.error(e); process.exit(1); });
