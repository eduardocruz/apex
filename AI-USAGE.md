# AI-USAGE.md

Per ETHGlobal Open Agents' audit policy, this file lists every file/section
where an AI assistant wrote, suggested, or substantially shaped the content.
Updated as work happens, not retroactively.

## Conventions

- **Tool:** the assistant used (e.g. `Claude Code (Opus 4.7)`)
- **Mode:**
  - `generated` — assistant wrote it, kept verbatim or near-verbatim
  - `assisted` — human wrote, assistant edited/refactored
  - `reviewed` — human wrote, assistant only reviewed/critiqued
- **Date:** YYYY-MM-DD when the AI contribution landed

## Log

| Date | File | Mode | Tool | Notes |
|------|------|------|------|-------|
| 2026-04-25 | `CLAUDE.md` | generated | Claude Code (Opus 4.7) | Initial repo policy doc |
| 2026-04-25 | `AI-USAGE.md` | generated | Claude Code (Opus 4.7) | This file |
| 2026-04-25 | `README.md` | generated | Claude Code (Opus 4.7) | Initial scaffold |
| 2026-04-25 | `FEEDBACK-uniswap.md` | generated | Claude Code (Opus 4.7) | Uniswap prize submission feedback file (renamed from FEEDBACK.md) |
| 2026-04-25 | `FEEDBACK-keeperhub.md` | generated | Claude Code (Opus 4.7) | KeeperHub $500 feedback bounty submission |
| 2026-04-25 | `kitchensink/01-20260425-uniswap-quote-ui/server.js` | generated | Claude Code (Opus 4.7) | 59-line Node http server, no deps. Loads .env, serves index.html, proxies POST /api/quote to Uniswap. |
| 2026-04-25 | `kitchensink/01-20260425-uniswap-quote-ui/index.html` | generated | Claude Code (Opus 4.7) | 308-line vanilla HTML/CSS/JS. Token dropdowns + form + result panel + raw JSON. Handles CLASSIC + UniswapX response shapes. |
| 2026-04-25 | `kitchensink/01-20260425-uniswap-quote-ui/README.md` | generated | Claude Code (Opus 4.7) | Setup, run instructions, scope notes |
| 2026-04-25 | `kitchensink/01-20260425-uniswap-quote-ui/package.json` | generated | Claude Code (Opus 4.7) | type:module, npm start, no deps |
| 2026-04-25 | `kitchensink/01-20260425-uniswap-quote-ui/.env.example` | generated | Claude Code (Opus 4.7) | Env template |
| 2026-04-25 | `kitchensink/02-20260425-uniswap-v4-pool-state/server.js` | generated | Claude Code (Opus 4.7) | Node http server reading v4 StateView via viem. PoolId computed manually (encodeAbiParameters + keccak256) after `@uniswap/v4-sdk` ESM dir-import error blocked SDK route. |
| 2026-04-25 | `kitchensink/02-20260425-uniswap-v4-pool-state/index.html` | generated | Claude Code (Opus 4.7) | Form with 4 pool config presets + custom fields. Renders price (both directions), tick, fees, liquidity, raw response. |
| 2026-04-25 | `kitchensink/02-20260425-uniswap-v4-pool-state/README.md` | generated | Claude Code (Opus 4.7) | Run instructions + SDK-detour note + v4 conventions enforced |
| 2026-04-25 | `kitchensink/02-20260425-uniswap-v4-pool-state/package.json` | generated | Claude Code (Opus 4.7) | Single dep: viem. ESM. |
| 2026-04-25 | `kitchensink/02-20260425-uniswap-v4-pool-state/.env.example` | generated | Claude Code (Opus 4.7) | Optional ETH_RPC_URL override |
| 2026-04-25 | `kitchensink/03-20260425-keeperhub-rest-hello/watch.sh` | generated | Claude Code (Opus 4.7) | Bash script: loads .env, hits GET /api/workflows/{id}/executions, pipes JSON through Python formatter. |
| 2026-04-25 | `kitchensink/03-20260425-keeperhub-rest-hello/format_executions.py` | generated | Claude Code (Opus 4.7) | Reads KeeperHub executions JSON from stdin, prints a sorted table. Standalone-runnable. |
| 2026-04-25 | `kitchensink/03-20260425-keeperhub-rest-hello/README.md` | generated | Claude Code (Opus 4.7) | Setup steps (UI workflow build + REST observation), capability table, why-not-REST-create note, decision impact. |
| 2026-04-25 | `kitchensink/03-20260425-keeperhub-rest-hello/.env.example` | generated | Claude Code (Opus 4.7) | KEEPERHUB_API_KEY + KEEPERHUB_WORKFLOW_ID template. |
| 2026-04-25 | `kitchensink/04-20260425-ens-resolve-hello/server.js` | generated | Claude Code (Opus 4.7) | Node http server + viem ENS reads (getEnsAddress / getEnsName / getEnsText). Required `normalize` import from `viem/ens` not viem root. |
| 2026-04-25 | `kitchensink/04-20260425-ens-resolve-hello/index.html` | generated | Claude Code (Opus 4.7) | Two-form UI: forward (name→address+text records) + reverse (address→name). |
| 2026-04-25 | `kitchensink/04-20260425-ens-resolve-hello/README.md` | generated | Claude Code (Opus 4.7) | What/why/run + verified output for vitalik.eth. |
| 2026-04-25 | `kitchensink/04-20260425-ens-resolve-hello/package.json` | generated | Claude Code (Opus 4.7) | type:module, single dep: viem. |
| 2026-04-25 | `kitchensink/04-20260425-ens-resolve-hello/.env.example` | generated | Claude Code (Opus 4.7) | Optional ETH_RPC_URL override. |
| 2026-04-25 | `kitchensink/05-20260425-0g-inft-explorer/server.js` | generated | Claude Code (Opus 4.7) | Node http server + viem reads against 0G Galileo Testnet (chain 16602). Reads totalSupply, name, symbol, mintFee, ownerOf, tokenURI, getIntelligentDatas, cloneSource. |
| 2026-04-25 | `kitchensink/05-20260425-0g-inft-explorer/index.html` | generated | Claude Code (Opus 4.7) | Two-panel UI: registry summary + token inspector with quick-pick token IDs. |
| 2026-04-25 | `kitchensink/05-20260425-0g-inft-explorer/README.md` | generated | Claude Code (Opus 4.7) | Surfaces ERC-7857 privacy model: descriptions in clear, values as bytes32 hashes. Verified outputs for tokens 0 (4 fields) and 76 (empty). |
| 2026-04-25 | `kitchensink/05-20260425-0g-inft-explorer/package.json` | generated | Claude Code (Opus 4.7) | type:module, single dep: viem. |
| 2026-04-25 | `kitchensink/05-20260425-0g-inft-explorer/.env.example` | generated | Claude Code (Opus 4.7) | Optional ZG_RPC_URL override. |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/install.sh` | generated | Claude Code (Opus 4.7) | Clone gensyn-ai/axl + go build → axl-bin/node. Idempotent. |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/start.sh` | generated | Claude Code (Opus 4.7) | Generate ed25519 PEMs, start node A (listener) + node B (peer) + UI proxy on :5959. |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/stop.sh` | generated | Claude Code (Opus 4.7) | Kill via .pids + pkill fallback. |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/node-config-a.json` | generated | Claude Code (Opus 4.7) | Listener config (Listen tls://127.0.0.1:9001, api 9002, tcp 7000). |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/node-config-b.json` | generated | Claude Code (Opus 4.7) | Peer config (Peers ["tls://127.0.0.1:9001"], api 9012, tcp 7000 — must match A's tcp_port). |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/server.js` | generated | Claude Code (Opus 4.7) | Tiny Node http proxy: serves index.html, forwards /api/topology/{a,b}, /api/send, /api/recv/{a,b} to the right AXL node. |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/index.html` | generated | Claude Code (Opus 4.7) | Two-pane UI: refresh topology, send A↔B, receive. Yellow intro box explaining what AXL is and what the page proves. |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/README.md` | generated | Claude Code (Opus 4.7) | Setup, verified output, gotcha about virtual `tcp_port`, decision impact (ENS+AXL+0G Storage combo for apex). |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/package.json` | generated | Claude Code (Opus 4.7) | type:module, no npm deps. |
| 2026-04-25 | `kitchensink/06-20260425-gensyn-axl-hello/.gitignore` | generated | Claude Code (Opus 4.7) | axl-src/, axl-bin/, *.pem, logs. |
| 2026-04-25 | `kitchensink/README.md` | assisted | Claude Code (Opus 4.7) | Added row 06 (Gensyn AXL) to index. |
| 2026-04-25 | `FEEDBACK-gensyn.md` | generated | Claude Code (Opus 4.7) | Gensyn $5k feedback bounty submission: tools used, what worked, doc gaps (virtual tcp_port not flagged, no two-node hello in repo, no Node/Python SDK), feature requests, comparisons. |
