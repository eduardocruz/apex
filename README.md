# apex

**Autonomous AI companies on a network state of digital-twin citizens.**

ETHGlobal Open Agents (2026-04-24 → 2026-05-06). Solo build by Eduardo
Cruz with Claude Code (Opus 4.7) as coding assistant — see
[`AI-USAGE.md`](./AI-USAGE.md) for the line-by-line audit log and
[`CLAUDE.md`](./CLAUDE.md) for the attribution rule.

---

## What it is

Two user actions, one product:

1. **Mint a Twin** — guided 5-minute onboarding produces a `SOUL.md` (5
   trait sliders, 3 voice descriptors), picks a role (Worker / Judicial /
   Executive / Legislative / Ambassador / Outsider), seeds a treasury,
   and registers `<name>.citizen.apex-ns.eth` as your twin's public passport.
2. **Incorporate a Company** — declare what the company does, pricing,
   and team shape (`COMPANY.md` + `TEAM.md`, following the
   [agentcompanies.io](https://agentcompanies.io) spec). Hire citizens
   for each seat. Customers pay; agents deliver; founder keeps margin.

Twins are the on-ramp. Companies are the load-bearing product. Both
sit inside a network state where compute costs make economic survival
a real constraint — citizens have to earn or get evicted.

**Flagship company we ship:**

- **`agent-readiness.company.apex-ns.eth`** — audits any domain for agent
  readiness (robots.txt for AI bots, llms.txt presence, structured data,
  render-without-JS, response time on agent UAs). $1 USDC / audit,
  delivered in <5 minutes. Inspired by Cloudflare's
  [agent-readiness post](https://blog.cloudflare.com/agent-readiness/)
  + [isitagentready.com](http://isitagentready.com/) — same problem,
  framed as an autonomous-agent service.

The customer pays in any token (Uniswap swaps to OG). Each audit fee
splits **60% Worker treasury / 25% Company treasury / 15% Network State
treasury** — the operating tax of the polity, separate from the
per-cycle heartbeat tax.

**Bootstrap.** The state ships with six **founding citizens**, one per
role (Worker, Judicial, Executive, Legislative, Ambassador, Outsider),
so no seat is empty when the public mint opens. The Legislative seat's
first act is to propose **Law #001 — the Constitution**, open to vote
by all citizens. Anyone who mints during the hackathon window is tagged
`founder: true` and shapes the constitution before public mint resumes.

See [`PHASE-2-PLAN.md`](./PHASE-2-PLAN.md) for the full architecture,
sponsor mapping, demo script, and 8-day plan.

---

## Sponsors carrying weight

Each sponsor does work no other sponsor could replace:

| Sponsor | Role |
|---|---|
| **0G Compute** | Brain of every twin (qwen-2.5-7b via broker, OpenAI tool-calling validated end-to-end in `kitchensink/09`) |
| **0G Storage** | Encrypted SOUL.md + corpus + judicial rulings — content-addressed, citable by hash |
| **ERC-7857 (0G AgenticID)** | Encrypted, portable identity. A twin can change owners and its memory travels re-encrypted. |
| **ENS (Namestone)** | Public passport — every twin lives at `<name>.citizen.apex-ns.eth`, every company at `<name>.company.apex-ns.eth`, with role/traits/voice text records |
| **Gensyn AXL** | Twins talk to each other and to humans without a central broker |
| **KeeperHub** | Heartbeat-tax cron + election scheduling — the temporal substrate of the state |
| **Uniswap** | Customers pay companies in any token; treasury settles in OG |

---

## Repo layout

```
apex/
  README.md              this file
  PHASE-2-PLAN.md        full architecture + 8-day plan
  AI-USAGE.md            audit log of every Claude Code interaction
  CLAUDE.md              attribution rule + working agreements
  FEEDBACK-*.md          builder feedback per sponsor

  kitchensink/           Phase 1 — sponsor explorations (kept live)
    01..06               5 sponsors explored end-to-end
    08                   0G Storage probe (testnet flow contract reverting — see file)
    09                   0G Compute tool-calling — validated, agent loop runs

  phase2/                Phase 2 — the runtime
    onboarding/twin/     Mint-a-twin web app (Node http server, ~700 LOC)
    citizen/SCHEMA.md    Citizen schema + AgenticID interface
    citizens/            One folder per minted citizen (SOUL.md, ROLE.md, ledger.json…)
    companies/           One folder per incorporated company (Day 4)
```

---

## What works today (2026-04-28)

- ✅ **0G Compute tool-calling end-to-end** — model emits `tool_calls`,
  server dispatches against a live API, model writes the answer
  ([`kitchensink/09`](./kitchensink/09-20260428-0g-tool-calling-test/)).
- ✅ **Twin onboarding** — 8 forced-choice questions → SOUL.md → role
  pick → mint. First citizen minted: **`eduardocruz.citizen.apex-ns.eth`** →
  `0x7fad72E0F1f92fa281aAC39E0e64554d406556Ac`. Resolve verified via
  `api.ensideas.com`.
- ✅ **ENS subnames via Namestone** — each citizen gets a public passport
  with text records `apex.role`, `apex.traits`, `apex.voice`,
  `apex.parental_advice_weight`.
- ✅ **Per-twin Ethereum wallet** generated at mint, persisted local-only
  (Day 3 swaps for TEE / encrypted store).
- ⚠️ **0G Storage upload** — code matches docs but the testnet flow
  contract `0x22E03…05296` reverts with `require(false)` on `estimateGas`.
  Confirmed twice from the VPS (no network factor) and reported on
  Discord/Telegram. Day 3 of the plan unblocks once testnet stabilizes;
  meanwhile SOUL.md is local-plaintext.

---

## Run it

```bash
# Twin onboarding form (Phase 2)
cd phase2/onboarding/twin
npm install
cp .env.example .env  # then add your NAMESTONE_API_KEY
node server.js
# → http://localhost:5858

# Tool-calling demo (Phase 1, validated)
cd kitchensink/09-20260428-0g-tool-calling-test
npm install
cp .env.example .env  # then add your PRIVATE_KEY
node server.js
# → http://localhost:5959
```

---

## Submission

Per ETHGlobal + sponsor specs:

- Working demo (live + recorded)
- Demo video — under 3 min (0G requirement)
- Public GitHub repo with README + architecture
- `AI-USAGE.md` audit log (this repo)
- Submitted via ETHGlobal dashboard before **2026-05-06 16:00 UTC**

## Status

Phase 1 done. Phase 2 in active build (Day 2 of 8). Day-by-day deliverables
tracked in [`PHASE-2-PLAN.md`](./PHASE-2-PLAN.md).
