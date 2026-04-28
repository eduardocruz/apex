# 07 — Agent on 0G Compute (no local model, no OpenAI key)

**Date:** 2026-04-27
**Goal:** Send "oi, como vc esta?" to an HTTP endpoint and get back a real
LLM reply — without running any model locally and without an
OpenAI/Anthropic API key. The GPU doing inference lives somewhere on the
0G Compute Network.

## Why this is the hello world

Every other kitchensink so far (01–06) decorated the *outside* of an
agent — swap, schedule, identity, transport. This one is the **inside**:
the actual LLM call. Without this piece, all the others are routing
something that doesn't think.

The bet 0G makes: instead of you owning a GPU or paying OpenAI, you pay
on-chain in OG tokens, and a network of providers serves inference (some
in TEEs for sealed prompts). For a hackathon, testnet OG tokens are free
via the faucet — so the actual cost to you is zero.

## What's in here

```
README.md                    this file
package.json                 type:module, deps: @0glabs/0g-serving-broker, ethers
.env.example                 template for PRIVATE_KEY + RPC override
.gitignore                   node_modules, .env, .selected-provider.json
setup.js                     one-time: deposit fund + pick provider
server.js                    HTTP agent: POST /api/chat -> reply
index.html                   UI: status panel + chat box + multi-turn toggle
```

## Run it

You'll need Node 18+. ~10 minutes total once you have testnet OG.

### 1. Generate a throwaway wallet

```bash
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
# copy the 0x... string
```

> **DO NOT** use any wallet that holds real funds. This file is gitignored
> via `.env`, but you'll be running it locally; treat it as disposable.

### 2. Configure `.env`

```bash
cp .env.example .env
# edit .env, paste the private key after PRIVATE_KEY=
```

### 3. Get free testnet OG tokens

Go to <https://faucet.0g.ai> (verify the URL on <https://docs.0g.ai>;
0G hosts multiple faucets at different times). Paste the wallet address
that derives from your private key.

To find your address without running anything yet:
```bash
node -e "console.log(new (require('ethers').Wallet)('YOUR_PRIVATE_KEY_HERE').address)"
```

You need a small balance — even 0.1 OG is plenty. The faucet usually
gives more than that.

### 4. Install + setup

```bash
npm install
npm run setup
```

`setup.js` will:
1. Print the wallet address + on-chain OG balance.
2. Create the broker.
3. Deposit 0.05 OG into the broker ledger (one-time, covers many requests).
4. List available inference providers.
5. Pick the first chatbot-flavored one and save it to
   `.selected-provider.json`.

### 5. Start the agent

```bash
npm start
# open http://localhost:5757
```

In the UI:
- Click **Refresh info** — you'll see your wallet, the chosen provider,
  the model, and your ledger balance.
- Type a message in the textarea. Default is "oi, como vc esta?".
- Click **Send**. Wait a couple seconds — the request goes
  Mac → Node → 0G Compute provider GPU → back. Reply renders with model
  name + latency.
- Toggle "remember previous turns" to enable multi-turn.

## What this surfaces about 0G Compute

**Inference is HTTP-shaped, but auth is on-chain.** Each request needs
fresh signed headers (`broker.inference.getRequestHeaders(provider)`)
because the provider verifies the signature against your wallet on every
call. You can't just keep an "API key" in env — the SDK rotates the
auth.

**Provider list is dynamic.** Different providers offer different
models (DeepSeek v3, GLM-5, Qwen 3.x, Llama variants). You query
`broker.inference.listService()` to see what's online. Some run in TEE
("sealed inference") so the provider machine can't see your prompt.

**Pricing is per-token, similar to OpenAI.** The ledger debits
automatically. On testnet it's effectively free; on mainnet you pay in
OG.

**The endpoint is OpenAI-compatible.** Once you have the endpoint URL
and signed headers, the body shape is the standard
`{ model, messages: [{role, content}] }` — meaning the OpenAI Node SDK
or any OpenAI-compatible client should work as a drop-in replacement
for the raw `fetch()` we use here.

## What this does NOT exercise (intentional, hello world)

- **Streaming responses** — `data.choices[0].message.content` is a
  full reply. Would need to set `stream: true` and parse SSE.
- **Tool calls** — agents in the OpenAI sense use tool-call schema for
  function calling. Some 0G providers support it, some don't; check
  `serviceType` on the listing.
- **Memory persistence across runs** — multi-turn here is in-page only.
  Real agent memory would persist to 0G Storage between sessions.
- **TEE attestation verification** — providers offering sealed
  inference issue attestations the client can verify; this hello world
  trusts the provider.
- **Multiple providers / fallback** — we pick one at setup. Production
  would round-robin or pick by latency/price.
- **Embeddings, image, audio** — only chat completions here. Other
  service types (whisper, z-image, embeddings) are listed but not
  driven.

## Decision impact

This is the foundation under any of the apex options. Whatever the
project ends up being — AgentCFO, Agent Town, AgentBay marketplace —
the LLM call has to happen somewhere. 0G Compute is the only sponsor
that puts that piece on the board: the others assume it exists.

If 0G Compute proves reliable enough in this hello world (latency
acceptable, providers stay online, broker SDK doesn't break), the apex
project should default to using it for inference. Falls back to local
Ollama or OpenAI-compatible alternatives only if 0G is unstable on demo
day.

## Notes on the SDK

- Package: `@0glabs/0g-serving-broker` (npm). Versioned `*` here for
  install latest; pin once it stabilizes.
- Wallet: Ethers v6 `Wallet` instance, signing transactions on the 0G
  EVM (testnet chain id 16602, mainnet TBD when launched).
- The broker is async-init: `await createZGComputeNetworkBroker(wallet)`.
- All ledger ops go through `broker.ledger.*`; all inference ops
  through `broker.inference.*`.

If `npm run setup` fails on `depositFund` saying "insufficient funds",
the wallet doesn't have enough OG on-chain to cover the deposit + gas —
hit the faucet again.
