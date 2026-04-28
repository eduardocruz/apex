# FEEDBACK-0g.md

Builder feedback on 0G — submitted as part of the 0G prize at ETHGlobal
Open Agents. Covers both **0G Compute** (kitchensink/07) and **0G
Storage** (kitchensink/08). Written from the perspective of a developer
building a real "open agent" stack from scratch over two days, not a
spectator running examples.

Source kitchensinks:
- [`kitchensink/07-20260427-agent-0g-compute-hello`](./kitchensink/07-20260427-agent-0g-compute-hello)
- [`kitchensink/08-20260427-zg-storage-agents`](./kitchensink/08-20260427-zg-storage-agents)

## Tools used

| Tool                                            | Used in        | Outcome              |
|-------------------------------------------------|----------------|----------------------|
| `@0glabs/0g-serving-broker` (npm)               | /07            | Worked end-to-end    |
| `@0glabs/0g-ts-sdk` — `Indexer`, `MemData`, `ZgFile` | /08         | Blocked by network outage |
| `https://faucet.0g.ai`                          | /07            | Worked               |
| `https://evmrpc-testnet.0g.ai` (Galileo testnet)| both           | Worked               |
| `https://indexer-storage-testnet-turbo.0g.ai`   | /08            | List endpoint OK; node URLs unreachable |
| `https://indexer-storage-testnet-standard.0g.ai`| /08            | **HTTP 503** at the time of testing |
| Wallet via ethers v6                            | both           | Worked               |

## What worked well

### 0G Compute (Track 1 / Track 2 enabler)

- **OpenAI-compatible endpoint after auth.** Once the broker hands you
  `endpoint` + signed headers, the body shape is the standard OpenAI
  chat completions one (`{ model, messages: [...] }`). Drop-in
  replacement for OpenAI/Anthropic SDKs is realistic — the only
  per-request work is `getRequestHeaders(provider)` rotation. This is
  the right level of abstraction.
- **Provider listing is dynamic and shape-clean.** `broker.inference.listService()`
  returned 2 chatbot/image-edit providers with `{ provider, model,
  serviceType, url }` — easy to filter by use case in 5 lines of JS.
- **First successful turn end-to-end in under 30 minutes.** From `npm
  install` → faucet → ledger creation → first `/chat/completions` call
  was about 25 minutes including the 3 OG ledger gotcha (see below).
  That's faster than wiring up the OpenAI Node SDK + billing tier the
  first time you do it.
- **TEE / sealed-inference path is exposed in the listing.** Some
  providers tag verifiability so a privacy-sensitive caller can
  filter. Doesn't get in the way of plain calls.
- **Latency was reasonable.** First call ~4s cold, second call ~2s.
  qwen-2.5-7b-instruct on `compute-network-6.integratenetwork.work`
  gave coherent Brazilian Portuguese on the first try ("Olá! Estou
  bem, obrigado. Como posso ajudar você hoje?").

### 0G Storage (when reachable)

- **Single-binary mental model.** "Upload bytes → get a Merkle root
  hash" is the cleanest possible abstraction. It maps to S3 the way
  ENS maps to DNS — same shape, better property (content-addressed,
  immutable, vendor-neutral).
- **`@0glabs/0g-ts-sdk` exposes both `MemData` and `ZgFile`** — letting
  callers upload either an in-memory buffer or a path. We used
  `ZgFile.fromFilePath()` after writing temp files; both worked at
  build time.

## Bugs / surprises

### `depositFund(0.05)` reverts on first ledger creation — minimum is **3 OG**

This was a real time-loss. The README example shows
`broker.ledger.depositFund(10)`, the docs `quick reference` shows
`depositFund(0.05)`, and the SDK error finally clarifies:

```
Error: No ledger exists yet. depositFund will create one, but the contract
requires a minimum of 3 0G. Got 0.05 0G. Please use: broker.ledger.depositFund(3)
```

The error message itself is excellent. The problem is the docs sample
makes the user think 0.05 will work, costing them a faucet trip and a
restart. **Suggested fix**: in `developer-hub/.../inference`, change
the example to `await broker.ledger.depositFund(3)` and add a one-line
caveat: "first deposit creates the ledger — contract minimum is 3 OG.
Subsequent top-ups can be any amount." That's the entire fix; doesn't
need a code change.

Also: the testnet faucet handed out a number well below 3 OG initially
in our experience (we needed two transfers from a separate wallet to
cross the threshold). If the contract minimum stays at 3 OG, the
faucet should default-give at least 3.5 OG to cover deposit + gas, or
the docs should warn explicitly.

### `X-From-Peer-Id` is suffix-padded with `f`s in `/recv`

Verified output of `recv` on a node that received a message:

```json
{ "from": "745cc664cf501ea239a81193d02abfffffffffffffffffffffffffffffffffff",
  "body": "hello" }
```

The first 32 hex characters match the sender's actual public key
prefix; the rest is `ff` padding. A naive equality check against
`our_public_key` from `/topology` (64 chars, no padding) gives
false-negative. (Note: this one is from kitchensink/06 — Gensyn —
but the same gotcha pattern appears across builder ecosystems and
is worth documenting.)

### Storage-network outage during build (2026-04-27 ~22:00 UTC)

This blocked /08 from completing end-to-end. Documenting in detail
because it has actionable feedback regardless of root cause.

**Symptom (from our network):**
- `https://indexer-storage-testnet-standard.0g.ai` returned **HTTP 503
  Service Temporarily Unavailable** (nginx).
- `https://indexer-storage-testnet-turbo.0g.ai` was reachable; the
  `indexer_getShardedNodes` JSON-RPC call returned 6 storage nodes:
  `34.83.53.209`, `34.169.28.106`, `34.19.125.196`, `34.102.76.235`,
  `34.133.200.179`, `35.236.80.213` (all on port `5678`, all in GCP).
- **Every one of those 6 storage nodes refused TCP connection on
  port 5678 from our network.** `curl --max-time 6 http://<ip>:5678/`
  returned `HTTP 000` (connection failed) for all of them, total time
  ≈6s each.
- The same GCP IPs on port 443 also returned `HTTP 000`, ruling out
  "port 5678 is blocked locally but 443 is fine."
- The SDK's resulting error was `timeout of 30000ms exceeded` — wrapped
  by axios (default `timeout: 30000ms`), originating from the
  segment-publish step inside `Uploader`.
- Our network had multiple `utun*` interfaces (Tailscale + others), so
  some local routing involvement is possible — but a clean curl from
  a totally different egress would still need to be the differential
  test. We didn't have time to retest from a second network before
  submitting.

**What would have helped:**
1. **A status page or `/health` endpoint on the indexer.** When
   `getShardedNodes` cheerfully returns nodes that the public can't
   reach, the SDK pipes back a generic 30s timeout that looks like the
   developer's bug. A `/health` endpoint on the indexer that
   actually probes the nodes it returns (or marks them as
   unreachable) would have made this 30 seconds of debugging instead
   of an hour.
2. **A `--dry-run` or `getShardedNodes` filter for "publicly
   reachable from this client".** Right now, the indexer's
   `latency: 1` field reflects internal health, not the client's
   ability to actually connect — which is the load-bearing fact
   for a real upload.
3. **Default axios timeout in the SDK should be longer than 30s.**
   Testnet uploads of even tiny files (we tried 200 bytes) can
   exceed 30s. Bumping the default to 90-120s would catch slow but
   working paths and fail more cleanly on truly-dead ones.
4. **Indexer should expose the storage node URL list via
   HTTPS / standard ports.** Storage nodes on bare HTTP port 5678
   to GCP IPs are hostile to the segment of users behind NATs,
   strict corporate firewalls, certain ISPs, and several VPNs. A
   reverse proxy on 443 with TLS would absorb most of that
   surface area. (We acknowledge the gateway approach has tradeoffs
   for a decentralized design — but a default-on optional gateway
   would unblock builders.)

### `FileHandle` GC error from `ZgFile.fromFilePath()`

When the upload errors mid-flight, the temp file's FileHandle is
not properly closed by the SDK before returning the error, surfacing
as:

```
[Error: A FileHandle object was closed during garbage collection. ...
File descriptor: 17 (/var/folders/.../zg-...-AGENTS.md)] {
  code: 'ERR_INVALID_STATE'
}
```

Node is increasingly strict about this — it's a deprecation that
turned into an error. The SDK should explicitly `file.close()` (or
use `try/finally`) on the upload error path. This is a small code
fix worth making before more strict Node releases.

## Documentation gaps

### No "two-node" or "minimal end-to-end" example for Storage

The Compute Network has the inference quick-start that gets you to a
chat completion in 25 minutes. Storage has API references and
"upload from filesystem" snippets, but no end-to-end "minimal
working example" you can `npm install` + run that confirms your
network can reach the testnet at all. **A 50-line "save and load
this string by hash" demo, with a note saying "if this fails for
you, here's how to diagnose connectivity"**, would unblock everyone
on day one.

### `UploadOption` and `RetryOpts` aren't explained in the public docs

These fields exist (verified via `.d.ts`):

```typescript
interface UploadOption {
  tags: ethers.BytesLike;
  finalityRequired: boolean;
  taskSize: number;
  expectedReplica: number;
  skipTx: boolean;
  fee: bigint;
  nonce?: bigint;
}

type RetryOpts = {
  Retries: number;
  Interval: number;
  MaxGasPrice: number;
  TooManyDataRetries?: number;
};
```

A real builder hits the timeout, opens the SDK source, finds these
options, then realizes there's no doc explaining what
`finalityRequired` or `expectedReplica` does — and has to guess.
**A reference table with default values + when to override would
save 30 minutes per builder.** Especially `RetryOpts` —
`Retries`, `Interval`, `MaxGasPrice` matter a lot under flaky
testnet conditions.

### No published `npm` package for the indexer's HTTP API

We ended up using `Indexer` extending `HttpProvider` from the
`open-jsonrpc-provider` package — meaning to set the timeout, we
had to mutate the indexer instance directly:

```javascript
const indexer = new Indexer(INDEXER_URL);
indexer.timeout = 180000;
```

This works but is undocumented and feels like reaching into private
state. A constructor option `new Indexer(URL, { timeout: 180000 })`
would be cleaner and discoverable.

## Feature requests

1. **`Indexer.health()`** — checks if the storage nodes the indexer
   would hand out are *actually reachable from the calling network*.
   Returns the subset that passed. Lets the SDK fail fast and
   informatively when the testnet is unhealthy.
2. **`Indexer.upload(...)` should accept `{ timeout, signal }` opts.**
   Right now timeout is set on the Indexer instance — once. Per-call
   AbortController support is the modern Node convention.
3. **Mainnet pricing transparency.** For builders deciding what to
   put on Storage vs leave off-chain, knowing the per-byte mainnet
   cost (when it lands) is a deciding factor. A pricing page with
   "100 KB markdown = X OG ≈ Y USD" would make the cost-of-decision
   concrete.
4. **TypeScript SDK should publish ESM + CJS both.** Worked for us
   in `type: "module"` projects but the layout under
   `lib.commonjs/` vs `lib.esm/` was confusing on first inspect
   (and went wrong once during partial install — the broker package
   was missing `lib.esm/` in our first install attempt; clean
   reinstall fixed it).
5. **A `paperclip`/`agentcompanies` reference example.** With the
   `agentcompanies.io` spec gaining traction, a "store an agent
   bundle (`AGENTS.md` + `SOUL.md` + `manifest.json`) on 0G Storage
   and reload by hash" official example would be incredibly useful.
   That's exactly what /08 is — and we'd have shipped it already if
   storage was up.

## Comparisons

### vs. OpenAI / Anthropic for the LLM
- **0G Compute wins:** OpenAI-compatible endpoint, multiple
  providers, optional TEE, no credit-card-on-file requirement (you
  pay in OG that you got from a faucet).
- **OpenAI wins:** much wider model selection, longer context,
  predictable latency, mature streaming + tool calling support
  across the SDK.
- **Verdict:** for hackathon and self-funded indie builds, 0G
  Compute is genuinely competitive. For production with strict
  latency/SLA requirements, OpenAI is the safer choice today.

### vs. IPFS / Arweave / S3 for storage
- **0G wins over S3:** content-addressed, no centralized vendor
  lock-in, no IAM headache, no URL-rot.
- **0G wins over IPFS:** simpler model (one indexer per network,
  not a DHT to reason about), built-in incentive layer
  (storage providers paid in OG, not relying on goodwill pinning).
- **Arweave is closer competition:** also content-addressed, also
  permanent, also EVM-adjacent. Arweave wins on "we've been live
  for 6 years"; 0G wins on tighter integration with a Compute
  layer (sibling product, same chain).
- **Verdict:** 0G Storage's most defensible position is "the
  storage piece of an end-to-end stack with Compute + Identity",
  not "Arweave with a different name". The Compute integration is
  the differentiator and should be foregrounded in marketing.

### vs. ENS for agent identity
- **0G AgenticID (ERC-7857):** privacy-preserving (encrypted
  metadata), portable cryptographically.
- **ENS:** vastly more tooling, every wallet/explorer/dApp speaks
  it, public text records by design.
- **Verdict:** for our apex project, ENS wins for "agents need to
  be discoverable" because the metadata is *meant* to be public
  (pubkey, endpoints, services). AgenticID wins when the
  metadata is genuinely private (proprietary system prompts,
  fine-tuned weights). This is documented in
  `kitchensink/05-20260425-0g-inft-explorer/README.md` ->
  "Decision impact" section. Not a knock against AgenticID —
  it's the right primitive for a different threat model.

## What this kitchensink does NOT exercise (intentional)

- **0G Storage encryption.** SDK doesn't encrypt by default; we
  uploaded markdowns in clear. Production agent personas with
  secrets need a separate encrypt step.
- **Tool calling on Compute.** We did pure chat completions in /07.
  Whether all 0G providers honor the `tools: [...]` field is
  worth a separate kitchensink (`/09`).
- **TEE attestation verification.** Sealed inference providers
  issue attestations; we didn't validate any.
- **Storage shard / replication tuning.** `expectedReplica` and
  related `UploadOption` fields default to sensible values; we
  didn't override.
- **Mainnet anything.** Pure testnet (Galileo, chainId 16602).

## Decision impact

For our apex Phase 2 project (multi-agent autonomous companies
following the agentcompanies.io spec), the 0G stack is the
load-bearing infrastructure:

- **0G Compute = the brain** of every agent (qwen-2.5-7b-instruct
  giving coherent replies in ~2-4s).
- **0G Storage = the persistence layer** — agents are immutable
  bundles (`AGENTS.md` + `SOUL.md` + `manifest.json`) addressed by
  hash. The hash IS the agent's identity.
- **0G Chain = the settlement / accounting layer** that makes the
  above two work: ledger debits per inference, segment commits per
  upload.

If 0G Compute proves stable through demo day (the 4-hour test
window in /07 didn't surface failures), the apex demo defaults to
it. Storage stability is the open question — if the testnet
outage we hit on 2026-04-27 isn't an isolated incident, we'd
fall back to local SQLite for the demo with a documented "swap to
0G Storage when stable" path.

Either way: 0G is the only sponsor whose primitives scale to the
project's full architecture, not just provide a single-feature
checkbox. That's the difference between "decoration" and
"load-bearing" — and 0G is firmly in the second category.
