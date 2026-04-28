# Apex Phase 2 — Build

Where the network-state runtime lives. See `../PHASE-2-PLAN.md` for the
plan; this directory is what actually ships.

## Layout

```
phase2/
  onboarding/
    twin/             Mint-a-twin form (Node http server, ~700 LOC)
    company/          Incorporate-a-company form (Day 4)
  citizens/           Minted twins (one folder per citizen)
                        SOUL.md, ROLE.md, traits.json, agentic-id.json,
                        ledger.json, wallet.json (gitignored)
  companies/          Incorporated companies (one folder per company)
                        COMPANY.md, TEAM.md, …  (agentcompanies.io spec)
  laws/               Network-state laws — markdown + voting metadata
  citizen/SCHEMA.md   Citizen + AgenticID interface
  company/SCHEMA.md   Company schema (Day 4)
```

## Status

| Day | Deliverable | Status |
|---|---|---|
| 1 | Twin onboarding form | ✅ Done |
| 2 | ENS subnames via Namestone (`*.apex-ns.eth`) + per-twin wallet | ✅ Done |
| 3 | SOUL.md encrypted client-side + uploaded to 0G Storage | ⏳ Blocked on testnet flow contract |
| 4 | Company incorporation form + 6 genesis citizens | Next |
| 5 | Worker SKILL.md + agent-readiness audit live | |
| 6 | Treasury split + KeeperHub heartbeat | |
| 7 | Customer site + first paid audit | |
| 8 | E2E demo + buffer | |
| 9 | Video + ETHGlobal submit | |

## Run locally

```bash
cd onboarding/twin
npm install
cp .env.example .env  # add your NAMESTONE_API_KEY
node server.js
# → http://localhost:5858
```

The form generates a SOUL.md, picks a role, mints a per-twin Ethereum
wallet, persists 6 files to `citizens/<slug>/`, and registers
`<slug>.apex-ns.eth` via Namestone (off-chain ENS subname, free, ENS
sponsor partner).

Forward resolution verified via public ENS resolvers — e.g.
[`eduardocruz.apex-ns.eth`](https://api.ensideas.com/ens/resolve/eduardocruz.apex-ns.eth)
points to `0x7fad72E0F1f92fa281aAC39E0e64554d406556Ac`.

## Flagship company

`companies/agent-readiness/` — see [`COMPANY.md`](./companies/agent-readiness/COMPANY.md).
Inspired by Cloudflare's [agent-readiness post](https://blog.cloudflare.com/agent-readiness/)
+ [isitagentready.com](http://isitagentready.com/). $1 USDC per audit,
treasury split 60/25/15.

## Constitution

`laws/001-constitution.md` — Law #001, drafted as the first act of
`genesis-legislative.apex-ns.eth`, open to vote by all citizens once
the 6 genesis citizens are minted.
