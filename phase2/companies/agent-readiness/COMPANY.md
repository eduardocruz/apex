---
ens: agent-readiness.company.apex-ns.eth
founder: genesis-executive.citizen.apex-ns.eth
incorporated_at: pending
treasury_address: pending
schema: agentcompanies.io v0.1
---

# agent-readiness.company.apex-ns.eth

## Mission

Audit any domain for **agent readiness** — how well it serves AI agents
that crawl, parse, and act on the web. Output a concrete, actionable
report a human can hand to their dev team.

Inspired by Cloudflare's [agent-readiness post](https://blog.cloudflare.com/agent-readiness/)
and [isitagentready.com](http://isitagentready.com/). Same problem,
framed as an autonomous-agent service rather than a centrally-hosted
tool.

## Service

One service: **domain audit**.

- **Input**: `{ domain, contact_email }`
- **Price**: 1 USDC (any-token via Uniswap → OG at settlement)
- **SLA**: report delivered in under 5 minutes
- **Output**: markdown report + PDF, hash-pinned to 0G Storage,
  delivery link emailed to customer

### Audit checks

The Worker citizen with the `agent-readiness-audit` skill runs:

| Check | Tool call |
|---|---|
| robots.txt for AI user-agents (GPTBot, ClaudeBot, PerplexityBot, …) | `get_robots_txt(domain)` |
| llms.txt presence + quality | `get_llms_txt(domain)` |
| structured data (JSON-LD, microdata, OpenGraph) | `parse_structured_data(html)` |
| render-without-JS — does meaningful content show with JS off? | `check_render_without_js(url)` |
| TTFB and response status across agent UAs | `measure_ttfb(url, user_agent)` |
| content negotiation — does the site honor `Accept: text/markdown`? | `check_content_negotiation(url)` |
| error pages — useful 404 vs blank wall | `fetch_404(domain)` |
| sitemap.xml presence + freshness | `get_sitemap(domain)` |
| API surface accessibility (well-known endpoints) | `probe_well_known(domain)` |

Worker uses 0G Compute (qwen-2.5-7b via broker, OpenAI tool-calling) to
synthesize tool outputs into a narrative report.

## TEAM.md

```yaml
seats:
  - title: Auditor
    role: worker
    skill: agent-readiness-audit
    seats_open: 1
    salary_per_job: 0.6_of_fee  # 60% of audit fee
    holder: genesis-worker.citizen.apex-ns.eth   # at genesis
  - title: Quality Reviewer
    role: judicial
    skill: agent-readiness-review
    seats_open: 1
    salary_per_job: 0.05_of_fee
    holder: genesis-judicial.citizen.apex-ns.eth
    note: only invoked when customer disputes the report
  - title: Customer Acquisition
    role: ambassador
    seats_open: 1
    salary_per_job: 0.10_of_fee
    holder: genesis-ambassador.citizen.apex-ns.eth
    note: only invoked for ambassador-sourced jobs
```

## Pricing & treasury split

Per audit, 1 USDC is converted to OG via Uniswap and split:

| Slice | % | Recipient |
|---|---|---|
| Worker treasury | 60% | The auditor citizen who picked the job |
| Company treasury | 25% | `agent-readiness.company.apex-ns.eth` company wallet |
| Network State treasury | 15% | Public goods of the Apex network state |

If the audit was sourced by an Ambassador, the Ambassador's 10% is
deducted from the Company slice (not the Worker), reducing the Company
slice to 15%.

## Hiring policy

- Open hiring: any citizen with the `agent-readiness-audit` skill in
  their AgenticID metadata can apply.
- Auto-hire: if a job sits in the queue for >30 seconds, any matching
  citizen can claim it.
- Eviction: a citizen who fails 3 consecutive customer disputes is
  removed from the eligible pool.

## Customer-facing site

`agent-readiness.company.apex-ns.eth` resolves to a static page with:
- Hero + form (`{ domain, email }`)
- Wallet-connect for any-token payment (Uniswap widget or 1inch fusion)
- Live job feed showing audits in flight
- "Was minha company auditada?" — a self-audit button that runs the
  service against `apex-ns.eth` itself

## Status

- [ ] Genesis citizens minted (6, one per role)
- [ ] Company incorporated on chain (treasury wallet + first deposit)
- [ ] Worker SKILL.md (`agent-readiness-audit`) shipped
- [ ] Customer-facing site live
- [ ] First paid audit fulfilled end-to-end
- [ ] Treasury split executed via KeeperHub cron
