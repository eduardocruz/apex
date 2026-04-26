# 05 — 0G: read the AgenticID (ERC-7857) registry on-chain

**Date:** 2026-04-25
**Goal:** Verify the 0G Galileo Testnet is alive and inspect what's
*actually* stored when an agent is registered as an iNFT (ERC-7857) —
without holding a wallet or testnet OG tokens.

## Why this is the hello world

Every other 0G example (Compute, Storage, AgenticID mint flows) requires
testnet OG in your wallet to run. The faucet is the bottleneck. This
kitchensink skips the faucet entirely by doing what `kitchensink/02`
did for Uniswap v4: **just read the chain through viem.** Read-only.
No signing, no fees, no wallet popup.

What you get out of it:

1. Proof the EVM-puro claim is real (chain ID 16602, standard JSON-RPC).
2. Concrete picture of what an "Agentic ID NFT" looks like on-chain —
   so you know what you'd be committing to before deciding whether to
   mint your own.
3. A working scaffold for any later kitchensink that *does* write
   (just add a wallet client + signer once you have OG).

## What's in here

```
README.md       this file
server.js       Node http server + viem reads against the 0G testnet
index.html      Two panels: registry summary + token inspector
package.json    type: module, single dep: viem
.env.example    Optional ZG_RPC_URL override
```

## Run it

```bash
cd kitchensink/05-20260425-0g-inft-explorer
npm install
npm start
# open http://localhost:5858
```

No `.env` required — defaults work.

## What you'll see

**Registry summary** (verified output):

```json
{
  "contract": "0x2700F6A3e505402C9daB154C5c6ab9cAEC98EF1F",
  "chainId": 16602,
  "chainName": "0G Galileo Testnet",
  "rpcUrl": "https://evmrpc-testnet.0g.ai",
  "name": "Agentic ID",
  "symbol": "AID",
  "totalSupply": "77",
  "mintFeeWei": "0",
  "mintFeeOG": "0",
  "creator": "0xaD8518cF3510eB2EBb843Eb51D209A5f98B768D2"
}
```

**Inspect token 0** (verified output):

```json
{
  "tokenId": "0",
  "owner": "0x234CAEEccbbd7B41111E0d36CaDE4e3533328122",
  "tokenURI": "(empty)",
  "tokenCreator": "0x234CAEEccbbd7B41111E0d36CaDE4e3533328122",
  "cloneSource": "0",
  "isClone": false,
  "intelligentDatas": [
    { "dataDescription": "agent_name",    "dataHash": "0xe5b9…1a9e" },
    { "dataDescription": "model",         "dataHash": "0x11de…1346" },
    { "dataDescription": "capabilities",  "dataHash": "0x81d1…27db" },
    { "dataDescription": "system_prompt", "dataHash": "0x1f9e…0b65" }
  ]
}
```

## What this surfaces about ERC-7857

Look at that token 0 output. The on-chain footprint is **just the
description strings + bytes32 hashes**. The actual values — the agent's
name, model identifier, capabilities, system prompt — are *not* on-chain.
What's on-chain is a Merkle-style commitment to them.

That's the point of ERC-7857: agent metadata is privacy-preserving.
The values live off-chain (in 0G Storage, typically), encrypted.
The hash is the anchor. When the iNFT is transferred, ownership of the
*data* is re-established cryptographically (via TEE or ZKP oracles, in
production — the demo contract skips proof verification).

So when you read an Agentic ID, the on-chain side tells you "this
token has 4 fields named agent_name / model / capabilities / system_prompt,
each committing to specific bytes". Resolving those fields to their
actual values requires the off-chain piece (storage + decryption keys).

The contract used here is the simplified demo (`AgenticID.sol` from
`agenticID-examples`) — it implements `IERC7857`, `IERC7857Authorize`,
and `IERC7857Cloneable`, but skips proof verification. Production
deployments use full proof-verifying contracts.

Other useful observations:

- **`mintFee` is 0** on this testnet — anyone can mint. Cost is just gas.
- **77 tokens minted** as of writing. Active testnet traffic.
- **Token 76 (the last one)** has empty `intelligentDatas` — minted via
  `mint(to)` not `iMint(to, datas)`. So the registry has both
  data-bearing and naked iNFTs.
- **`tokenURI`** comes back empty for these tokens — this contract
  doesn't override `_baseURI`. Off-chain metadata isn't pointed at by
  the standard ERC-721 URI; it's keyed by `dataHash` instead.

## What this does NOT exercise (intentional, for a hello world)

- **Minting an iNFT** — needs wallet + testnet OG (faucet). Next
  kitchensink.
- **Resolving `dataHash` → actual content** — needs 0G Storage SDK +
  encryption key. Separate kitchensink.
- **Authorization / delegation** — `authorizeUsage`, `revokeAuthorization`
  are in the contract but require ownership. Read-only flow can't
  exercise them.
- **Cloning (`iCloneFrom`)** — write op.
- **0G Compute** — completely separate SDK, OpenAI-compatible, requires
  broker + funding.
- **0G Chain native gas** — we read; we don't pay.

Each of those is a natural next kitchensink. The point of /05 is to
prove the chain is live, the contract is real, and to make the
ERC-7857 privacy model concrete before committing time to building on
top of it.

## Decision impact

ERC-7857 is the **identity primitive** 0G is most pushing for the
"Best Autonomous Agents, Swarms & iNFT Innovations" prize track
($7,500). For an apex project, it slots in if:

- The agent has metadata you don't want fully public (system prompt,
  proprietary capabilities, training set hash) but want
  cryptographically committed to.
- You need transferable / cloneable agents with intact state — e.g.
  selling an agent to another operator.
- You want every agent action to trace back to a verifiable on-chain
  identity.

If your agent doesn't have any of those properties, ERC-7857 is
decoration in the same way ENS would be. Real test: can the demo
*lose* the iNFT and still work?

The natural combo for apex: **mint a small iNFT with hashed pointers
to system prompt + capabilities, store the actual content in 0G Storage,
let the agent's runtime resolve `dataHash → storage` to load itself.**
That makes ERC-7857 + 0G Storage non-cosmetic together — pull either
out, the agent doesn't load.

## Notes on RPC

Default RPC: `https://evmrpc-testnet.0g.ai`. Responds in ~200-400 ms
locally. Standard JSON-RPC, viem talks to it without any 0G-specific
plugin — `defineChain({ id: 16602, ... })` is enough.
