import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, http, encodeAbiParameters, keccak256 } from 'viem';
import { mainnet } from 'viem/chains';

// PoolId computation matches v4-core/PoolIdLibrary.toId:
//   keccak256(memoryLayoutOfPoolKey)  // 5 slots * 32 bytes = 160 bytes
// For fixed-size fields (address, uint24, int24, address), in-memory layout
// is identical to abi.encode of the tuple — same bytes either way.
function computePoolId({ currency0, currency1, fee, tickSpacing, hooks }) {
  return keccak256(
    encodeAbiParameters(
      [{
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      }],
      [{ currency0, currency1, fee, tickSpacing, hooks }]
    )
  );
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- minimal .env loader (no dependency) ---
try {
  const envText = await readFile(join(__dirname, '.env'), 'utf8');
  for (const line of envText.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2];
  }
} catch {}

const PORT = Number(process.env.PORT || 3000);

// Ethereum mainnet v4 deployment.
// Source: https://developers.uniswap.org/contracts/v4/deployments
const STATE_VIEW = '0x7ffe42c4a5deea5b0fec41c94c136cf115597227';

const STATE_VIEW_ABI = [
  {
    name: 'getSlot0',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'bytes32' }],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'protocolFee', type: 'uint24' },
      { name: 'lpFee', type: 'uint24' },
    ],
  },
  {
    name: 'getLiquidity',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'bytes32' }],
    outputs: [{ name: 'liquidity', type: 'uint128' }],
  },
];

// Public RPC selection notes (tested 2026-04-25):
//   - viem default (cloudflare-eth): "Internal error" on eth_call to StateView.
//   - https://eth.llamarpc.com:      returns all-zero responses silently
//                                    (no error, looks like uninitialized pool — bad).
//   - https://rpc.ankr.com/eth:      requires an API key now (401).
//   - https://eth.drpc.org:          works for these queries. Default.
//   - https://1rpc.io/eth:           works.
//   - https://eth-pokt.nodies.app:   works.
// Override via ETH_RPC_URL env (Alchemy/Infura/drpc with key recommended for production).
const RPC_URL = process.env.ETH_RPC_URL || 'https://eth.drpc.org';

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

// Convert sqrtPriceX96 to a human-readable price (token1 per 1 token0).
// Adjusts for decimals so "1 ETH = X USDC" comes out right.
function humanPrice(sqrtPriceX96, dec0, dec1) {
  const Q192 = 2n ** 192n;
  // (sqrtPriceX96)^2 / 2^192 = raw token1 per raw token0
  // scale to 18 decimals to keep precision when converting BigInt -> Number
  const scaled = (sqrtPriceX96 * sqrtPriceX96 * 10n ** 18n) / Q192;
  const raw = Number(scaled) / 1e18;
  return raw * 10 ** (dec0 - dec1);
}

createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const html = await readFile(join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/pool') {
    const chunks = [];
    for await (const c of req) chunks.push(c);

    let payload;
    try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { return send(res, 400, { error: 'Invalid JSON' }); }

    const {
      token0, // { address, decimals, symbol }  use address '0x000...' for native ETH
      token1,
      fee,
      tickSpacing,
      hooks = '0x0000000000000000000000000000000000000000',
    } = payload;

    if (!token0 || !token1) return send(res, 400, { error: 'token0/token1 required' });

    try {
      const poolId = computePoolId({
        currency0: token0.address,
        currency1: token1.address,
        fee,
        tickSpacing,
        hooks,
      });

      const [slot0, liquidity] = await Promise.all([
        client.readContract({
          address: STATE_VIEW,
          abi: STATE_VIEW_ABI,
          functionName: 'getSlot0',
          args: [poolId],
        }),
        client.readContract({
          address: STATE_VIEW,
          abi: STATE_VIEW_ABI,
          functionName: 'getLiquidity',
          args: [poolId],
        }),
      ]);

      const [sqrtPriceX96, tick, protocolFee, lpFee] = slot0;

      // If pool was never initialized, sqrtPriceX96 will be 0n
      const initialized = sqrtPriceX96 !== 0n;
      const price = initialized
        ? humanPrice(sqrtPriceX96, token0.decimals, token1.decimals)
        : null;

      send(res, 200, {
        poolId,
        initialized,
        sqrtPriceX96: sqrtPriceX96.toString(),
        tick,
        protocolFee,
        lpFee,
        liquidity: liquidity.toString(),
        humanPrice: price, // token1 per 1 token0
        invertedPrice: price ? 1 / price : null, // token0 per 1 token1
      });
    } catch (err) {
      send(res, 500, { error: err.message, stack: err.stack });
    }
    return;
  }

  res.writeHead(404);
  res.end('not found');
}).listen(PORT, () => {
  console.log(`Uniswap v4 pool state UI → http://localhost:${PORT}`);
});

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}
