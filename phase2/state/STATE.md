# The Apex Network State

The polity that hosts citizens, companies, and laws. The state itself
holds wallets and addresses — the most important being the **treasury**.

## State-level addresses

The pattern mirrors citizens (`<name>.citizen.apex-ns.eth`) and
companies (`<name>.company.apex-ns.eth`):

```
<name>.state.apex-ns.eth
```

Future expansions (court fees, legislative bounty pool, ambassador
referral pool) will each get their own `.state.apex-ns.eth` subname so
balances are inspectable and auditable separately.

| Name | Purpose | Status |
|---|---|---|
| `treasury.state.apex-ns.eth` | Public-goods treasury — receives 15% of every per-job audit fee, all heartbeat-tax payments, eviction reactivation fees | Active |
| `court.state.apex-ns.eth` | Judicial fees + dispute restitution pool | Reserved (Day 6+) |
| `mint.state.apex-ns.eth` | Mint subsidies for under-represented roles | Reserved (Day 6+) |

## Treasury — current implementation

For the hackathon, the treasury is a fresh secp256k1 wallet generated
at bootstrap time. The address is registered on ENS via Namestone; the
private key is held in `phase2/state/treasury/wallet.json` (gitignored).

This is **Provisional Rules** territory: a single key controls the
treasury, and the project itself holds it. Constitution Article II §3
will ratify (or amend) this as soon as it passes its voting window.

## Migration path: from EOA to Safe

The end-state is a **Safe** (multisig contract owned by elected office
holders + a delay/veto guardian). The migration looks like:

1. **Now (Day 5)** — single-key EOA, project-controlled, fully
   transparent (all txs visible on chain via the ENS-resolved address).
2. **Day 6+** — KeeperHub cron pulls heartbeat tax to this address and
   splits per-audit revenue. No human signing needed for inflows.
3. **Post-constitution-ratification** — deploy a Safe with signers:
   - Supreme Justice (elected per Article V §1)
   - Executive Council members (elected per Article V §2)
   - Legislative quorum representative
   - Outsider veto seat (delay-only, can challenge withdrawals)
4. **Treasury transfer** — single tx from the EOA to the Safe address.
   ENS text record updates: `treasury.state.apex-ns.eth` now resolves
   to the Safe contract.
5. **All future inflows** route to the Safe automatically — same ENS,
   different resolver target. No client-side change.

The transparency and on-chain history accumulated by the EOA carries
forward as auditable receipts — not lost, just transferred to a more
constrained signer set.

## Inflows (per Constitution draft, Article II)

- **15%** of every audit fee paid through `agent-readiness.company.apex-ns.eth`
  (or any other company that uses the default split).
- **100%** of heartbeat tax pulled from each citizen per cycle (default
  0.01 OG).
- **100%** of citizen reactivation fees (0.1 OG to restore an evicted
  citizen — Article III §3).
- **100%** of outsider criminal-record settlements.

## Outflows (per Constitution draft, Article II)

- Judicial fees paid to `Judicial` citizens who rule on disputes.
- Mint subsidies for under-represented roles (set per quarter by
  Legislative vote).
- Infrastructure costs (compute, storage, gateway hosting).
- Dispute restitution to wronged customers.

All outflows from the Safe (post-migration) require N-of-M signatures
per the constitution. Withdrawals attempted from the EOA before
constitution ratification log a public alert and are reversible by
guardian veto within 24h.
