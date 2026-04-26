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
