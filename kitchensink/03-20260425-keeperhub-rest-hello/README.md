# 03 — KeeperHub: scheduled workflow + REST observation

**Date:** 2026-04-25
**Goal:** Show what KeeperHub gives you that a plain RPC + curl can't —
**autonomous, scheduled execution running in their cloud, observable
over REST**.

The hello world is two halves:

1. **Visual builder (3 min, in `app.keeperhub.com`):** create a tiny
   workflow — every 5 minutes, read Vitalik's ETH balance on Ethereum.
2. **REST API (this folder):** ask KeeperHub for the execution history
   and watch the runs pile up by themselves.

The point isn't reading a balance — that's commodity, any RPC does it.
The point is: **the runs in the table below happened on KeeperHub's
servers while my laptop was closed.** That's the category — managed
execution + scheduling + retry + audit log — that you'd otherwise need
to build yourself with a server, a cron, key management, and crash
recovery.

## What's in here

```
README.md             this file (steps + screenshots-described)
watch.sh              runs the REST query + pretty-prints the table
format_executions.py  formatter the bash script pipes into
.env.example          KEEPERHUB_API_KEY + KEEPERHUB_WORKFLOW_ID
```

No npm install. No Node project. Just bash + curl + Python (built-in
on macOS).

## Run it

### One-time setup (you-side, in the browser)

1. Sign up at https://app.keeperhub.com — a Turnkey wallet is
   provisioned automatically. No private key handling, no funding step
   required for read-only workflows.
2. **Generate API Key** from the Setup Guide. Copy it once.
3. **+ New Workflow → Start building.** Wire up two nodes:
   - **Trigger:** Schedule, every 5 minutes (label: "5 minutes").
   - **Action:** Web3 → Get Native Token Balance.
     - Network: Ethereum Mainnet.
     - Address: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (Vitalik).
     - Label: "Vitalik Wallet".
4. **Save** the workflow, then **Enable** it (toggle in the top bar).
5. Click **Run** once to fire an execution immediately, so the REST
   call below has something to show before the first scheduled tick.
6. Copy the workflow ID from the URL
   (`app.keeperhub.com/workflows/<WORKFLOW_ID>`).

### One-time setup (terminal)

```bash
cd kitchensink/03-20260425-keeperhub-rest-hello
cp .env.example .env
```

Edit `.env`:

```
KEEPERHUB_API_KEY=<paste your key>
KEEPERHUB_WORKFLOW_ID=<paste from the workflow URL>
```

### Watch the runs

```bash
bash watch.sh
```

Output looks like this:

```
3 execution(s) for workflow:

  started at                    status     duration  output
  ---------------------------------------------------------
  2026-04-25T23:32:25.520Z      success       431ms  1.827670 ETH for 0xd8da6bf2…
  2026-04-25T23:37:25.000Z      success       402ms  1.827670 ETH for 0xd8da6bf2…
  2026-04-25T23:42:25.000Z      success       418ms  1.827670 ETH for 0xd8da6bf2…
```

Each row was an execution that ran on KeeperHub's infra. No process on
your machine had to be alive when those happened.

## What this proves

| Capability                            | Plain RPC + curl | KeeperHub |
| ------------------------------------- | :--------------: | :-------: |
| Read a balance now                    |        ✅        |    ✅    |
| Run on a schedule, no server of mine  |        ❌        |    ✅    |
| Persistent run history (audit trail)  |        ❌        |    ✅    |
| Retry on transient RPC failure        |        ❌        |    ✅    |
| Hardware-secured wallet for writes    |        ❌        |    ✅    |
| Switch chains (12 EVM) by config flip |        ❌        |    ✅    |

For reads, plain RPC is fine. For *anything that needs to keep running
when you don't*, this is the category.

## What this does NOT exercise (intentional, for a hello world)

- Writing transactions (would need testnet funding).
- Conditional branching (e.g. "alert when balance changes by > X").
- Notifications (Telegram, Discord, email). Each is one extra node.
- Block-event triggers (subscribe to onchain events).
- The MCP server (so an agent can drive workflow creation directly).
- Direct Execution endpoint (for one-shot reads/writes without a
  workflow).

Each of the above is a natural next kitchensink. The point of /03 is
to land the simplest possible "you-don't-have-to-be-running-it" demo
and make the REST observation path concrete.

## Why I created the workflow in the UI, not via REST

The KeeperHub REST API exposes endpoints to create workflows
(`POST /api/workflows`), but the body shape — the `nodes` and `edges`
graph — isn't fully documented for programmatic authoring. Building it
manually would mean reverse-engineering the schema from inspector
traffic, which would burn the same time the visual builder takes
3 minutes. The visual builder is also where KeeperHub's product is
strongest — drag, drop, connect, save.

The REST API earns its keep on the **observation side**:

- `GET /api/workflows/{id}/executions` — full run history, what
  `watch.sh` calls.
- `GET /api/workflows/executions/{exec_id}/status` — real-time progress
  of a single run.
- `GET /api/workflows/executions/{exec_id}/logs` — node-by-node logs
  with input/output for each node.
- `POST /api/workflow/{id}/execute` — trigger a manual run.

That side is well-shaped for tooling and dashboards.

## Decision impact

KeeperHub fits cleanly as the "scheduled / reactive execution layer"
for any apex project that needs to *act* onchain on a cadence without
running a server. Use cases that map to it directly from existing CEO
OS context:

- Task #36 (Monitor Paperclip earn $10) — "every 5 min, check that
  wallet's USDC balance, alert on change" is a literal KeeperHub
  workflow.
- Daily-briefing-style aggregations — "every morning at 7 AM, read X
  contract values, post to a webhook" without a cron on my server.

For the hackathon: this is enough surface to write FEEDBACK.md against,
plus a Combine-with-Uniswap angle (KeeperHub as the layer that fires a
Uniswap swap on a schedule, when conditions are met).
