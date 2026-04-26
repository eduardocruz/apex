# FEEDBACK-gensyn.md

Builder feedback on Gensyn's AXL (Agent eXchange Layer) — submitted as part
of the Gensyn prize at ETHGlobal Open Agents. Written from the perspective
of someone integrating AXL for the first time, end-to-end, with no prior
knowledge of Yggdrasil.

Source kitchensink: [`kitchensink/06-20260425-gensyn-axl-hello`](./kitchensink/06-20260425-gensyn-axl-hello).

## Tools used

| Tool                                          | Used where                                                |
|-----------------------------------------------|-----------------------------------------------------------|
| `gensyn-ai/axl` repo                          | `git clone` + `go build`                                  |
| `axl/cmd/node`                                | Built the `node` binary; ran two instances                |
| `node-config.json` schema                     | Two configs: listener (A) + peer (B)                      |
| HTTP API: `/topology`, `/send`, `/recv`       | All three exercised                                       |
| `openssl genpkey -algorithm ed25519`          | Persistent identities                                     |

## What worked well

- **Single-binary install.** `make build` (or `go build -o node ./cmd/node`)
  produced a 16 MB static binary on first try. Go toolchain auto-fetched
  `go1.25.5` despite host running 1.24.2. Zero friction.
- **Userspace networking.** No TUN, no `sudo`, no kernel module — gVisor
  handles the TCP/IP stack entirely in userspace. Two nodes peering on
  the same machine just worked. Important property for hackathon devs
  who don't want to mess with their machine's networking.
- **Wire format is dead simple.** `POST /send` with `X-Destination-Peer-Id`
  header and raw bytes in the body. `GET /recv` returns the next message
  with `X-From-Peer-Id`. No JSON-RPC ceremony, no schema. Bytes go in,
  bytes come out. This is the right level of abstraction for a transport.
- **TLS + ed25519 by default.** Identity = public key, no PKI/CA dance,
  no certificate pinning, no rotation thinking required for a hello world.
- **The MCP / A2A escape hatches.** `/mcp/{peer}/{service}` and
  `/a2a/{peer}` give you a structured layer on top of the raw bytes
  channel without forcing it. Right separation: AXL is transport,
  app-layer protocol is opt-in.

## Bugs / surprises

### Virtual `tcp_port` mismatch silently breaks `/send`

This burned a chunk of debugging time. I assumed `tcp_port` was a
host-level port (like `api_port` is) and gave node A `7000` and node B
`7001` to "avoid collision". They peered fine over TLS — `/topology`
showed both nodes connected — but every `POST /send` returned `502 Bad
Gateway` with `connect tcp [<peer-ipv6>]:7000: connection was refused`.

The truth, which I had to derive from the error: `tcp_port` is the
gVisor TCP listener inside *each node's own private network namespace*.
When A sends to B, AXL connects to B's Yggdrasil IPv6 expecting B to
be listening on whatever `tcp_port` A is using. So **`tcp_port` must
match across all nodes that talk to each other** — even though
nothing in the docs says so.

**Fix it would help to ship:**
1. `docs/configuration.md`: add a callout under `tcp_port` saying
   "MUST match across all peers; this is a virtual port inside each
   node's gVisor stack, not a host port. Mismatched values produce a
   `connect tcp [...]:NNN: connection refused` error from `/send`."
2. Better error message: include both nodes' `tcp_port` in the failure
   string so the mismatch is diagnosable from one log line.
3. Refuse to start if `tcp_port` is set differently from a connected
   peer's announced value (or warn loudly).

### Default `tcp_port: 7000` is undocumented

Related: the default port is `7000` per `docs/configuration.md`'s
table, but the table doesn't make clear that this is a virtual port,
and `node-config.json` examples in the README don't mention it at all.
Easy to assume it's optional and let the default ride — which works,
but only if every node in your mesh agrees.

### `X-From-Peer-Id` is suffix-padded with `f`s

Verified output of `/recv` after a successful send:

```json
{ "from": "745cc664cf501ea239a81193d02abfffffffffffffffffffffffffffffffffff",
  "body": "hello B from A over the mesh" }
```

The first 32 hex chars match the sender's actual public key prefix; the
remainder is `ff` padding. I worked around it by comparing prefixes,
but a developer expecting an exact match against `/topology`'s
`our_public_key` (64 chars, no padding) will get confused. Either:
1. Return the full 64-char hex key, or
2. Document the truncation+padding explicitly.

## Documentation gaps

### No "two-node hello world" in the repo

The README's Quick Start shows how to run *one* node. The
`Configuration` doc shows a hub-and-spoke LAN example. Nothing
demonstrates **the minimum scenario the bounty actually requires**:
two nodes on the same machine peered to each other, exchanging a
message. I had to derive it from the example configs + API doc + the
Yggdrasil convention that `Listen` is asymmetric.

A 30-line `examples/two-node-localhost.md` would save every hackathon
team the same hour I spent. Even better: ship a `docker-compose.yml`
or a `make demo` target.

### No "what kinds of apps is AXL good for" page

The README pitches AXL as P2P transport for AI/agentic apps but
doesn't draw the contrast against the obvious alternatives:

- vs. Redis pub/sub: no central broker
- vs. libp2p: simpler API, fewer protocol primitives
- vs. WebRTC data channels: server-side friendly, no browser dependency
- vs. plain TCP + TLS: handles peer discovery, no port forwarding

Without that, "P2P encrypted transport" reads as ideology. With it,
the engineering case is obvious.

### No SDK in Node / Python

The HTTP API is so simple that an SDK is almost unnecessary — but
"call `fetch('/send')` from Node" is what every JS team will do, and
they'll all rewrite the same 30 lines (handle binary body, set
`X-Destination-Peer-Id`, validate hex, poll `/recv`, retry on 204).
Even a tiny official `@gensyn/axl-client` package with three methods
(`topology()`, `send(peerId, body)`, `recv()`) would standardize the
shape of the wrapper and reduce drift across submissions.

Same for Python.

### `/mcp` and `/a2a` examples are correct but unguided

The API doc shows curl examples for MCP and A2A, but doesn't explain
*why* you'd use one over the other or how to register a service on the
receiving node. For a hackathon team picking AXL, the natural question
is "how do I expose my agent's tools to peers?" — and the docs jump
straight to the JSON-RPC envelope without the conceptual setup.

A short "Your first MCP service over AXL" walkthrough — define a
single tool, register it on node B, call it from node A — would
unblock the realistic use case.

## Feature requests

1. **Bootstrap node discovery.** Right now you either know peer IPs
   ahead of time or you run a public node. A small DHT or rendezvous
   service ("connect to public bootstrap node, fetch active peers
   sharing tag X") would let agent operators publish presence without
   running infrastructure.
2. **Persistent inbox.** `/recv` is fire-and-forget after the queue
   drains. For agents that crash and restart, an opt-in
   "store-and-forward" mode (retain N messages or T seconds) would
   prevent message loss on reboot. Could be a separate sidecar.
3. **Rate limiting / backpressure.** A peer that floods my `/recv`
   queue can OOM me. Per-peer rate limits + queue size caps as config
   options would close the obvious DoS surface.
4. **TLS cert pinning per-peer.** Right now the trust model is "first
   key wins". Letting me pin known peer pubkeys at config time
   (refuse to peer with anyone else) would harden the mesh against a
   compromised public bootstrap node injecting a malicious peer.
5. **Prometheus metrics endpoint.** `/metrics` exposing peer count,
   bytes in/out, queue depth, etc. Operators will want this on day
   one in production.
6. **Structured logs.** Logs are currently human-readable but
   unstructured (no levels, no timestamps in some lines). JSON logs
   behind a flag would slot into the standard observability stack.

## Comparisons

### vs. Redis pub/sub
- **AXL wins:** no broker to run, end-to-end encrypted, no shared
  trust domain.
- **Redis wins:** persistence, fan-out groups, well-known operations
  story, every dev already knows the API.
- **Verdict:** AXL is right when "no central server" is a hard
  constraint (decentralized swarm, censorship-resistant agent net,
  cross-org collaboration without a shared cloud account). Redis
  wins everywhere else.

### vs. libp2p
- **AXL wins:** much simpler API surface (3 endpoints vs.
  protocols/streams/peerstores). Zero JS-side libraries needed.
- **libp2p wins:** browser support via js-libp2p, protocol negotiation,
  larger ecosystem.
- **Verdict:** AXL feels like libp2p that picked an opinion on every
  protocol slot — refreshing for hackathon velocity, but you'll outgrow
  it if you need browser peers or custom stream multiplexing.

### vs. plain TCP/TLS between known IPs
- **AXL wins:** no port forwarding, NAT traversal handled, identity
  derives from public key not IP.
- **TCP wins:** zero new infra, full control of wire format.
- **Verdict:** if your two endpoints already have public IPs and
  static infra (e.g. two cloud VMs you own), plain TCP is fine. AXL
  earns its keep when nodes are mobile, ephemeral, or behind NAT.

## What this kitchensink does NOT exercise (intentional)

- **More than two nodes.** Two-node mesh is the trivial case for
  Yggdrasil's tree routing. A 3-node ring or hub-and-spoke would
  surface routing behavior.
- **Public node bootstrap.** All testing was on `127.0.0.1`. A real
  public node ($4-6/mo droplet, port 9001 exposed) is the next step.
- **MCP / A2A.** The structured layers on top of `/send`/`/recv` are
  documented but not driven by this kitchensink. Natural follow-up.
- **Authorization.** No signing of message contents at the AXL layer
  beyond the TLS link. Apps that need per-message provenance (e.g.
  "this message really came from agent X owning iNFT Y") would layer
  signature verification on top.
- **0G Storage / ENS / AgenticID interop.** The interesting apex
  combination — agent identity via ENS subname (or 0G AgenticID)
  bound to the AXL ed25519 key, with large payloads in 0G Storage —
  is one layer up from AXL itself.

## Decision impact

For my apex project, AXL is the only credible candidate for the
**transport layer between agents** (Kai on a laptop, Sol on a VPS,
six Paperclip agents in a worker pool). The realistic alternative
(SSH + REST or Redis on a shared VPS) would either require everyone
in the same trust domain or a central server I have to babysit. AXL
removes both constraints with one binary.

The bounty rule "communication across separate AXL nodes" lands
naturally because the apex genuinely *is* a multi-node swarm — not
a single-process system that adds AXL for show. If anything, AXL is
the only sponsor whose primitive feels load-bearing rather than
cosmetic for my use case.

The combination I'm scoping for Phase 2: **ENS subnames for agent
identity + service discovery (text records: pubkey, endpoints,
services), AXL for transport between those agents, KeeperHub for
managed scheduled execution, 0G Storage for large payloads
(transcripts, RAG context).** Four sponsors, each in its actual
function, no decoration.
