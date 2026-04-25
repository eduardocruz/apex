# apex

ETHGlobal Open Agents (2026-04-24 → 2026-05-06).

Solo build by Eduardo Cruz, with Claude Code (Opus 4.7) as coding assistant.
See `AI-USAGE.md` for the audit log and `CLAUDE.md` for the attribution rule.

## What this repo is

A two-phase build:

**Phase 1 — kitchensink.**
Sequentially numbered, dated folders under [`kitchensink/`](./kitchensink),
each exploring one sponsor SDK or one technical question end-to-end. No
fixed cadence — the unit is the exploration, not the day. Pattern
borrowed in spirit from Jennifer Dewalt's "180 websites in 180 days":
minimum deliverable + immutable timestamp. Goal is ambient familiarity
with the stack before committing to a project.

See [`kitchensink/README.md`](./kitchensink/README.md) for the index of
explorations completed so far and what each one demonstrates.

**Phase 2 — apex.**
Project lands in `apex/` once partner alvo is locked. Starts whenever
kitchensink has produced enough signal. Aborts if kitchensink reveals a
blocker that invalidates the planned tech.

## Kickoff date

2026-04-24 (kickoff was actual). Repo created 2026-04-25.

## Sponsors in scope

Currently evaluating:

- **0G** — Compute, Storage, ERC-7857 Agentic ID
- **Uniswap** — `pay-with-any-token` (x402/MPP via swap)
- **Gensyn AXL** — P2P agent communication
- **ENS** — agent identity via subnames
- **KeeperHub** — onchain execution layer (MCP server)

Final partner alvo: TBD by day 7.

## Submission

Final deliverables (per ETHGlobal + sponsors):
- Working demo (live or recorded)
- Demo video — length per ETHGlobal/sponsor specs (e.g. 0G requires under 3 min)
- Public GitHub repo with README and architecture
- AI-USAGE.md (this repo's audit log)
- Submitted via ETHGlobal dashboard before 2026-05-06 16:00 UTC

## Status

Phase 1 active. Two sponsors explored end-to-end so far (Uniswap,
KeeperHub) — see [`kitchensink/`](./kitchensink) for the live demos.
