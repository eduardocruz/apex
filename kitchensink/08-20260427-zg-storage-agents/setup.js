// setup.js — sanity check before running the agent storage server.
//
// Verifies:
//   1. .env has a wallet with funds on 0G Galileo Testnet
//   2. The storage indexer is reachable
//   3. The compute broker initializes (so the agent can chat once loaded)
//
// Run once after copying .env from kitchensink/07 (or generating fresh).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';
import { Indexer } from '@0glabs/0g-ts-sdk';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const INDEXER_URL = process.env.ZG_INDEXER_URL || 'https://indexer-storage-testnet-turbo.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  console.error('ERROR: PRIVATE_KEY missing or malformed in .env.');
  console.error('Tip: cp ../07-20260425-agent-0g-compute-hello/.env .env (reuse the same wallet)');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log(`Wallet:    ${wallet.address}`);
console.log(`RPC:       ${RPC_URL}`);
console.log(`Indexer:   ${INDEXER_URL}`);

const ogBalance = await provider.getBalance(wallet.address);
console.log(`OG balance: ${ethers.formatEther(ogBalance)} OG`);

if (ogBalance === 0n) {
  console.error('\nERROR: wallet has 0 OG. Fund it via the faucet first:');
  console.error('  https://faucet.0g.ai');
  process.exit(1);
}

console.log('\nProbing storage indexer...');
const indexer = new Indexer(INDEXER_URL);
console.log('Indexer constructed (HTTP probe happens on first upload).');

console.log('\nProbing compute broker...');
const broker = await createZGComputeNetworkBroker(wallet);
const services = await broker.inference.listService();
console.log(`Compute providers online: ${services.length}`);
const chatbot = services.find((s) => s.serviceType === 'chatbot') || services[0];
if (!chatbot) {
  console.error('No chatbot provider available. Try later.');
  process.exit(1);
}
console.log(`Chatbot provider: ${chatbot.provider} (${chatbot.model})`);

const out = {
  computeProvider: chatbot.provider,
  computeModel: chatbot.model,
  preparedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(__dirname, '.compute-target.json'), JSON.stringify(out, null, 2));

console.log('\nReady. Now run:  npm start');
