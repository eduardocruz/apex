# kitchensink

Numbered, dated explorations of one sponsor / one technical question
each. Each folder is **self-contained and runnable** — install the
listed dependencies, set the listed env vars, run the listed command.

Pattern: borrow from Jennifer Dewalt's "180 websites in 180 days" —
public cadence, minimum deliverable per artifact, immutable timestamp
in the folder name. The goal isn't to ship a single ambitious thing;
it's to get hands-on with each sponsor's stack before committing the
hackathon project to one.

## Index

| # | Folder | Sponsor | What it does |
| - | ------ | ------- | ------------ |
| 01 | [`01-20260425-uniswap-quote-ui`](./01-20260425-uniswap-quote-ui) | Uniswap | Tiny Node + HTML page that posts to the Trading API and shows a live swap quote (1 ETH → X USDC). Zero npm dependencies, ~150 lines total. |
| 02 | [`02-20260425-uniswap-v4-pool-state`](./02-20260425-uniswap-v4-pool-state) | Uniswap | Reads a v4 pool's state directly from the StateView contract via viem — price, tick, fees, and the *virtual reserves* (translates the raw L parameter into "X ETH + Y USDC backing the spot price ≈ \$Z"). |
| 03 | [`03-20260425-keeperhub-rest-hello`](./03-20260425-keeperhub-rest-hello) | KeeperHub | A scheduled workflow that runs every 5 minutes in KeeperHub's cloud, plus a bash script that pulls the execution history via REST. Demonstrates the "managed scheduled execution" category — runs continue while your laptop is closed. |
| 04 | [`04-20260425-ens-resolve-hello`](./04-20260425-ens-resolve-hello) | ENS | Two-form web UI for forward (name → address + text records) and reverse (address → name) resolution via viem. The atomic primitive underneath agent-identity-via-subnames. |
| 05 | [`05-20260425-0g-inft-explorer`](./05-20260425-0g-inft-explorer) | 0G | Read-only viewer for the AgenticID (ERC-7857) registry on 0G Galileo Testnet. Surfaces what's actually stored when you mint an Agentic ID — descriptions in clear, values as hashes (privacy-preserving by design). |
| 06 | [`06-20260425-gensyn-axl-hello`](./06-20260425-gensyn-axl-hello) | Gensyn | Two AXL nodes running locally with separate ed25519 identities, peered over `tls://127.0.0.1:9001` and exchanging messages in both directions through the gVisor mesh. Tiny Node proxy + HTML UI to drive Send/Receive. The minimum that satisfies the bounty's "communication across separate AXL nodes" rule. |

## Conventions

- **Folder name format:** `NN-YYYYMMDD-<short-slug>`. The number is
  global and monotonic; the date is the calendar day the exploration
  was started.
- **Each folder ships:** `README.md` with what / why / how-to-run,
  source files, `.env.example` if any secrets are needed, no `.env`
  in git.
- **No cross-folder imports.** Copy-paste over reuse. These are
  artifacts, not a library.
- **Commit message style:** `kitchensink/NN: <short description>`.
- **Co-author trailer required:** see [`../CLAUDE.md`](../CLAUDE.md)
  for the ETHGlobal Open Agents AI attribution rule.

## What's missing on purpose

- **No master Makefile or "run all".** Each folder runs on its own.
- **No shared `.env`.** Per-folder `.env`, decided 2026-04-25.
- **No tests.** These are exploratory hello worlds, not production code.

For the wider hackathon project (Phase 2), see [`../README.md`](../README.md).
