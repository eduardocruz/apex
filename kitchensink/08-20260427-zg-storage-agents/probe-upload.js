// One-shot 0G Storage upload probe.
// Re-runs the same call that's been failing to see if testnet unblocked.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

const RPC_URL = process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
const INDEXER_URL = process.env.ZG_INDEXER_URL || 'https://indexer-storage-testnet-turbo.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) { console.error('PRIVATE_KEY missing'); process.exit(1); }

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const indexer = new Indexer(INDEXER_URL);
if (indexer.providers?.[0]) indexer.providers[0].timeout = 180000;

console.log('Wallet:  ', wallet.address);
console.log('RPC:     ', RPC_URL);
console.log('Indexer: ', INDEXER_URL);

const balance = await provider.getBalance(wallet.address);
console.log('Balance: ', ethers.formatEther(balance), 'OG');

const tmp = path.join(__dirname, '.probe.txt');
fs.writeFileSync(tmp, `apex storage probe ${new Date().toISOString()}\n`);
const file = await ZgFile.fromFilePath(tmp);
console.log('\nAttempting upload...');
const t0 = Date.now();
try {
  const [tx, err] = await indexer.upload(file, RPC_URL, wallet);
  const ms = Date.now() - t0;
  if (err && !/already exists|root hash already exists/i.test(String(err))) {
    console.error(`\n❌ FAILED after ${ms}ms`);
    console.error('Error:', err.message || err);
    process.exit(1);
  }
  const rootHash = (await file.merkleTree())[0]?.rootHash() ?? null;
  console.log(`\n✅ OK in ${ms}ms`);
  console.log('TxHash:  ', tx?.hash || tx);
  console.log('RootHash:', rootHash);
} catch (e) {
  const ms = Date.now() - t0;
  console.error(`\n❌ THREW after ${ms}ms`);
  console.error(e.shortMessage || e.message || e);
  if (e.info) console.error('info:', JSON.stringify(e.info, null, 2));
  process.exit(1);
} finally {
  await file.close?.();
  fs.unlinkSync(tmp);
}
