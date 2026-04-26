// server.js — read-only explorer for the 0G Galileo Testnet AgenticID (ERC-7857)
// registry contract.
//
// Endpoints:
//   GET  /              -> serves index.html
//   GET  /api/summary   -> totalSupply, name, symbol, mintFee, contract address
//   POST /api/token     { tokenId } -> { tokenId, owner, tokenURI,
//                                        intelligentDatas[], cloneSource,
//                                        tokenCreator, isClone }
//
// No wallet, no signing, no testnet tokens needed. Pure chain reads via viem
// against https://evmrpc-testnet.0g.ai (chain ID 16602, "Galileo Testnet").

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, http as viemHttp, defineChain } from 'viem';

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

const RPC_URL = process.env.ZG_RPC_URL || 'https://evmrpc-testnet.0g.ai';
const PORT = Number(process.env.PORT) || 5858;

// AgenticID contract on 0G Galileo Testnet (per
// github.com/0gfoundation/agenticID-examples readme).
const CONTRACT = '0x2700F6A3e505402C9daB154C5c6ab9cAEC98EF1F';

const zgGalileo = defineChain({
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

// Minimal ABI — only the read-only views we need.
const abi = [
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'mintFee', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'creator', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'ownerOf', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'tokenURI', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'tokenCreator', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'cloneSource', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  {
    type: 'function',
    name: 'getIntelligentDatas',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{
      type: 'tuple[]',
      components: [
        { name: 'dataDescription', type: 'string' },
        { name: 'dataHash', type: 'bytes32' },
      ],
    }],
  },
];

const client = createPublicClient({ chain: zgGalileo, transport: viemHttp(RPC_URL) });

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

async function getSummary() {
  const [name, symbol, totalSupply, mintFee, creator] = await Promise.all([
    client.readContract({ address: CONTRACT, abi, functionName: 'name' }),
    client.readContract({ address: CONTRACT, abi, functionName: 'symbol' }),
    client.readContract({ address: CONTRACT, abi, functionName: 'totalSupply' }),
    client.readContract({ address: CONTRACT, abi, functionName: 'mintFee' }).catch(() => null),
    client.readContract({ address: CONTRACT, abi, functionName: 'creator' }).catch(() => null),
  ]);
  return {
    contract: CONTRACT,
    chainId: 16602,
    chainName: '0G Galileo Testnet',
    rpcUrl: RPC_URL,
    name,
    symbol,
    totalSupply: totalSupply.toString(),
    mintFeeWei: mintFee == null ? null : mintFee.toString(),
    mintFeeOG: mintFee == null ? null : (Number(mintFee) / 1e18).toString(),
    creator,
  };
}

async function getToken(tokenIdRaw) {
  const tokenId = BigInt(tokenIdRaw);
  const [owner, tokenURI, tokenCreator, cloneSource, intelligentDatasRaw] = await Promise.all([
    client.readContract({ address: CONTRACT, abi, functionName: 'ownerOf', args: [tokenId] }),
    client.readContract({ address: CONTRACT, abi, functionName: 'tokenURI', args: [tokenId] }).catch((e) => `(reverted: ${e.shortMessage || e.message})`),
    client.readContract({ address: CONTRACT, abi, functionName: 'tokenCreator', args: [tokenId] }).catch(() => null),
    client.readContract({ address: CONTRACT, abi, functionName: 'cloneSource', args: [tokenId] }).catch(() => 0n),
    client.readContract({ address: CONTRACT, abi, functionName: 'getIntelligentDatas', args: [tokenId] }).catch((e) => ({ error: e.shortMessage || e.message })),
  ]);
  const cloneSourceNum = typeof cloneSource === 'bigint' ? cloneSource : BigInt(cloneSource);
  return {
    tokenId: tokenId.toString(),
    owner,
    tokenURI: tokenURI === '' ? '(empty)' : tokenURI,
    tokenCreator,
    cloneSource: cloneSourceNum.toString(),
    isClone: cloneSourceNum !== 0n || tokenIdRaw === '0' ? cloneSourceNum !== 0n : false,
    intelligentDatas: Array.isArray(intelligentDatasRaw)
      ? intelligentDatasRaw.map((d) => ({ dataDescription: d.dataDescription, dataHash: d.dataHash }))
      : intelligentDatasRaw,
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return;
  }

  try {
    if (req.method === 'GET' && req.url === '/api/summary') {
      const out = await getSummary();
      res.writeHead(200); res.end(JSON.stringify(out, null, 2)); return;
    }
    if (req.method === 'POST' && req.url === '/api/token') {
      const body = await readBody(req);
      const id = String(body.tokenId ?? '0').trim();
      if (!/^\d+$/.test(id)) throw new Error('tokenId must be a non-negative integer');
      const out = await getToken(id);
      res.writeHead(200); res.end(JSON.stringify(out, null, 2)); return;
    }
    res.writeHead(404); res.end('{}');
  } catch (err) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: err.shortMessage || err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`0G iNFT explorer: http://localhost:${PORT}`);
  console.log(`Chain: 0G Galileo Testnet (16602)  RPC: ${RPC_URL}`);
  console.log(`Contract: ${CONTRACT}`);
});
