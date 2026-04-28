// setup.js — one-time setup for the 0G Compute hello world.
//
// What it does:
//   1. Loads .env (PRIVATE_KEY + RPC).
//   2. Creates the broker for that wallet.
//   3. Checks the on-chain ledger balance. If 0, deposits a small amount.
//   4. Lists available inference services and prints them.
//   5. Picks the first chatbot-style service and saves its provider address
//      to .selected-provider.json so server.js can use it.
//
// Run once:  npm run setup
// Re-run any time you want to re-pick a provider or top up the balance.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hand-rolled .env loader (no dep)
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

if (!PRIVATE_KEY || PRIVATE_KEY === '0x' || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  console.error('ERROR: PRIVATE_KEY missing or malformed in .env');
  console.error('Generate a throwaway one with:');
  console.error('  node -e "console.log(\'0x\' + require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log(`Wallet:    ${wallet.address}`);
console.log(`RPC:       ${RPC_URL}`);

const ogBalance = await provider.getBalance(wallet.address);
console.log(`OG balance: ${ethers.formatEther(ogBalance)} OG`);

if (ogBalance === 0n) {
  console.error('\nERROR: this wallet has 0 OG tokens. Fund it from the faucet first:');
  console.error('  https://faucet.0g.ai  (or the faucet linked at https://docs.0g.ai)');
  console.error(`  Address to fund: ${wallet.address}`);
  console.error('Once it shows a balance > 0, re-run: npm run setup');
  process.exit(1);
}

console.log('\nCreating broker...');
const broker = await createZGComputeNetworkBroker(wallet);

console.log('Checking ledger balance...');
let ledger;
try {
  ledger = await broker.ledger.getLedger();
  console.log(`Ledger balance: ${ledger.balance ?? '(unknown shape)'}`);
} catch (e) {
  console.log(`Ledger empty or not yet created (${e.shortMessage || e.message})`);
}

const ledgerEmpty = !ledger || ledger.balance === 0n || ledger.balance === '0';
if (ledgerEmpty) {
  // First-time ledger creation: 0G contract requires a minimum of 3 OG.
  // After that, you can top up with any amount.
  console.log('\nNo ledger yet. Creating one with 3 OG (contract minimum for first deposit)...');
  await broker.ledger.depositFund(3);
  console.log('Ledger created.');
} else {
  console.log('Ledger already exists, skipping deposit.');
}

console.log('\nListing inference services...');
const services = await broker.inference.listService();
console.log(`Found ${services.length} services.`);
for (const s of services) {
  console.log(`  provider=${s.provider}  model=${s.model || '?'}  type=${s.serviceType || '?'}  url=${s.url || '?'}`);
}

if (services.length === 0) {
  console.error('No inference services available. Try later.');
  process.exit(1);
}

// Pick the first service that looks like a chatbot — fall back to the first one.
const chatbot =
  services.find((s) => /chat|gpt|llm|qwen|deepseek|llama|glm/i.test(`${s.model || ''} ${s.serviceType || ''}`)) ||
  services[0];

const out = {
  provider: chatbot.provider,
  model: chatbot.model,
  serviceType: chatbot.serviceType,
  selectedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(__dirname, '.selected-provider.json'), JSON.stringify(out, null, 2));
console.log(`\nSelected provider saved to .selected-provider.json:\n${JSON.stringify(out, null, 2)}`);
console.log('\nNow run:  npm start');
