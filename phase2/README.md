# Apex Phase 2 — Build

Where the network-state runtime lives. See `../PHASE-2-PLAN.md` for the
plan; this directory is what actually ships.

## Layout

```
phase2/
  onboarding/
    twin/         Day 1 — 8-question form → SOUL.md + role pick
    company/      Day 4 — COMPANY.md + TEAM.md generator
  citizens/       Minted twins. Each citizen is one folder: SOUL.md (encrypted
                  in production, plaintext local), ROLE.md, traits.json, ledger.json
  companies/      Incorporated companies. Each is one folder following the
                  agentcompanies.io spec: COMPANY.md, TEAM.md, AGENTS.md,
                  PROJECT.md, TASK.md, SKILL.md
  citizen/SCHEMA.md   The citizen object spec
  company/SCHEMA.md   The company object spec
```

## Day 1 status (2026-04-28)

- [x] Directory scaffolded
- [x] Citizen SCHEMA defined
- [x] Twin onboarding form (8 forced-choice questions → SOUL.md)
- [x] Local-only mock for 0G Storage (download SOUL.md, no upload yet — block from kitchensink/08)
- [x] AgenticID interface defined (TypeScript types)

## Run locally

```
cd onboarding/twin
python3 -m http.server 5858
# open http://localhost:5858
```

No backend, no build. Pure HTML + vanilla JS. The generated SOUL.md
downloads to your machine; in Day 3 we encrypt it with the wallet key
and upload to 0G Storage (when the testnet flow contract unblocks).
