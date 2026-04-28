# 09 — Does 0G Compute pass through OpenAI tool calling?

**Date:** 2026-04-28
**Status:** ✓ **Confirmed working.**

## The question

`SKILL.md` in agentcompanies/v1 needs to give worker-citizens real
capabilities — not just text generation. The cleanest path is OpenAI-style
function tool calling: declare tools, model picks one, runner executes,
result feeds back. Standard agent-loop pattern.

`qwen2.5-7b-instruct` (the default chatbot served by 0G Compute) supports
tool calling natively per its model card. The open question was whether
the **0G broker / serving layer** preserves the `tools` and `tool_choice`
fields on the way in, and surfaces `tool_calls` on the way out. If
either is stripped, MCP integration becomes much harder (we'd have to
fall back to text-tagged tool dispatch in our orchestrator).

## What this kitchensink does

Sends one chat completion via the broker, with a `get_weather` function
tool the model is told to call when asked about weather. Inspects the
response for `tool_calls`.

## Run it

```bash
cd kitchensink/09-20260428-0g-tool-calling-test
cp ../07-20260427-agent-0g-compute-hello/.env .env
cp ../07-20260427-agent-0g-compute-hello/.selected-provider.json .
npm install
npm test
```

## Result

```
RESPONSE (HTTP 200, 1013ms):
{
  "choices": [{
    "message": {
      "content": "",
      "role": "assistant",
      "tool_calls": [{
        "function": { "arguments": "{\"city\": \"Recife\"}", "name": "get_weather" },
        "id": "call_3c158d51e1094d15808385",
        "type": "function"
      }]
    },
    "finish_reason": "tool_calls"
  }],
  "model": "qwen2.5-7b-instruct"
}

VERDICT:
  hasToolCalls: true
  toolCallsCount: 1
  contentEmpty: true

✓ NATIVE TOOL CALLING WORKS via 0G Compute.
```

`finish_reason` was `tool_calls`, `content` was empty, `tool_calls` was
populated with a correctly-shaped function call referencing `get_weather`
with parsed arguments. Total ~236 tokens, ~1s round trip.

## Decision impact

This unblocks the apex `SKILL.md` design:

- **MVP** — `SKILL.md` carries `openai_tools: [...]` in frontmatter. Our
  company runner attaches them to each compute call and runs the agent
  loop (model emits `tool_calls` → we execute → push `tool` message →
  loop until `finish_reason: stop`).
- **Phase 3 (MCP)** — `SKILL.md` declares an MCP server URL. Our runner
  lists its tools, projects them into OpenAI tools schema, runs the
  same loop. Standard shim, no special-casing.
- **Phase 4 (skill marketplace)** — skills become on-chain NFTs whose
  payload is the tools schema + system prompt. Reputation per skill,
  citizens can buy/sell.

The architectural risk on the autonomous-companies thesis just dropped
from "TBD, possible blocker" to "validated, standard pattern."

## What is NOT exercised here (yet)

- **Multi-turn agent loop.** This kitchensink does the first hop only —
  model returns `tool_calls`, we don't execute and re-prompt. The full
  loop is straightforward (push a `tool` role message with the result,
  call the endpoint again until `finish_reason: stop`) but lives in the
  apex/phase2 runner, not here.
- **Real tool execution.** `get_weather` here is a probe — we never
  actually look up Recife's temperature. Real skills (audit, fetch URL,
  query Google Ads) get implemented in apex/phase2/companies.
- **MCP integration.** Documented above as Phase 3; not in this
  kitchensink.
- **Other 0G-served models.** Only `qwen2.5-7b-instruct` (the default)
  was tested. Other providers may or may not preserve tool-calling
  fields. Re-verify before relying on a specific provider for production.

## Pricing observation

236 tokens for this round trip. At the 0G testnet rates seen so far
(sub-cent per chat turn), tool calling adds essentially zero per-call
cost — the cost of an agent loop is `(turns × per-turn cost)`, where
each turn is a normal chat completion. Skills that take 4–6 turns to
complete are still in the cents range. Companies built on this can
charge \$0.50 per audit and net comfortably.
