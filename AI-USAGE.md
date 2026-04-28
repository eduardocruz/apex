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
| 2026-04-27 | `kitchensink/07-20260427-agent-0g-compute-hello/setup.js` | generated | Claude Code (Opus 4.7) | One-time setup: deposit 3 OG into broker ledger (contract min), list inference services, pick a chatbot provider, save selection to `.selected-provider.json`. |
| 2026-04-27 | `kitchensink/07-20260427-agent-0g-compute-hello/server.js` | generated | Claude Code (Opus 4.7) | HTTP agent on :5757. POST /api/chat → 0G Compute provider GPU → reply. GET /api/info shows wallet/provider/model/balance. Uses `@0glabs/0g-serving-broker` + ethers v6. |
| 2026-04-27 | `kitchensink/07-20260427-agent-0g-compute-hello/index.html` | generated | Claude Code (Opus 4.7) | UI: yellow intro box explaining what the page proves, status panel (refreshable), chat box with optional multi-turn toggle, model + latency badge per response. |
| 2026-04-27 | `kitchensink/07-20260427-agent-0g-compute-hello/README.md` | generated | Claude Code (Opus 4.7) | Setup steps, faucet flow, gotcha about 3 OG ledger minimum, what 0G Compute exposes (per-token billing, OpenAI-compat, optional TEE), decision impact for apex. |
| 2026-04-27 | `kitchensink/07-20260427-agent-0g-compute-hello/package.json` | generated | Claude Code (Opus 4.7) | type:module, deps: @0glabs/0g-serving-broker + ethers ^6.13.0. |
| 2026-04-27 | `kitchensink/07-20260427-agent-0g-compute-hello/.env.example` | generated | Claude Code (Opus 4.7) | PRIVATE_KEY (throwaway warning) + ZG_RPC_URL override + PORT. |
| 2026-04-27 | `kitchensink/07-20260427-agent-0g-compute-hello/.gitignore` | generated | Claude Code (Opus 4.7) | node_modules, .env, .selected-provider.json, package-lock. |
| 2026-04-27 | `kitchensink/README.md` | assisted | Claude Code (Opus 4.7) | Added row 07 (0G Compute hello world) to index. |
| 2026-04-27 | `kitchensink/08-20260427-zg-storage-agents/setup.js` | generated | Claude Code (Opus 4.7) | Probes wallet, indexer, broker; picks chatbot provider; writes `.compute-target.json`. Generates a wallet on first run if `.env` is empty. |
| 2026-04-27 | `kitchensink/08-20260427-zg-storage-agents/server.js` | generated | Claude Code (Opus 4.7) | HTTP server on :5757. Endpoints to save (3-file upload to 0G Storage → manifest hash), load (round-trip from hash), and chat with a loaded agent via 0G Compute. `gray-matter` for frontmatter; `indexer.timeout = 180000` (override 30s default). |
| 2026-04-27 | `kitchensink/08-20260427-zg-storage-agents/index.html` | generated | Claude Code (Opus 4.7) | UI: 4-step flow — load templates, save to 0G, load by hash, chat. In-page conversation memory toggle. |
| 2026-04-27 | `kitchensink/08-20260427-zg-storage-agents/templates/AGENTS.md.tpl` | generated | Claude Code (Opus 4.7) | Generic "Apex" persona — agentcompanies/v1 frontmatter + plain operating instructions. |
| 2026-04-27 | `kitchensink/08-20260427-zg-storage-agents/templates/SOUL.md.tpl` | generated | Claude Code (Opus 4.7) | Voice + values + what-the-agent-won't-do. Pairs with AGENTS.md.tpl. |
| 2026-04-27 | `kitchensink/08-20260427-zg-storage-agents/package.json` | generated | Claude Code (Opus 4.7) | type:module, deps: @0glabs/0g-ts-sdk + @0glabs/0g-serving-broker (pinned 0.7.5) + ethers + gray-matter. |
| 2026-04-27 | `kitchensink/08-20260427-zg-storage-agents/.env.example` + `.gitignore` | generated | Claude Code (Opus 4.7) | Wallet/indexer/RPC env template; standard ignores. |
| 2026-04-28 | `kitchensink/08-20260427-zg-storage-agents/README.md` | generated | Claude Code (Opus 4.7) | Initial scaffold + "Current state" section explaining the testnet upload failure (TCP filter from BR ISP; contract revert from clean GCP route). Marked status as ⚠️ NOT WORKING END-TO-END. |
| 2026-04-28 | `kitchensink/README.md` | assisted | Claude Code (Opus 4.7) | Added row 08 (zg-storage-agents) to index. |
| 2026-04-28 | `FEEDBACK-0g.md` | generated | Claude Code (Opus 4.7) | Builder feedback on 0G Compute (positive) and 0G Storage (blocked). Documents 3-OG ledger minimum gotcha, FileHandle GC error, network/contract block diagnosis, and feature requests (HTTPS gateway, `Indexer.health()`, per-call AbortController). |
