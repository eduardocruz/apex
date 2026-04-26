# 04 — ENS: forward + reverse resolution

**Date:** 2026-04-25
**Goal:** Show the simplest possible ENS hello world an agent would need:
**given a name, get an address; given an address, get a name.** No
signing, no gas, no registration — just resolution.

## Why this is the hello world

For an agent on ENS, the two atomic operations are:

1. **Forward resolution** — "what's the wallet behind `vitalik.eth`?"
   This is what every payment-by-name flow needs.
2. **Reverse resolution** — "what name does this 0xabc… address claim?"
   This is what every UI rendering an address needs to show
   `vitalik.eth` instead of `0xd8dA…6045`.

Once you can do both, you understand the building block underneath
**agent identity via ENS subnames** — which is the actual sponsor prize:
agents named like `agent1.<parent>.eth`, each with its own
address, avatar, and discovery records.

## What's in here

```
README.md       this file
server.js       Node http server + viem ENS reads
index.html      Two forms: forward + reverse, no JS framework
package.json    type: module, single dep: viem
.env.example    Optional ETH_RPC_URL override
```

## Run it

```bash
cd kitchensink/04-20260425-ens-resolve-hello
npm install
cp .env.example .env   # optional — defaults work
npm start
# open http://localhost:5757
```

## What you'll see

**Forward (`vitalik.eth`):**

```json
{
  "name": "vitalik.eth",
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "records": {
    "avatar": "https://euc.li/vitalik.eth",
    "com.github": "vbuterin",
    "com.twitter": "VitalikButerin",
    "description": "mi pinxe lo crino tcati",
    "url": "https://vitalik.ca"
  }
}
```

**Reverse (`0xd8dA…6045`):**

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "name": "vitalik.eth"
}
```

Some `avatar` records come back as `eip155:1/erc721:<contract>/<tokenId>`
URIs — ENS doesn't resolve NFT references to images; that's the
consumer's job (call `tokenURI` on the contract, fetch the metadata,
render the image).

## How it works

Three viem functions, no contract addresses to look up:

| Operation | viem call | What it does |
| --- | --- | --- |
| Forward | `client.getEnsAddress({ name })` | namehash → resolver → `addr()` |
| Reverse | `client.getEnsName({ address })` | reverse-record lookup + verification round-trip |
| Text records | `client.getEnsText({ name, key })` | resolver `text()` for `avatar`, `url`, etc. |

viem handles UTS-46 normalization (`normalize()`), namehash computation,
resolver discovery, and CCIP-read off-chain gateways automatically — the
last one matters because many real-world names today live in offchain
resolvers (e.g. NameStone, Namespace, ENSv2 L2 storage). If your agent
can't resolve those, it sees a much smaller ENS than actually exists.

## What this does NOT exercise (intentional, for a hello world)

- **Registering a subname** (`agent1.<parent>.eth`) — needs a
  parent name and a write transaction, or an offchain resolver setup.
- **Setting text records** — needs the controller key.
- **L2 / Namechain** — same UX, different chain. ENSv2 will introduce
  cheaper subname issuance on a dedicated L2.
- **Wildcard / offchain resolver authoring** — the consumer side
  ("CCIP-read") works automatically; the producer side (running an
  offchain resolver) is a separate kitchensink.
- **Avatar resolution beyond text record** — the `avatar` field comes
  back as a URI / `eip155:` reference; a real UI would resolve those to
  an actual image.

Each of those is a natural next kitchensink. The point of /04 is the
read primitive on which every higher-level ENS pattern is built.

## Decision impact

ENS slots in cleanly as **the identity / discovery layer** for any apex
project that needs:

- Human-readable agent names (`pricing-agent.<parent>.eth`)
- A way to publish per-agent metadata (avatar, capabilities, endpoints)
- Reverse rendering (so logs and UIs show names instead of hashes)

It pairs naturally with KeeperHub (each scheduled workflow = one
subname) and with Uniswap pay-with-any-token (`pay vitalik.eth in
USDC` — resolve, then swap-and-send).

## Notes on RPC

Default RPC: `https://eth.drpc.org`. ENS resolution needs a few
sequential `eth_call`s (resolver lookup → addr → text records), and the
free public RPCs that worked for kitchensink/02 also work here. If you
hit rate limits, drop in a private RPC URL via `.env`.
