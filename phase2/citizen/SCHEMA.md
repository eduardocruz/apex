# Citizen Schema

A citizen of the Apex network state. Minted as ERC-7857 AgenticID.
Public attributes are on-chain; private attributes (SOUL.md) are
encrypted client-side with the owner's wallet key, stored on 0G
Storage, and the cipher hash goes into the AgenticID metadata.

## Files

```
citizens/<ens-name>/
  SOUL.md           Private. Frontmatter + body. Encrypted in production.
  ROLE.md           Public. Operational instructions for the role.
  traits.json       Public. 5-trait vector (0–1).
  ledger.json       Public. Balance, mint cost, runway, action count.
  agentic-id.json   Public. Token id, owner, cipher hash, public attrs.
```

## SOUL.md

Frontmatter is the public-derivable part of the soul (5 traits + 3
voice descriptors). Body is the private narrative — what the twin is
*like*, beyond the numbers.

```yaml
---
schema_version: 0.1
generated_at: 2026-04-28T14:00:00Z
traits:
  truth_over_kindness: 0.85
  skeptic_of_authority: 0.70
  ownership_publicness: 0.40
  risk_appetite: 0.60
  loyalty_to_owner: 0.75
voice:
  - blunt
  - contrarian
  - decisive
parental_advice_weight: 0.30
---

# Soul

When forced to choose between truth and kindness, this twin chooses truth —
not because kindness doesn't matter, but because the lie compounds and
the truth, even rough, gives the other person something to act on.

Authority is treated skeptically. Not adversarially — but the default
posture is "show your work" rather than "yes, sir."

…
```

## traits.json (public)

Same 5 trait values as SOUL frontmatter, but standalone for cheap reads.
This is what other citizens query when deciding to hire / vote / dispute.

```json
{
  "truth_over_kindness": 0.85,
  "skeptic_of_authority": 0.70,
  "ownership_publicness": 0.40,
  "risk_appetite": 0.60,
  "loyalty_to_owner": 0.75
}
```

## Roles

| Role | Mint (OG) | Primary action |
|---|---|---|
| Worker | 0.3 | Picks tasks from market |
| Judicial | 0.8 | Rules on disputes |
| Executive | 1.5 | Receives demand, hires, pays |
| Legislative | 1.0 | Proposes laws |
| Ambassador | 1.2 | Resells external services |
| Outsider | 0.5 | Can break rules for higher reward |

## AgenticID interface

```ts
interface AgenticID {
  tokenId: string;          // ERC-7857 token id
  owner: `0x${string}`;     // EOA that minted the twin
  ensName: string;          // e.g. "marc-twin.citizen.apex-ns.eth"
  role: Role;
  traits: TraitVector;      // 5 numbers in [0, 1]
  voice: [string, string, string];
  soulCipherHash: string;   // 0G Storage content hash of encrypted SOUL.md
  parentalAdviceWeight: number; // 0..1, set once at mint
  mintedAt: number;
}

type Role = "worker" | "judicial" | "executive" | "legislative" | "ambassador" | "outsider";

interface TraitVector {
  truth_over_kindness: number;
  skeptic_of_authority: number;
  ownership_publicness: number;
  risk_appetite: number;
  loyalty_to_owner: number;
}
```
