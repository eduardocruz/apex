# 02 — Uniswap swap quote (hello world)

**Date:** 2026-04-25
**Goal:** Get the simplest possible Uniswap interaction working — a swap
**price quote** via Trading API. No wallet, no chain, no faucet. Just an
HTTP request that returns "X token A = Y token B at current rates."

**Why this:** simplest possible Uniswap touch. Calibrates the skill +
documents the API contract before we touch wallets, chains, or actual
swap execution. Also: a quote is the only thing the skill needs to
demonstrate the Trading API path. If quote works, swap simulation works,
swap execution works — they share the route.

## Plan

1. Invoke the `uniswap-trading:swap-integration` skill with a hello-world
   question
2. Capture exactly what API endpoint, headers, and payload it suggests
3. Run the actual HTTP call against Uniswap's hosted Trading API
4. Verify the response shape (price, route, gas estimate, etc)
5. Document for FEEDBACK.md and for kitchensink-03

## What I tried

_(filled in as we go)_

### Step 1 — Ask the skill

The `uniswap-trading:swap-integration` skill responded with a 600-line
manual. The simplest path is **Trading API** (vs Universal Router SDK
or smart contract). Concrete requirements for a quote:

- **Base URL:** `https://trade-api.gateway.uniswap.org/v1`
- **API key required** — register at developers.uniswap.org (instant)
- **Required headers:** `Content-Type: application/json`,
  `x-api-key: <key>`, `x-universal-router-version: 2.0`
- **Endpoint:** `POST /quote`
- **`swapper` field is mandatory** even for quote-only — needs a wallet
  address. Doesn't sign anything; address only.

Surprise findings:
- "No wallet for hello world" was half-true. No signing, but `swapper`
  address is required. Any valid address works (zero address, vitalik,
  whatever).
- Response shape branches by routing type — CLASSIC has
  `quote.output.amount`, UniswapX (DUTCH_V2/V3/PRIORITY) has
  `quote.orderInfo.outputs[0].startAmount`. The router decides which one
  to give you based on chain+pair, not on a flag in the request.
- Browser CORS is broken (`OPTIONS` returns 415). For terminal/curl
  hello world this is irrelevant; for any frontend it requires a proxy.

### Step 2 — Get the API key

Eduardo to register at https://developers.uniswap.org/ and capture the
key. Set as env var:

```bash
export UNISWAP_API_KEY="<your-key>"
```

### Step 3 — Run the quote

Hello-world target: 1 WETH → USDC on Ethereum mainnet, with the zero
address as `swapper` (read-only quote, no signing).

```bash
# Token addresses on Ethereum mainnet
WETH=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
USDC=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
ZERO_ADDR=0x0000000000000000000000000000000000000000

# 1 WETH = 1 * 10^18 wei
AMOUNT=1000000000000000000

curl -s -X POST https://trade-api.gateway.uniswap.org/v1/quote \
  -H "Content-Type: application/json" \
  -H "x-api-key: $UNISWAP_API_KEY" \
  -H "x-universal-router-version: 2.0" \
  -d "{
    \"swapper\": \"$ZERO_ADDR\",
    \"tokenIn\": \"$WETH\",
    \"tokenOut\": \"$USDC\",
    \"tokenInChainId\": \"1\",
    \"tokenOutChainId\": \"1\",
    \"amount\": \"$AMOUNT\",
    \"type\": \"EXACT_INPUT\",
    \"slippageTolerance\": 0.5,
    \"routingPreference\": \"BEST_PRICE\"
  }"
```

> Note `tokenInChainId` and `tokenOutChainId` are strings, not numbers
> (per skill warning).

### Step 4 — Inspect the response

Quote ran successfully on first try. Captured 2026-04-25:

| Field             | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Routing           | `CLASSIC` (Uniswap V3 AMM, not UniswapX)                           |
| 1 WETH →          | 2,317.89 USDC                                                      |
| Route             | 1 hop, direct WETH→USDC                                            |
| Pool              | `0xE0554a476A092703abdB3Ef35c80e0D76d32939F` (V3, fee tier 0.01%)  |
| Gas (estimated)   | $0.05 USD                                                          |
| Slippage          | 0.5% (as requested)                                                |
| Permit2 needed    | Yes — response includes EIP-712 typed data for Permit2 approval    |

A mild surprise: `BEST_PRICE` selected CLASSIC, not UniswapX, even though
WETH/USDC is the canonical UniswapX pair. The skill's docs warn that
"BEST_PRICE routing on Ethereum mainnet typically returns UniswapX
(DUTCH_V2)" — but for this size/timing the AMM beat the auction. Worth
remembering: routing decisions are dynamic.

The full response includes:
- `permitData` — EIP-712 typed data we'd sign to authorize Permit2 to
  move WETH on our behalf
- `quote.route[0][0]` — single pool detail (sqrtRatioX96, liquidity,
  tick, fee, type)
- `quote.gasFee` — wei (`32,950,000,000,000,000`) and `gasFeeUSD`
  (string, the value to actually display)
- `quote.gasUseEstimate` — gas units estimate
- `quote.slippage` — echoed back

## What worked

- Single curl command, no SDK install, no wallet, no chain RPC.
- `swapper: 0x0` (zero address) accepted as placeholder for read-only
  quote.
- Response complete enough to display to a user immediately.
- API key approval was instant after signup at developers.uniswap.org.

## What didn't / what was confusing

- "Hello world" still required signup + API key. The Uniswap developer
  portal Quick start (post-signup) is excellent — Agent CLI / cURL tabs
  side by side. The gap is the path *to* it: the `uniswap-ai` GitHub
  README doesn't link to developers.uniswap.org prominently, so the
  natural first step is to install the skill and try a call rather than
  go to the portal first.
- `swapper` field is mandatory but the docs phrase it as
  "wallet address" which implies you need one of your own — really, any
  valid 0x address works for read-only quote (the portal Quick start uses
  Vitalik's address as placeholder).
- The portal Quick start cURL includes 4 fields the skill never surfaces
  as standard defaults: `autoSlippage: "DEFAULT"`,
  `spreadOptimization: "EXECUTION"`, `urgency: "urgent"`,
  `permitAmount: "FULL"`. Discrepancy between portal and skill makes it
  unclear what's required vs tuning.
- Skill is 600 lines. No dedicated "I just want a quote" fast-path.
  Hello world buried under 6 sections about smart contracts, Permit2,
  ERC-4337, wagmi pitfalls. The portal Quick start fills this gap better
  than the skill does.
- 2 distinct response shapes (CLASSIC vs UniswapX) decided server-side,
  not by request flag. Consumer must branch on `routing`.

## Open questions

- What does `slippageTolerance: 0` do? Reject if slippage > 0?
- Does CLASSIC vs UniswapX affect FEEDBACK.md scoring (Uniswap might
  prefer demos that exercise UniswapX since that's their newer feature)?
- For the apex project, do we need `/check_approval` + `/swap` end-to-end,
  or is `/quote` + display sufficient as a demo? Likely full e2e.

## Decision impact

- Trading API quote works for free, fast, single curl. **Eligible
  building block** for any apex demo that involves price discovery.
- The natural next kitchensink: `/check_approval` and `/swap` end-to-end
  on a testnet (Sepolia), with a real signing step. That validates the
  full path before committing to a partner alvo.
- Confirms the Uniswap track is reachable as a hackathon partner —
  zero-to-quote is ~30 min including API key signup.

## Feedback already pushed to FEEDBACK.md

See `apex/FEEDBACK.md` at repo root. Entries from this exploration:

- GitHub README → developer portal linkage gap
- `swapper` field mandatory naming confusion
- 600-line skill needs a fast-path
- Portal Quick start cURL includes undocumented defaults
  (`autoSlippage`, `spreadOptimization`, `urgency`, `permitAmount`)
- 2 response shapes without request-side flag
