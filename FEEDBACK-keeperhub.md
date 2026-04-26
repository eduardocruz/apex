# FEEDBACK-keeperhub.md

Per KeeperHub's "$500 feedback bounty" prize at ETHGlobal Open Agents: this
file documents the builder experience using KeeperHub's product and APIs.
Updated as work happens, not retroactively.

Source kitchensink: [`kitchensink/03-20260425-keeperhub-rest-hello`](./kitchensink/03-20260425-keeperhub-rest-hello).

## Tools used

| Tool                                       | Used where                                          |
|--------------------------------------------|-----------------------------------------------------|
| KeeperHub web app (`app.keeperhub.com`)    | Workflow creation (Schedule trigger + Web3 action)  |
| KeeperHub REST API                         | `GET /api/workflows/{id}/executions`                |
| Turnkey embedded wallet (provisioned)      | Implicit — no signing exercised in this hello world |

## What worked well

- **Signup → first scheduled execution in under 5 minutes.** Visual
  builder, Schedule trigger, Web3 → Get Native Token Balance, Save,
  Enable, Run. Three clicks per node, two nodes, done. The "automatic
  Turnkey wallet provisioning" removed the entire key-management onboarding
  step that every other onchain product makes you trip over first.
- **The Setup Guide on the dashboard is a real onboarding sequence**, not
  decorative. "Generate API key" is step 1, and the key is shown once with
  a clear copy button — exactly the right friction.
- **REST authentication is plain `Authorization: Bearer <key>`.** No
  HMAC, no signed timestamps, no SDK required. `curl` + a workflow ID is
  enough to read execution history, which is the right default for
  observability.
- **Execution detail in the response is rich.** Each execution returns
  `startedAt`, `finishedAt`, `status`, and `output` (with the Web3 action's
  decoded result). Enough to build a status page or alert on without a
  second call.
- **Free-tier defaults are friendly.** Schedule "every 5 minutes" runs
  with no funding step for read-only workflows, no "upgrade to enable
  schedules" wall.

## Bugs

_(None encountered in this hello world.)_

## Documentation gaps

- **The REST API reference does not document the `nodes`/`edges` shape
  for `POST /api/workflows`.** The endpoint exists, but the request body
  is described as "the workflow graph" without a schema. Programmatic
  workflow authoring is therefore reverse-engineering territory — anyone
  wanting to build workflows from a script or LLM has to inspect network
  traffic from the visual builder. Either publish the JSON schema, or
  ship a small `keeperhub-sdk` that wraps it. Without one of those, the
  REST API's surface is "observation only" by default, which leaves the
  agentic-authoring use case (an agent that builds its own KeeperHub
  workflows) stranded.
- **The Direct Execution endpoint** (`POST /api/workflow/{id}/execute`)
  **isn't surfaced clearly enough relative to its power.** It's the
  difference between "workflow as a saved object" and "workflow as a
  one-shot RPC". For agents that don't need persistence, this should be
  promoted to a top-level concept in the docs, not a sub-bullet.
- **The Setup Guide doesn't link to the REST API reference.** After
  generating the API key, the natural next question is "what can I do
  with it?", and the answer requires navigating to a separate docs site.
  A "Try the API" panel right next to the key reveal would close that
  loop.
- **Execution `output` field shape varies by node type and is not
  schema-typed.** For "Get Native Token Balance" it's a string like
  `"1.827670 ETH for 0xd8da6bf2…"`. Useful for humans, harder for
  programmatic consumers — a structured `{token, address, amount,
  unit}` shape with a stable contract would make REST consumers far less
  brittle. (Today, my `format_executions.py` greps the string.)
- **`status` enum values aren't enumerated in the docs.** I observed
  `"success"` but don't know what other states exist (`pending`?
  `running`? `failed`? `timed_out`? `cancelled`?). For dashboards and
  alerts, this is the most important field.

## Feature requests

- **Webhook on execution events.** Polling
  `/api/workflows/{id}/executions` is the right escape hatch, but a
  webhook fired on `success` / `failure` would let a consumer skip
  polling entirely. This is the missing primitive between "schedule a
  workflow" and "react to its result", and it's the difference between
  KeeperHub being a *runner* and KeeperHub being an *eventing layer*.
- **A `keeperhub-mcp` server** (KeeperHub already mentions an MCP server
  is on the roadmap — landing it would let an agent author and observe
  workflows in the same conversation, which is exactly the ETHGlobal Open
  Agents thesis). The visual builder is great for humans; agents need
  the schema-equivalent.
- **A "dry run" mode for scheduled workflows.** Right now, "Run" fires
  an immediate execution and counts toward usage. A dry-run that returns
  what *would* happen, without actually calling the RPC or signing
  anything, would make iterating on workflow logic much cheaper.
- **Per-execution cost / quota visibility in the response.** It's not
  obvious from the dashboard or the REST response how much of my quota
  each execution consumes. For free-tier users this is fine; for anyone
  scaling up, this is the single most important number.

## Comparisons / context

- **Plain RPC + a cron on a server** is the alternative I would have
  reached for. KeeperHub replaces ~6 things: the server, the cron, the
  process supervisor, the key vault, the audit log, and the retry logic.
  For a 5-minute hello world this feels like overkill; for any workflow
  meant to *outlive an attention span* it is exactly the right amount of
  managed.
- **GitHub Actions cron** also schedules things. KeeperHub differs by
  having native onchain primitives (Web3 actions, hardware-secured
  signing via Turnkey, multi-EVM by config flip). A workflow with a
  Schedule trigger + a Web3 action is a few minutes; the equivalent
  GitHub Actions job needs a custom container, secrets management, and
  bring-your-own RPC.

## What I did NOT exercise (for fairness)

- Writing transactions (would need testnet funding).
- Conditional branching nodes.
- Notification nodes (Telegram, Discord, email).
- Block-event triggers (subscribe to onchain events).
- The MCP server.
- Direct Execution endpoint.
- Multi-chain workflows (only Ethereum mainnet read).

Some of the gaps above might already be solved in code paths I haven't
touched. Treating this feedback as a "first impressions" log, not a
comprehensive review.
