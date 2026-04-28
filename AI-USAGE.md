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
| 2026-04-28 | `kitchensink/09-20260428-0g-tool-calling-test/test.js` | generated | Claude Code (Opus 4.7) | Single-shot probe: chat completion with one OpenAI-style function tool to qwen2.5-7b-instruct via the broker. Inspects `tool_calls` in the response, prints a verdict, dumps full request/response to a results JSON. |
| 2026-04-28 | `kitchensink/09-20260428-0g-tool-calling-test/README.md` | generated | Claude Code (Opus 4.7) | Documents the question (does 0G pass-through OpenAI tool calling?), the result (yes — `finish_reason: tool_calls`, properly-shaped tool_calls array), and the decision impact for apex/phase2 SKILL.md design (MVP + MCP shim + skill marketplace). |
| 2026-04-28 | `kitchensink/09-20260428-0g-tool-calling-test/server.js` | generated | Claude Code (Opus 4.7) | HTTP server exposing the full agent loop: receives a question, runs the LLM, dispatches `get_weather` against the live Open-Meteo API (free, no auth), feeds the result back, returns the model's final answer plus a turn-by-turn trace. Demonstrates the agent loop pattern that apex/phase2 companies will reuse for skills. |
| 2026-04-28 | `kitchensink/09-20260428-0g-tool-calling-test/index.html` | generated | Claude Code (Opus 4.7) | UI: who-provides-what table (model vs tools vs dispatcher vs protocol), status panel, question input, click-to-send button, final answer in green, turn-by-turn trace (LLM calls in grey, tool dispatches in orange) showing the full round trip. |
| 2026-04-28 | `kitchensink/09-20260428-0g-tool-calling-test/{package.json,.env.example,.gitignore}` | generated | Claude Code (Opus 4.7) | Module setup mirroring /07: type:module, broker + ethers deps, env template pointing reuse to /07. |
| 2026-04-28 | `kitchensink/README.md` | assisted | Claude Code (Opus 4.7) | Added row 09 (0g tool-calling test) to index. |
| 2026-04-28 | `PHASE-2-PLAN.md` | generated | Claude Code (Opus 4.7) | Phase 2 plan for the autonomous-AI-companies pivot. Two user actions (mint a Twin / incorporate a Company), agentcompanies/v1 spec adoption, 8-day build plan, demo script, optional pixel-art world branch. Includes two flagship reference companies (paid-ads audits, devops audits) and SKILL.md design grounded in the /09 result. |
| 2026-04-28 | `phase2/onboarding/twin/index.html` | generated | Claude Code (Opus 4.7) | Twin onboarding form: 8 forced-choice questions → 5-trait vector + 3 voice descriptors, role pick (6 cards), parental_advice_weight slider, ENS name input, mint button. Vanilla HTML+JS, no build. Later upgraded with wallet-connect + EIP-191 personal_sign. |
| 2026-04-28 | `phase2/citizen/SCHEMA.md` | generated | Claude Code (Opus 4.7) | Citizen schema: 6 files per citizen (SOUL.md/ROLE.md/traits.json/agentic-id.json/ledger.json/wallet.json), TypeScript AgenticID interface, role table with mint costs. |
| 2026-04-28 | `phase2/README.md` | generated | Claude Code (Opus 4.7) | Phase 2 build dir overview. Layout, day-by-day status, run instructions, links to flagship + constitution. |
| 2026-04-28 | `phase2/onboarding/twin/server.js` | generated | Claude Code (Opus 4.7) | Node http server, 200+ LOC. Endpoints: GET / (form), GET /registry (citizens view), GET /api/citizens (full records), POST /api/mint (verify owner sig via ethers.verifyMessage, generate twin wallet, persist 6 files, register Namestone subname with text records). |
| 2026-04-28 | `phase2/onboarding/twin/.env.example` + `package.json` | generated | Claude Code (Opus 4.7) | NAMESTONE_API_KEY + APEX_PARENT_ENS env template; type:module, ethers ^6.13.0 dep. |
| 2026-04-28 | `phase2/companies/agent-readiness/COMPANY.md` | generated | Claude Code (Opus 4.7) | Flagship company spec: domain audit service (modeled on Cloudflare's agent-readiness post + isitagentready.com), $1 USDC fee, 9 audit checks via tool-calls, TEAM.md with 3 seats, treasury split 60/25/15, hiring policy. |
| 2026-04-28 | `phase2/laws/001-constitution.md` | generated | Claude Code (Opus 4.7) | 7-article draft constitution: citizens/treasuries/heartbeat tax/roles/elections/founders/amendments. Drafted as the first act of genesis-legislative.citizen.apex-ns.eth. |
| 2026-04-28 | `phase2/scripts/bootstrap-genesis.js` | generated | Claude Code (Opus 4.7) | Idempotent bootstrap of 6 genesis citizens (worker/judicial/executive/legislative/ambassador/outsider). Each gets a role-appropriate trait vector and a generic-but-coherent SOUL.md, tagged genesis: true + founder: true. |
| 2026-04-28 | `phase2/scripts/bootstrap-state.js` + `phase2/state/STATE.md` | generated | Claude Code (Opus 4.7) | Network State treasury bootstrap: generates EOA, registers treasury.state.apex-ns.eth, persists treasury.json (public ledger). STATE.md documents the migration path from provisional EOA → Safe multisig post-constitution. |
| 2026-04-28 | `phase2/onboarding/twin/registry.html` | generated | Claude Code (Opus 4.7) | Citizen registry page: stats panel, sorted citizen cards (genesis first), trait bars, voice pills, treasury balance, owner badges, "Mine only" filter using EIP-1193 wallet connect. |
| 2026-04-28 | `kitchensink/08-20260427-zg-storage-agents/probe-upload.js` | generated | Claude Code (Opus 4.7) | One-shot 0G Storage upload probe to test if testnet flow contract resolved. Confirmed twice from VPS the contract still reverts with `require(false)` on estimateGas. |
| 2026-04-28 | `README.md` | generated | Claude Code (Opus 4.7) | Rewritten for Phase 2: thesis (autonomous AI companies on a network state), flagship company, treasury split, bootstrap section, sponsor mapping, status of what works today. |
| 2026-04-28 | `PHASE-2-PLAN.md` (revisions) | generated | Claude Code (Opus 4.7) | Sequential edits: (a) flagship pivot from paid-ads/devops examples to single concrete agent-readiness company; (b) added Bootstrap section (6 genesis citizens) + Constitution Law #001; (c) renamed all subnames to .citizen.apex-ns.eth / .company.apex-ns.eth namespacing; (d) demo script rewritten to feature the customer flow + treasury split + constitutional vote. |
| 2026-04-28 | `phase2/onboarding/twin/server.js` (rebind endpoint) | generated | Claude Code (Opus 4.7) | Added POST /api/rebind to claim ownership of a citizen minted before the wallet-connect flow shipped. Verifies a "Claim Apex Twin" personal_sign signature, rejects genesis citizens (project-controlled) and citizens that already have a verified owner, then updates agentic-id.json + Namestone apex.owner text record. |
| 2026-04-28 | `phase2/onboarding/twin/registry.html` (claim button) | generated | Claude Code (Opus 4.7) | "Claim ownership" button rendered next to citizens with no verified owner (excluding genesis). Calls /api/rebind with personal_sign output. |
