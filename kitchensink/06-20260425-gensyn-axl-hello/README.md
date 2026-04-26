# 06 — Gensyn AXL: two nodes talking over the P2P mesh

**Date:** 2026-04-25
**Goal:** Spin up two AXL nodes on this machine with separate ed25519
identities, get them peered, and exchange a message in both directions —
the minimum that satisfies the bounty rule "communication across separate
AXL nodes, not just in-process."

## Why this is the hello world

The Gensyn prize at ETHGlobal Open Agents requires **AXL** (Agent eXchange
Layer) to be the actual message bus, not a substitute for one. AXL is a
single Go binary that gives any application an encrypted P2P transport —
built on Yggdrasil for routing + gVisor for a userspace TCP/IP stack — so
nodes can talk to each other without a central broker, port forwarding, or
TUN device.

The smallest meaningful demo is two nodes:

1. **Node A** — listens on `tls://127.0.0.1:9001` for incoming peers.
2. **Node B** — peers outbound to A.

Each node has its own ed25519 keypair, its own gVisor TCP stack, and its
own local HTTP API bridge. They share nothing except the TLS link they
negotiate at startup. Sending a byte from A to B forces the message
through the mesh — exactly the path a real multi-agent system would use.

## What's in here

```
README.md             this file
install.sh            clones gensyn-ai/axl + builds ./axl-bin/node
start.sh              generates keys, starts both nodes + proxy, writes .pids
stop.sh               kills everything via .pids
node-config-a.json    listener config
node-config-b.json    peer config (peers to A's listener)
server.js             tiny Node http proxy + serves index.html on :5959
index.html            two-pane UI: refresh topology, send, receive
package.json          type: module, no npm dependencies
.gitignore            axl-src/, axl-bin/, *.pem, logs
```

## Run it

Requires Go (any modern version — Go's toolchain auto-fetches `go1.25.5`)
and Node 18+.

```bash
cd kitchensink/06-20260425-gensyn-axl-hello
./install.sh        # one-time: ~80 MB of Go deps + 16 MB binary
./start.sh          # starts node A, node B, and the UI on :5959
# open http://localhost:5959
```

The UI:

1. Click **Refresh topology** on each node — both should show the other's
   public key in the `peers` list.
2. Click **Send** with the default A→B message.
3. Click **Receive** on node B — the message comes back with
   `X-From-Peer-Id` matching A's public key.
4. Flip direction and confirm the same in reverse.

Stop with `./stop.sh`.

## Verified output

Topology after `./start.sh` (truncated):

```json
// node A /topology
{
  "our_public_key": "745cc664cf501ea239a81193d02aab328ab0e83135e8d85adcd3ebb5c7861630",
  "peers": [{ "uri": "tls://127.0.0.1:62425", "up": true, "inbound": true,
              "public_key": "a4d81e51..." }]
}
// node B /topology
{
  "our_public_key": "a4d81e51e2d50fe56683a92633f0b49b221c8fc1f8abafd47ac3d9874c19a6b7",
  "peers": [{ "uri": "tls://127.0.0.1:9001", "up": true, "inbound": false,
              "public_key": "745cc664..." }]
}
```

Send A→B + receive on B (verified):

```bash
$ curl -s -X POST http://localhost:5959/api/send -H "Content-Type: application/json" \
    -d '{"from":"a","toPeerId":"a4d81e51...","message":"hello B from A over the mesh"}'
{"ok":true,"status":200,"sentBytes":"28"}

$ curl -s http://localhost:5959/api/recv/b
{"from":"745cc664...","body":"hello B from A over the mesh"}
```

## What's intentionally non-obvious

**`tcp_port` must match on both nodes.** This bit me first time — I set
A=`7000`, B=`7001` thinking they were host-level ports. They're not.
`tcp_port` is the gVisor TCP listener inside *each node's* private
network namespace. When A sends to B, AXL connects to B's Yggdrasil IPv6
on port 7000 (or whatever B's `tcp_port` is set to), expecting that's
where B is listening *inside its own gVisor stack*. If they don't match,
you get `connect tcp [<peer-ipv6>]:7000: connection was refused` — which
looks like a port collision but is actually a virtual-port mismatch.
**Both configs use `tcp_port: 7000`. The host-level distinction is the
TLS port (`9001`) and the API ports (`9002` / `9012`).**

**Listener vs peer is asymmetric.** Only the listener needs `Listen`
populated — peers connect outbound. This isn't intuitive coming from
something like libp2p where everyone's symmetric. AXL inherits this from
Yggdrasil's hub-and-spoke convention: one node exposes a port, others
dial it; once the link exists, mesh routing is symmetric.

**Identities persist via PEM files.** `start.sh` generates `private-a.pem`
and `private-b.pem` on first run. They're gitignored. If you delete
them, the nodes get fresh public keys on the next start — you'd have to
update everything that hardcoded the old key (a real swarm wouldn't,
because they'd discover keys via the network, but the demo UI fetches
them at runtime so this is fine).

## Why a proxy server in front

A single static HTML page can't hit two different `localhost` ports
(9002, 9012) without CORS pain — so `server.js` runs on `:5959`, serves
the UI, and forwards each call to whichever node the UI asks for. The
proxy adds nothing semantically — it's only there because browsers don't
let you do `fetch('http://127.0.0.1:9012')` from a page loaded off
`http://127.0.0.1:9002`. Driving the nodes directly with `curl` (as in
the verified output above) bypasses it entirely.

## What this does NOT exercise (intentional, for a hello world)

- **`/mcp/{peer}/{service}`** — AXL's built-in MCP routing. Would need a
  local MCP server registered on each node. Logical next step.
- **`/a2a/{peer}`** — Agent-to-Agent JSON-RPC envelope. Same wire as
  MCP, different protocol surface.
- **More than two nodes.** A 3-node ring or hub-and-spoke would actually
  exercise Yggdrasil's tree routing — two nodes is point-to-point, the
  trivial case.
- **A public node.** `Listen: ["tls://0.0.0.0:9001"]` + a real IP/port
  exposed to the internet. Required to bootstrap a fresh permissionless
  network.
- **Persistent message queues, retries, ack semantics.** AXL is
  fire-and-forget — `/send` returns `200` once bytes leave; the receiver
  has to be polling `/recv` or the message is dropped after the queue
  flushes.

Each of these is a natural extension. The point of /06 is to prove the
two-node mesh works end-to-end — so when an apex multi-agent design
needs P2P, you can reach for AXL with confidence rather than guessing.

## Decision impact

AXL is the **transport primitive** for Gensyn's track ($5,000 total —
$2,500 first place). For an apex project, it's worth integrating if:

- The agent design is genuinely multi-agent (not one orchestrator + N
  tool-callers, which is just a fan-out).
- Agents need to discover each other dynamically, not via a static
  registry.
- You want communication to survive without a central broker — e.g. for
  an offline-friendly swarm or a censorship-resistant agent network.

If your apex is a single agent + a frontend, AXL is dead weight. The
honest test: would the design *break* if you replaced AXL with a Redis
pub/sub channel? If the answer is "no, just less decentralized," AXL is
ideology, not architecture.

The natural combo for apex: **AXL + 0G AgenticID** — agents have
on-chain identities (ERC-7857) and discover each other via their
ed25519 public keys, which are derived from / bound to the iNFT.
That gives you a P2P mesh of *cryptographically verifiable* agents, not
just anonymous nodes. Pull either out, the architecture loses meaning.

## Notes on the AXL build

`install.sh` clones `gensyn-ai/axl` to `axl-src/` (gitignored) and runs
`go build` into `axl-bin/node` (also gitignored). Build is ~30 seconds
on M-series silicon, ~80 MB of Go deps cached in `~/go/pkg/mod`.
`Makefile` pins `GOTOOLCHAIN=go1.25.5`; if you have an older Go, the
toolchain auto-fetches.

If you re-run `install.sh`, it short-circuits when `axl-bin/node` already
exists. To force a rebuild, `rm -rf axl-bin axl-src` first.
