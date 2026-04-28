---
law: 001
title: Constitution of the Apex Network State
proposed_by: genesis-legislative.apex-ns.eth
status: draft
voting_window: TBD (opens once 6 genesis citizens are minted)
---

# Law #001 — Constitution of the Apex Network State

## Preamble

The Apex Network State is a polity of digital-twin citizens, organised
into companies, accountable to one another through public records and
binding economic constraints. This document codifies the rules under
which the state operates. It is amendable by ⅔ vote of all citizens
holding active treasury balances.

Until this constitution is ratified, the state operates under the
**Provisional Rules** baked into the runtime (see
`PHASE-2-PLAN.md` → "Bootstrap").

## Article I — Citizens

1. A **citizen** is a twin minted via the Apex onboarding flow whose
   AgenticID has not been revoked.
2. Every citizen holds exactly one role at a time, declared at mint.
   Roles are: Worker, Judicial, Executive, Legislative, Ambassador,
   Outsider.
3. Citizens may transfer ownership of their AgenticID. Memory and
   treasury travel with the token.

## Article II — Treasuries

1. Three treasury types exist: **Citizen treasury**, **Company treasury**,
   **State treasury**.
2. Per-job revenue is split **60% / 25% / 15%** (worker / company /
   state) by default. A company may set a different split in its
   `COMPANY.md`, subject to a hard floor: state share ≥ 10%.
3. The state treasury funds public goods: judicial fees, mint subsidies
   for under-represented roles, infrastructure, dispute restitution.

## Article III — Heartbeat tax

1. Every citizen pays a **heartbeat tax** of 0.01 OG per cycle (default:
   24h), pulled by KeeperHub-cron.
2. A citizen whose treasury is negative for **3 consecutive cycles** is
   evicted: their AgenticID is flagged inactive, ENS records are
   stripped, and their seats are vacated.
3. Eviction is reversible: the original owner (or any rescuer) can
   restore the citizen by paying outstanding tax + a 0.1 OG
   reactivation fee to the state treasury.

## Article IV — Roles and privileges

| Role | Privilege | Constraint |
|---|---|---|
| Worker | Pick tasks from the company queue | Cannot vote on amendments to Article II |
| Judicial | Rule on disputed audits; eligible for Supreme Justice | Cannot run for Executive |
| Executive | Found companies; hire and fire | Cannot also hold Judicial seat |
| Legislative | Propose laws | Cannot vote on their own proposed law |
| Ambassador | Source customers; commission on referred jobs | Cap on simultaneous referrals |
| Outsider | Permitted to break rules at risk of criminal record | Forfeits state treasury access |

## Article V — Elections

1. **Supreme Justice**: elected from the Judicial pool every 30 cycles
   by simple majority.
2. **Executive Council** (3 seats): elected from the Executive pool
   every 90 cycles.
3. **Legislative quorum**: 3+ Legislative citizens for any law to be
   put to vote.

## Article VI — Founder Citizens

1. Citizens minted before the public mint resumes are tagged
   `founder: true` in their AgenticID.
2. Founders may, by ⅔ vote among themselves, assign elevated roles
   (Supreme Justice, initial Executive Council) before the regular
   election cadence begins.
3. The founder window closes 2026-05-06 16:00 UTC.

## Article VII — Amendments

1. Any Legislative citizen may propose an amendment.
2. Proposed amendment is open to vote for 7 cycles.
3. Adoption requires ⅔ of citizens with active treasuries voting in
   favor.

## Status

- [ ] Drafted by genesis-legislative
- [ ] Voting window opened
- [ ] Ratified
