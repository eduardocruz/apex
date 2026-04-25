# 02 — Uniswap v4 pool state

**Date:** 2026-04-25
**Goal:** Show the `v4-sdk-integration` skill doing something concrete:
read a Uniswap v4 pool's state directly from the StateView contract on
Ethereum mainnet, and display price, tick, liquidity, fee tier, and
protocol/lp fees.

**Why this matters:** kitchensink/01 used the Trading API — a hosted
abstraction. This one talks to the chain itself, exercising viem's
read paths against v4 contracts. It's the foundation for any project
that needs to *observe* pool state (LP dashboards, monitoring agents,
hook testing, price oracles) rather than route a trade through the API.

## What's in here

```
server.js       Node http server (~150 lines). Loads .env, serves index.html,
                exposes POST /api/pool. Uses viem to read StateView via JSON-RPC.
                Computes poolId manually with viem's encodeAbiParameters +
                keccak256 (matches v4-core/PoolIdLibrary.toId byte-for-byte).
index.html      Vanilla HTML/CSS/JS form with 4 preset pool configs + custom inputs.
                Renders price (both directions), tick, fees, liquidity, raw response.
.env.example    ETH_RPC_URL (defaults to https://eth.llamarpc.com if unset)
package.json    One dep: viem.
```

> **Note on the SDK detour:** the original plan used `@uniswap/v4-sdk`
> for `Pool.getPoolId()`, as the skill recommends. That package ships
> ESM with directory imports (`import './entities'` without
> `/index.js`), which Node's strict ESM resolver rejects with
> `ERR_UNSUPPORTED_DIR_IMPORT` in modern Node. Rather than switch the
> project to CommonJS or carry a transpilation step, we compute the
> poolId directly using viem. v4-core's `PoolIdLibrary.toId` is
> `keccak256` over the in-memory layout of a `PoolKey` struct (5 slots
> of 32 bytes each); for these fixed-size types the bytes are identical
> to `abi.encode` of the tuple, so the result matches what the SDK
> would produce. Verified: the live ETH/USDC 0.05% pool returned a
> `sqrtPriceX96 != 0` and a sensible price.

## Run it

```bash
cd kitchensink/02-20260425-uniswap-v4-pool-state
npm install                       # one dep: viem
npm start                         # then open http://localhost:3000
```

`.env` is optional — without it, the server uses `https://eth.drpc.org`
(reliable free public RPC). If you hit rate limits, copy `.env.example`
to `.env` and add a key from Alchemy/Infura/drpc.

**RPC gotcha worth knowing:** while building this we initially used
`https://eth.llamarpc.com` and saw every preset come back as
"uninitialized." It wasn't — llamarpc was returning all-zero responses
silently (no error, just zeros) under load. Switching to drpc fixed it
instantly. Public RPCs are best-effort; for any read that affects
business logic, route through a paid endpoint with health checks.

## What it shows

For each pool config:
- **Initialized?** If the pool has never been used (`sqrtPriceX96 == 0`),
  surfaces that as a warning. Pool configs that nobody created yet are
  legal but empty.
- **Price both ways:** `1 ETH = 2,316 USDC` and `1 USDC = 0.000432 ETH`.
- **Current tick:** the price-bucket index where the pool currently sits.
- **Liquidity:** total active concentrated liquidity at the current tick.
- **Fee tier:** in bps and percentage.
- **Protocol fee + LP fee:** v4 adds dynamic fees on top of the static
  fee — these are the current values.
- **Pool ID:** the keccak256 of the pool's 5 identifying params.
- **Raw response:** full JSON from the server.

## Presets

- ETH / USDC — 0.05% (fee=500, tickSpacing=10)
- ETH / USDC — 0.30% (fee=3000, tickSpacing=60)
- ETH / USDT — 0.05% (fee=500, tickSpacing=10)
- USDC / USDT — 0.01% (fee=100, tickSpacing=1)

If a preset returns "uninitialized", it just means nobody has used that
specific pool config yet — the StateView still answers cleanly with
zeros. Swap presets to find one that is initialized.

## Differences vs kitchensink/01

| /01 (Trading API) | /02 (v4 SDK + StateView)               |
| ----------------- | -------------------------------------- |
| `POST /quote`     | direct contract read (`getSlot0`, `getLiquidity`) |
| Hosted abstraction | Onchain primary source                |
| Price + route + gas | Price + liquidity + tick + fees      |
| Returns "what swap would cost" | Returns "what the pool *is*" |
| One API key       | Public RPC (rate-limited)             |
| Zero npm deps     | One npm dep (viem)                    |

Both are valid integration paths. /01 is right when you want a swap
quote. /02 is right when you want to observe pool state.

## Strict v4 conventions enforced

- `currency0 < currency1` by address — preset presets observe this
  (ETH `0x000…000` always sorts before any ERC20).
- PoolId computed via `keccak256(abi.encode(PoolKey))` — matches what
  `Pool.getPoolId()` from the SDK would produce, byte-for-byte. See
  the SDK detour note above for why we don't use the SDK directly.
- Native ETH represented by zero address (v4 supports native, no WETH
  wrap needed). The form shows a hint when the address resolves to
  `0x0…0`.
- Hooks default to `0x000…000` (no hook). Pools with hooks are
  different pool IDs.

## Decision impact

`v4-sdk-integration` skill: covered. Together with /01 (Trading API
quote UI), the full Trading-API-vs-SDK contrast is now demonstrable.
The Uniswap track of the hackathon is reachable. Status of the 3
skills the plugin ships:

- ✅ `swap-integration` — Trading API quote UI (kitchensink/01)
- ✅ `v4-sdk-integration` — direct chain read UI (this folder)
- ⏳ `pay-with-any-token` — depends on Tempo CLI infra (see `_drafts/`)

## Feedback

(See FEEDBACK.md at repo root for accumulated entries.)
