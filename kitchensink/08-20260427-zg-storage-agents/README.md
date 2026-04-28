# 08 — Agents as immutable bundles on 0G Storage

**Date:** 2026-04-27
**Status:** ⚠️ **NOT WORKING END-TO-END** — see "Current state" below.

**Goal:** Define an agent in two markdown files (`AGENTS.md` + `SOUL.md`),
upload them to 0G Storage as immutable artifacts, get back a manifest
hash that **is the agent's permanent identity**. Then load any agent by
its hash and chat with it through 0G Compute. Phase 1 of the
agentcompanies.io spec — agent-level only. Companies come in Phase 2.

## Current state (2026-04-28)

The full pipeline is implemented and the code matches the official
`@0glabs/0g-ts-sdk` docs verbatim
(<https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk>), but
upload to the Galileo testnet currently **fails for two distinct
reasons** depending on where the script runs:

1. **From a Brazilian residential ISP (development laptop):** TCP
   connections to the storage node IPs returned by the indexer (GCP
   prefixes on port 5678, e.g. `34.83.53.209:5678`) time out after 30s.
   ICMP works; HTTP times out. Other 0G testnets reachable. Diagnosis:
   ISP-side filter on TCP egress to GCP IPs on non-standard ports.

2. **From a US-region DigitalOcean droplet (no network filtering):**
   the storage nodes accept the connection and the segment is selected,
   but `Indexer.upload` reverts during `estimateGas` against the flow
   contract (`0x22E03a6A89B950F1c82ec5e74F8eCa321a105296`). Wallet has
   funds, fee is `~0.0000000307 OG`, no obvious reason for the revert.
   Multiple builders in the hackathon Discord/Telegram are reporting
   intermittent issues with the indexer/storage layer in the same
   window (2026-04-27 → 28); the 0G team is investigating, and
   third-party fallback nodes have started appearing
   (e.g. <https://trivo25.github.io/agentio/>).

`@0glabs/0g-serving-broker` (kitchensink/07, 0G Compute) works end-to-end
from both environments. The blocker is specifically the Storage layer.

See `../../FEEDBACK-0g.md` for full builder feedback to the 0G team.

## What is committed here, and why

The project is committed in its current state because:

- The **shape** of the design (agent as `AGENTS.md` + `SOUL.md` +
  `manifest.json`, hash = identity) is the load-bearing contribution,
  not the upload mechanics.
- The **server, UI, and chat path** all work — once any one upload
  succeeds and a manifest hash is in hand, everything downstream
  (load by hash, build system prompt, chat via 0G Compute) is exercised.
- A single successful manual upload of any of the three files via
  <https://storagescan-galileo.0g.ai/tool> confirms the wallet, indexer,
  and storage layer can in principle accept our payloads (submission
  #52869 from this wallet, 2026-04-27).
- The same code, restarted against a healthy testnet (or pointed at a
  fallback indexer URL via `ZG_INDEXER_URL`), is expected to complete
  end-to-end without changes.

## Why this is the next hello world

Kitchensink/07 proved 0G Compute (the brain). This one proves 0G
Storage as the substrate for **agent identity + persona** —
versioned by hash, retrievable from any node, never overwritten.

## The contract — agentcompanies.io spec

| File | Purpose | Frontmatter examples |
|---|---|---|
| `AGENTS.md` | What the agent does. Role, instructions, skills it can invoke. | `name`, `title`, `reportsTo`, `skills`, `version` |
| `SOUL.md`   | Who the agent is. Voice, values, speaking style, what it won't do. | `name`, `voice`, `version` |
| `manifest.json` | Tiny JSON pointing to both file hashes. **Its hash is the agent's ID.** | `schema: agentcompanies/v1`, `kind: agent-bundle`, `files`, `savedAt`, `savedBy` |

When you talk to a loaded agent, the body of `SOUL.md` and `AGENTS.md`
becomes the system prompt sent to 0G Compute. The frontmatter is
metadata for tooling.

## Run it

**Note:** the included `setup.js` will generate its own wallet on first
run if `.env` doesn't have a `PRIVATE_KEY`. You may want to fund that
wallet with testnet OG (faucet: <https://faucet.0g.ai>) and also use it
in `/07` so both kitchensinks share funds.

```bash
cd kitchensink/08-20260427-zg-storage-agents
npm install
npm run setup     # generates .env if missing, probes wallet + indexer + compute provider
npm start         # http://localhost:5858
```

**To try a fallback storage node** (if the default Galileo indexer is
having issues), set `ZG_INDEXER_URL` in `.env` before running. The 0G
docs list both `indexer-storage-testnet-turbo.0g.ai` (default) and
`indexer-storage-testnet-standard.0g.ai`.

In the UI:

1. **Step 1** — click "Load default templates (Kai)" to populate
   `AGENTS.md` + `SOUL.md` with a starter persona. Edit either freely.
2. **Step 2** — click "Save agent". 3 uploads happen (AGENTS.md →
   SOUL.md → manifest.json), each gets its own rootHash. ~15-30s.
3. **Step 3** — the manifest hash is auto-pasted; click "Load agent"
   to round-trip the bytes back from 0G Storage and see the parsed
   frontmatter.
4. **Step 4** — type a message, click Send. The loaded agent's
   persona drives the reply.

Want to verify immutability? Edit something in step 1, save again. New
hash. The old one still resolves to the unchanged version forever.

## Storage shape

```
AGENTS.md       (raw bytes)              -> 0xabc...   agentsHash
SOUL.md         (raw bytes)              -> 0xdef...   soulHash
manifest.json   { files: {AGENTS,SOUL}}  -> 0x123...   manifestHash    ← AGENT ID
```

The manifest is the only piece anyone needs. Given `manifestHash`:

```javascript
const manifest = await fetch_0g(manifestHash);   // 200 bytes JSON
const agentsMd = await fetch_0g(manifest.files['AGENTS.md']);
const soulMd   = await fetch_0g(manifest.files['SOUL.md']);
```

Three round trips, all by content hash. No central registry, no path
to change, no link to expire.

## What this surfaces about 0G Storage

**Each upload is a separate transaction.** The Indexer broadcasts a
log entry on-chain pointing to the rootHash. Three uploads = three
small txs (gas paid in OG, sub-cent on testnet).

**Re-uploading identical bytes is idempotent.** The contract returns
"root hash already exists" — we treat that as success, not error,
because the hash IS the address.

**Reads are uncached server-side, cached client-side.** First fetch
hits an indexer query + segment download. We cache to
`.agent-cache/<hash>` so repeated chat turns don't re-fetch the same
markdowns.

**No HTTP gateway by default.** Reads go through the Indexer
client. There's an HTTP API exposed by the storage node, but the SDK
abstracts it.

## What this does NOT exercise (intentional, hello world)

- **Encryption.** Files go up in clear. Realistic agents would
  encrypt sensitive personas (proprietary system prompts) before
  upload and ship a separate decrypt key. SDK doesn't do this for
  you.
- **Tools.** The agent can talk but has no function calling. Next
  kitchensink (`/09`) would wire tool-call → 0G Compute roundtrip.
- **Multi-file skills.** AGENTS.md spec allows pointing to skills via
  shortname. We're not resolving them.
- **Companies.** Phase 2 ships `COMPANY.md` + `TEAM.md` +
  `PROJECT.md` + `TASK.md`. A company "hires" agents by referencing
  their manifest hashes — themselves immutable. Composition over
  inheritance.
- **Garbage collection.** Once uploaded, files persist as long as
  storage providers keep them paid up. There's no "delete".

## Decision impact

Confirms two things for the apex Phase 2 design:

1. **Agent identity can live entirely on 0G Storage** — no need for
   ERC-7857 to publish names/personas. Hash IS the identity. ENS can
   layer on top to give a human-readable name resolving to the hash
   (`kai.apex.eth` text record `agent` = `0x123...`).
2. **The agentcompanies.io spec is real and concrete enough to
   build with.** AGENTS.md + SOUL.md isn't theoretical — qwen-2.5
   responds coherently to system prompts assembled from those bodies.
   The spec scales to whole companies the same way.

Phase 2 of the apex (post-/08) builds COMPANY.md that references
agent manifest hashes. A company "hiring" an agent = adding its hash
to the company's manifest. CEO is just the first agent the company
hires.
