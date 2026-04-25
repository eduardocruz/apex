# 02 — Uniswap quote UI

**Date:** 2026-04-25
**Goal:** Smallest possible UI that exercises the Uniswap Trading API live.
A web page where you pick two tokens, enter an amount, and get back a real
quote — pool address, output amount, gas estimate.

**Why:** kitchensink/01 proved the API works via curl. This turns it into
something **runnable and demoable** — the first piece of the apex repo
that actually does something visible. Stays tiny on purpose: 1 server
file, 1 HTML file, no frameworks, no build step, no dependencies beyond
Node 18+.

## What's in here

```
server.js       Single Node HTTP server. Serves index.html + proxies POST /api/quote.
                ~50 lines. No Express, no node-fetch (built-in fetch + http).
                Inlines a 4-line .env loader.
index.html      Vanilla HTML/CSS/JS. Token in/out dropdowns + amount + chain.
                On submit, calls /api/quote and renders price, routing, gas.
                Handles both CLASSIC and UniswapX response shapes.
.env.example    UNISWAP_API_KEY=, PORT=3000
package.json    Sets type: module, npm start → node server.js. No deps.
```

## Run it

```bash
cd kitchensink/02-20260425-uniswap-quote-ui
cp .env.example .env
# Edit .env, paste your Uniswap API key from developers.uniswap.org
npm start                # then open http://localhost:3000
```

That's it. No `npm install` (zero deps).

## Why a backend at all

Browser CORS preflight on Trading API returns `415 Unsupported Media
Type` — direct browser → Uniswap fetch always fails. The skill calls
this out and offers proxy snippets for Vite, Next, Vercel, Cloudflare.
Here we run the smallest possible proxy: a Node http server that takes
POST /api/quote, forwards to Uniswap with the API key header, returns
verbatim. No transformation, no caching, no auth, ~10 lines of routing
code.

## What it shows

For each quote you can see:
- Output amount with token symbol
- `routing` value (CLASSIC, DUTCH_V2, PRIORITY, etc.)
- Gas estimate in USD (or "gasless" for UniswapX routes)
- Hop count for CLASSIC
- The full raw JSON response in a collapsible `<details>` block

## Tokens supported (out of the box)

- **Ethereum (1):** ETH, WETH, USDC, USDT, DAI, WBTC
- **Base (8453):** ETH, WETH, USDC
- **Arbitrum (42161):** ETH, WETH, USDC, USDT

To add more: `index.html` → `TOKENS` constant. Address + decimals.

## Scope on purpose

What this **does not** do (intentional):

- Connect a wallet (no wagmi, no rainbowkit)
- Sign anything
- Execute a swap
- Handle Permit2
- Manage approvals
- Show price charts
- Persist anything

The job is to make `/quote` legible and demoable in a browser, nothing
more. Adding any of the above belongs in a later kitchensink folder so
the value stays observable per step.

## Decision impact

This unlocks the apex demo direction: any project we end up building
that needs a "show me a price" piece can lift `server.js` and the JS in
`index.html` directly. ~150 lines total.
