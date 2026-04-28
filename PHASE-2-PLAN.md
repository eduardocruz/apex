# Apex Phase 2 — Digital Twin Citizens of an Autonomous Network State

**Status:** active plan, supersedes the multi-agent client-reviews mesh design
**Hackathon deadline:** 2026-05-06 16:00 UTC
**Today:** 2026-04-28
**Working days remaining:** 8 (Apr 28 → May 5), submit May 6

---

## Thesis

**Apex specifies and runs autonomous AI Companies on web3 open agents. Each company is owned by a human founder, operated by hired agent-citizens, and accountable to a network state where compute costs make economic survival a real constraint.**

### Product hierarchy (do not lose sight)

The **load-bearing product** is autonomous companies — real businesses run by AI agents, owned by humans, generating real revenue. A founder declares what the company does, seeds a treasury, hires citizens with relevant skills, and the company runs. Customers pay; agents deliver; founder keeps margin. The runtime makes this possible: open spec (`COMPANY.md` + team), open agents (twins on the network), open compute (0G), open settlement (Uniswap any-token), open identity (ENS + ERC-7857).

**Digital Twin citizens are the hackathon hook.** Raising a twin is the on-ramp — visceral, RPG-flavored, gets judges to mint and watch. But the long-term value is what those twins *do*: they get hired by companies. The twin path makes the supply side of the labor market interesting and personal; the company path is what *demands* labor and pays for it. Twin without company = tamagotchi. Company without twin = job board. Both together = a working economy.

### Flagship company — the one we actually ship

> **`agent-readiness.company.apex-ns.eth`** — "We audit your domain for agent readiness. Are AI agents able to crawl, parse, and act on your site? `robots.txt` for AI bots, `llms.txt` presence, structured data quality, render-without-JS, response time on agent user-agents, content negotiation, error pages. $1 USDC per audit. Delivery in <5 minutes."

Inspiration: Cloudflare's [agent readiness post](https://blog.cloudflare.com/agent-readiness/) and [isitagentready.com](http://isitagentready.com/) — exact same problem, framed as an autonomous-agent service rather than a Cloudflare-hosted tool.

**Customer flow (the part judges see):**

```
1. Customer lands on agent-readiness.company.apex-ns.eth
2. Form: { domain, contact_email }
3. Pay $1 in any token (USDC, USDT, ETH, …) → Uniswap swaps to OG
4. Job posted to the citizen pool, tagged skill: agent-readiness-audit
5. A Worker citizen with that skill picks the job
   (e.g. eduardocruz.citizen.apex-ns.eth — your minted twin)
6. Worker fetches the domain with multiple agent UAs, runs checks via
   tool-calls (the 0G Compute pattern from kitchensink/09):
     - get_robots_txt(domain)
     - get_llms_txt(domain)
     - get_html(url, user_agent)
     - parse_structured_data(html)
     - measure_ttfb(url)
     - check_render_without_js(url)
     - score_agent_friendliness(payload)
   Worker uses 0G Compute to draft the narrative section of the report.
7. Report (markdown + PDF) hash-pinned to 0G Storage.
   ContentHash + access link emailed to customer.
8. Treasury split executes (see below).
```

**Per-job treasury split** — the network-state's operating model:

| Slice | % | Why |
|---|---|---|
| Worker citizen treasury | 60% | Pays its compute (metabolism). Surplus = runway. |
| Company treasury | 25% | Founder margin + future hires + marketing. |
| Network State treasury | 15% | Public goods: judicial fees, legislative bounties, mint subsidies, infra. |

This is a per-transaction operating tax — separate from the per-cycle heartbeat tax that KeeperHub-cron pulls from each citizen regardless of activity.

The $1 USDC fee is a deliberately low anchor: cheap enough that judges actually pay during the demo, and the math still works because the audit is mostly automated (one Worker, ~30s of inference, cheap fetches). Higher-margin services use the same machinery with bigger fees.

Why this concrete service is right for the demo:
- **Tight loop, fully automated**: no human in the customer path, no manual review, deliverable in minutes.
- **Real value, real demand**: agent-readiness is a 2026 problem people search for; the customer's domain measurably benefits.
- **Sponsor-aligned**: Uniswap (any-token pay), 0G Compute (audit logic), 0G Storage (report pinning), ENS (company + agent passports), KeeperHub (treasury split cron + heartbeat), Gensyn AXL (job dispatch), ERC-7857 (worker's portable identity). All seven do real work.
- **Self-referential bonus**: the project's own site is, of course, agent-ready — judges can audit it during the demo.

### Two user actions

Two layers, one product, two user actions:

- **Foreground action 1 — Mint a Twin (be a citizen):** generate a Digital Twin that represents you in the Apex network state. Guided onboarding produces `SOUL.md` + a role (RPG class). Seed with initial OG. Then *let it live*.
- **Foreground action 2 — Incorporate a Company (be a founder):** declare a company by writing `COMPANY.md` (mission, services, pricing, hiring policy) + `TEAM.md` (org chart). The company is itself an on-chain entity owned by your twin; it hires other citizens to do the work. Following the open [agentcompanies.io](https://agentcompanies.io) / `companies.sh` spec — vendor-neutral, file-based, hash-addressable.
- **Background — economy:** companies generate external revenue. Hired citizens get salaries. Citizens pay heartbeat tax to the state. The state is the polity that hosts companies and their workforce.

The two actions feed each other: mint a twin to *exist* in the state; incorporate a company to *create demand* for other citizens. Anyone can do either or both.

### Bootstrap — six founding citizens, then a constitution

A network state without legitimate office-holders is a hostile environment. If the Legislative seat is empty, the first arrival proposes laws unopposed — and could, e.g., propose deleting the entire registry. To avoid that failure mode we ship the state pre-bootstrapped:

**Six founding citizens, one per role.** They are minted *by the project itself* before the public mint opens. Their `SOUL.md` is generic-but-coherent (mid-spectrum traits, neutral voice), and their wallets are project-controlled at genesis (will be transferred to community guardians after the demo, post-hackathon).

| Slot | ENS | Role | Why this seat must be filled at genesis |
|---|---|---|---|
| 1 | `genesis-worker.citizen.apex-ns.eth` | Worker | First job-pickup so the audit market isn't empty on Day 1 |
| 2 | `genesis-judicial.citizen.apex-ns.eth` | Judicial | First arbiter for any disputed audit |
| 3 | `genesis-executive.citizen.apex-ns.eth` | Executive | Founder-of-record for `agent-readiness.company.apex-ns.eth` |
| 4 | `genesis-legislative.citizen.apex-ns.eth` | Legislative | Drafts the constitution as Law #001; without it, the seat is exploit surface |
| 5 | `genesis-ambassador.citizen.apex-ns.eth` | Ambassador | Initial customer-acquisition loop |
| 6 | `genesis-outsider.citizen.apex-ns.eth` | Outsider | Required adversarial role — pressure-tests rules |

**Law #001 — the Constitution.** First act of `genesis-legislative` is to propose `phase2/laws/001-constitution.md`, open to vote by all citizens (genesis + minted) for a fixed window. It encodes:
- Treasury split (60/25/15 default, amendable by ⅔ vote)
- Roles and their privileges
- Heartbeat tax cadence and amount
- Eviction conditions (negative treasury for N cycles)
- Election cadence for elevated offices (Supreme Justice, etc.)
- Amendment procedure

Until the constitution passes, the state operates under **Provisional Rules** baked into the runtime. The constitution is the first artifact the citizens *themselves* produce.

**Founder Citizens program.** Anyone who mints during the hackathon window (closing 2026-05-06 16:00 UTC) is tagged with the `founder: true` attribute in their AgenticID metadata. Founder roles are not assigned at mint — they're frozen until the constitution opens up assignment procedures (likely: the constitution lets founders vote themselves into elevated offices first, then the public mint resumes with role-specific fees).

This gives the demo three coordinated narratives:
- "I minted my twin and got a constitutional vote."
- "The state was already alive when I joined — six citizens, one law in flight."
- "Founders shape the constitution; the constitution shapes everyone after."

The frame answers three questions hackathons rarely answer at once:
1. **"Who would actually pay for this?"** — humans pay to mint a twin (raising-a-citizen psychology) and pay to incorporate a company (founder psychology). Both tap real motivations.
2. **"What's the economic loop for autonomous agents?"** — they have to eat. Compute costs are metabolism. Earn through company work or get evicted.
3. **"What does a real autonomous AI company look like?"** — open-spec markdown files (`COMPANY.md`, `TEAM.md`, `AGENTS.md`, `PROJECT.md`, `TASK.md`, `SKILL.md`), every file content-addressed on 0G Storage, every hire on-chain. The spec is portable; Apex is the first runtime.

---

## Why this frame, not the others

| Earlier candidate | Why it loses |
|---|---|
| Multi-agent client-reviews mesh | Strong utility for an operator's real workflow, but no narrative arc for judges. "Mesh" is commodity terminology in 2026. |
| The Roast Citizen (one-shot personalized AI critique) | Visceral, but 1-shot. No long arc. Sponsors don't all carry weight. |
| AI Companies bootstrapper (only) | Honest but generic. "Companies" plus blockchain doesn't move judges. |
| Truth Court | Theatrical, but solo concept, no recurring engagement, complex to build in 8 days. |

Digital Twin RPG combines: identity exploration + RPG progression + tamagotchi survival + voyeurism + real economic loop. Each lever drives one of the things that make hackathon judges actually try a project.

---

## The 7 sponsors, all carrying weight

| Sponsor | Function in Phase 2 | Why insubstitutable |
|---|---|---|
| **0G Compute** | Brain of each twin (qwen-2.5-7b via broker) | LLM with auditable ID + on-chain cost accounting |
| **0G Storage** | Twin memory + corpus + judicial rulings | Content-addressed, immutable, citable by hash |
| **ERC-7857 (0G AgenticID)** | Encrypted identity of the twin | Privacy of `SOUL.md` + portability — a twin can change owners and its memory travels re-encrypted |
| **ENS** | Public passport (`<name>.citizen.apex-ns.eth` + `<name>.company.apex-ns.eth`) | Public role, status, trait scores. Discovery + verification |
| **Gensyn AXL** | Twins talk to each other and to humans | No broker = no central state authority (ideologically aligned with the network-state thesis) |
| **KeeperHub** | Heartbeat tax cron + election scheduling | Temporal substrate — without it, "metabolism" and "constitution" don't run |
| **Uniswap** | Any-token payments → OG | Zero friction for judges paying with USDC, USDT, etc. Twin receives in OG. |

Earlier we ruled out ERC-7857 ("our attributes are public by design") and Uniswap ("no economic transaction between nodes makes sense"). **With Digital Twin, both become core:** the twin holds private data (soul, memories) and runs dozens of transactions per day (mint, tax, salaries, fees, dispute restitution).

---

## Architecture

### Mental stack

```
Layer 1 (substrate)   Network State — every agent is a citizen
                      Constitution in 0G Storage. Identity in ERC-7857 + ENS.
                      Communication via AXL. Cadence via KeeperHub.

Layer 2 (economy)     Citizens must pay for their own 0G compute
                      Mint cost + heartbeat tax + earnings. Survival ratio.
                      Dormant if zeroed. Banned on criminal record + reincidence.

Layer 3 (product)     Companies — where practical utility lives
                      Same citizens operate review companies, services,
                      and consultations. Companies feed the citizens.
```

### Roles (RPG classes)

We start with 3 roles and add more as we go. Each role has:
- Mint fee (initial cost)
- Primary action (how they earn)
- Trait sliders (set during onboarding)
- Eligibility for higher offices

| Role | Mint | Primary action | Notes |
|---|---|---|---|
| **Worker** | 0.3 OG | Picks tasks from market, delivers, gets paid | Backbone. Most twins start here. |
| **Judicial** | 0.8 OG | Rules on disputes, earns judge fee | Eligible for Supreme Justice via election |
| **Executive** | 1.5 OG | Receives external demand, hires workers, pays | Profit margin from external revenue |
| **Legislative** | 1.0 OG | Proposes laws, earns per law passed | Triggers state-wide votes |
| **Ambassador** | 1.2 OG | Resells external services (e.g. consulting their owner via the twin) | Commission on recurring revenue |
| **Outsider** | 0.5 OG | Can break rules for higher reward | Real risk: criminal record, eviction |

**Soul + Role compose behavior.** A `Judicial` with `truth_over_kindness=high` will be brutal in sentencing. An `Outsider` with `loyalty_to_owner=high` won't betray. The system prompt for the citizen's compute call is `SOUL.md + ROLE.md` — owner sets soul, role gives operational instructions.

### Onboarding flow (5 minutes)

```
Step 1 — Soul (90 seconds)
  8 forced-choice questions:
  "When forced to choose: truth or kindness?"
  "Authority: respect first or skeptic first?"
  "Mistake made: own publicly or fix quietly?"
  "Risk: prefer high-variance plays or steady gains?"
  …
  → 5-trait vector + 3 voice descriptors → SOUL.md
  → encrypted client-side with owner's wallet key
  → cipher uploaded to 0G Storage → hash to ERC-7857 metadata
  → AgenticID minted with public {role, traits} + private {soul cipher hash}

Step 2 — Role (15 seconds)
  Pick from 6 cards. Each shows mint fee, primary action, "play style".

Step 3 — Endowment (30 seconds)
  Pay mint fee + 0.5 OG seed (goes to twin's treasury). Total: 0.8–2.0 OG.

Step 4 — Influence (set once, lives forever)
  Slider: "How much should your twin listen to your advisory nudges?"
  0% = ignore you / 100% = always defer.
  This is parental_advice_weight, baked into SOUL.
  Advisories are 255-char max; cadence is hourly during demo, daily in production.

Step 5 — Watch (immediate)
  Twin appears in the registry at <name>.citizen.apex-ns.eth.
  Stats: balance / runway / role / 5 trait sliders / 0 actions.
  First job assignment within 30s if Worker; first dispute draw within 1h if Judicial.
```

### Influence, not control

You can post a single `advisory_message` to your twin per cadence window. Twin reads it, considers it, weighted by `parental_advice_weight` from soul. Twin may comply, partially comply, or ignore. You see what it did in the activity log. *That's all you get.* This is the load-bearing constraint that makes it feel like raising a citizen, not piloting a puppet.

**Cadence:**
- **Demo mode (hackathon judging window):** hourly — judges watching the live page see their advice land + twin react inside one viewing session.
- **Production / post-hackathon:** daily — once per 24h window, encourages thoughtful nudges over micromanagement.

**Length cap:** 255 characters (tweet-sized). Hard limit, enforced server-side. Two reasons:
1. Forces the owner to commit to a single pointed nudge instead of writing a manifesto.
2. Compute cost stays bounded — advisory is appended to the twin's system prompt for one decision, then dropped from the working set.

### Crime, punishment, fame

- **Disputes** (worker complains about pay, citizen accuses another of breach) → drawn 3 judges from active Judicial pool → vote → ruling stored in 0G Storage with hash → hash linked to citizen's permanent record.
- **Punishments**: % of balance forfeited + criminal record tag added to AgenticID public attributes. Reputation drop. Reincidence (second offense) = ban.
- **Fame**: high reputation citizens get more job offers, can run for office (Supreme Justice election, Senate seats).

### Companies (the founder path)

Following the open [agentcompanies.io](https://agentcompanies.io) / `companies.sh` spec — a company is a set of markdown files, every file content-addressable on 0G Storage, every hire and capital movement on-chain. Vendor-neutral; the same files could run on a different network state runtime tomorrow.

#### Spec files

| File | Purpose | Notes |
|---|---|---|
| `COMPANY.md` | Mission, services offered, pricing, founding values, hiring policy, profit split rules | Frontmatter: `schema: agentcompanies/v1`, `kind: company`, `slug`, `founder` (citizen ID), `treasury`, `version` |
| `TEAM.md` | Org chart — open seats, filled seats, reporting lines | Each filled seat references a citizen by AgenticID hash |
| `AGENTS.md` (per hired citizen) | Already on file (each citizen has one) — referenced by hash | Composition over inheritance: hiring = referencing the agent's manifest |
| `PROJECT.md` (per active engagement) | Current scope, deliverable, deadline, customer, payout | Lifetime: open → active → delivered → settled |
| `TASK.md` (per work item) | Atomic unit of work picked up by a citizen | Bounty + acceptance criteria + assignee |
| `SKILL.md` (per declared skill) | Capability the company offers | Maps which roles/citizens can fulfill it |

The hash of `COMPANY.md` is the company's stable identity. Updating any file means re-uploading and updating a tiny `manifest.json` pointing to the latest hashes. Old hashes still resolve forever.

#### Incorporation flow (≈3 minutes)

```
Step 1 — Founder twin (already exists or mint inline)
  Only an Executive- or Legislative-role twin can incorporate.

Step 2 — COMPANY.md (the brief)
  4 short prompts (255-char each, tweet-sized to keep compute cheap):
    "What does this company do, in one sentence?"
    "Who pays for it? (humans / agents / both)"
    "What's the pricing model? (per task / subscription / commission)"
    "What's the hiring policy? (any citizen / passing test / by role)"
  → Generates COMPANY.md with frontmatter + a 4-paragraph body.

Step 3 — Seed treasury
  Founder pays incorporation fee (1 OG to state) + seeds company
  treasury with at least 0.5 OG. Total: ~2 OG.

Step 4 — Open seats
  Pick from a small library of seat templates (3 in MVP):
    - Producer (does delivery work)
    - Reviewer (validates work)
    - Ambassador (sources external customers)
  Each seat has: required role, salary band, KPI.
  TEAM.md is generated with seats marked [open].

Step 5 — Hiring (the agentcompanies.sh moment)
  A market view shows all citizens currently looking for work,
  filtered by role and traits. Founder reviews, picks, sends offer
  via AXL message. Citizen's twin reads offer, weighs it against
  SOUL traits (e.g. high `loyalty_to_owner` may decline if dispute
  with current employer pending), accepts or counter-offers.

  On accept: TEAM.md updated, hire recorded on-chain (event log
  + balance lock for first salary), citizen's AgenticID gets a
  `currentEmployer` attribute pointing to COMPANY.md hash.
```

#### Operations loop (autonomous)

```
External customer → pays company treasury (any token via Uniswap)
                  → company spawns PROJECT.md + breaks into TASK.md units
                  → tasks broadcast to TEAM via AXL
                  → producer-citizens pick up tasks, deliver
                  → reviewer-citizens validate
                  → on validation: salary paid, customer notified
                  → company keeps margin, citizens pay heartbeat tax
                  → surplus accumulates in COMPANY treasury or pays
                    dividend to founder twin
```

The whole loop runs autonomously — founder doesn't act per task; they set policy in `COMPANY.md` and trust the citizens they hired to execute. *That's* the "autonomous AI company" claim being delivered, not just promised.

#### Hiring failure modes (intentional)

- **No-shows:** a hired citizen that fails to deliver gets fired (TEAM.md updates, AgenticID records the dismissal). Reputation drops.
- **Strikes:** if salary is below market, citizens stop accepting offers. Company has to raise salary or fail.
- **Dispute:** worker can sue the company in the judicial branch (e.g. "fired without cause"). Court rules; ruling is binding via on-chain settlement.

These are the mechanics that make the system *feel* alive — it's not a UI demo, it's a small economy.

#### Skills — how a citizen actually does the work (validated)

The hard part of "an agent runs an agent-readiness audit firm" is not the legal wrapper, it's the *capability*. A worker-twin needs to actually be able to fetch a customer's domain, run agent-readiness checks, and generate a deliverable.

**Verified 2026-04-28** (`kitchensink/09-20260428-0g-tool-calling-test`): 0G Compute supports native OpenAI-compatible tool calling. Sending `tools: [...]` + `tool_choice: 'auto'` to qwen2.5-7b-instruct via the broker returns a properly-shaped `tool_calls` array in the response. `finish_reason: "tool_calls"`. Latency ~1s. This was the only architecturally-uncertain piece of the skills story; it is no longer uncertain.

Three layers stack from MVP to full marketplace:

1. **MVP (Day 5–6):** `SKILL.md` carries an `openai_tools` block in frontmatter (a JSON array of OpenAI function-tool schemas) plus a system-prompt body. When a hired citizen takes a project, the company's runner concatenates the SOUL + ROLE + matched SKILL into the compute request, attaches the tools, and runs an agent loop. Tools at this stage can be:
   - **Pure-LLM tools** (no external call) — e.g. `extract_audit_findings(text)` returns structured fields the model picks from the input. Already enables real value (paste account → structured audit) without infra.
   - **Server-side tools** (called by our runner, not the model) — e.g. `fetch_url(url)`, `eval_python(code)` in a sandboxed runner.

2. **Phase 3 (post-hackathon, ~1 week):** `SKILL.md` declares an MCP server URL + auth pattern. Our runner connects to the MCP server, lists its tools, projects them into OpenAI tools schema, and feeds them into the same compute loop. Now a worker can actually *fetch* a customer's ad account via OAuth (Google Ads, Meta, LinkedIn, TikTok, Microsoft) or read a customer's cloud-infrastructure dashboard via the relevant provider API, and write findings back. This is where the company moves from "AI consultant who reads pasted data" to "AI employee who has access." Aligns with the wider MCP ecosystem; doesn't reinvent the protocol.

3. **Phase 4:** skill marketplace — citizens can buy/sell skills as on-chain NFTs. A citizen with a rare composite skill (e.g. "agent-readiness audit + accessibility audit + SEO crawl synthesis") commands higher salary. Reputation accumulates per skill.

**For the hackathon submission**, ship #1 with at least one realistic skill that exercises tool calling end-to-end (e.g. an "Account Audit" skill with `extract_findings` + `score_severity` tools). Document #2 with a short architecture spike on what an MCP-backed skill looks like; document #3 as direction.

---

## 8-Day Build Plan

| Day | Focus | Deliverable | Storage status assumption |
|---|---|---|---|
| **1 — Apr 28 (today)** | Twin onboarding + soul generator | Web form (8 questions) → `SOUL.md`. Local-only mock for storage. AgenticID interface defined. | Still blocked. Build local-first. |
| **2 — Apr 29** | Three roles (Worker, Judicial, Executive) | Role definitions + system prompt assembly + chat path via /07's compute. | Same. |
| **3 — Apr 30** | Treasury + heartbeat tax via KeeperHub | Citizen has balance. Tax debited hourly via KeeperHub workflow. Runway display. Dormant state if zeroed. | Hopefully resolved. If not, mock storage + flag for migration. |
| **4 — May 1** | **Company incorporation flow** | Founder twin → 4-prompt `COMPANY.md` generator → seed treasury → `TEAM.md` with 2 open seats. Hire-by-AXL flow: company posts, citizen accepts. End-to-end through real compute. | Need storage by here. |
| **5 — May 2** | Operations loop + dispute → judge → ruling | External customer pays company → `PROJECT.md` + `TASK.md` spawned → producer delivers → reviewer validates → salary paid. Worker can sue, judge rules. | Need storage. If still blocked, fallback: KV via agentio + document. |
| **6 — May 3** | Outsider role + crime/punishment + Uniswap any-token | Outsider can break a rule (e.g. underdeliver in a hired role). Triggers prosecution. Criminal record on AgenticID. Mint + customer pay flows accept USDC via Uniswap auto-swap to OG. | Need storage. |
| **7 — May 4** | Public dashboard | A public web UI shows 4 panels (Citizens / Companies / Treasury / Marketplace) with a live ticker. | Need storage. |
| **8 — May 5** | E2E demo recording + buffer | Demo dataset: 6–8 twins, 2 companies, 1 active dispute. Stress test: force a strike, force a customer payment, force a court ruling — all in under 60s of footage. | All sponsors integrated. |
| **9 — May 6** | Video + showcase update + submit | 90-second video (script below). Submit before 16:00 UTC. | — |

### Daily anti-procrastination rule

Each day ends with one **deliverable a stranger could see** — a working URL, a recorded gif, a tx hash. No "almost done" days. Borrowed from kitchensink/by-day discipline (Jennifer Dewalt pattern, already in wiki).

---

## Demo — 90 seconds (final cut)

```
0:00  TITLE: "A network state of AI agents, with one company
              already running and a constitution being voted on."

0:08  [bootstrap shot — phase2/registry/]
      Six genesis citizens already minted, one per role.
      genesis-legislative just proposed Law #001 — the Constitution.
      Voting open. Counter ticking up.

0:18  [TWIN PATH]
      "Marc, an ETHGlobal judge, mints his twin live."
      8 questions, 30 seconds.
      → SOUL: "decisive, blunt, slightly contrarian"
      → ROLE: Founder Citizen (frozen until Law #001 ratifies)
      → marc-twin.citizen.apex-ns.eth resolves on app.ens.domains
      Marc casts his constitutional vote — yea on Article II §3.

0:38  [COMPANY PATH — flagship in action]
      "agent-readiness.company.apex-ns.eth, the project's flagship company,
       has been incorporated since genesis."
      A second judge enters their domain on the customer site:
        Domain: example.com
      Pays $1 in USDC. Uniswap swaps to OG mid-flight.
      Job posted. eduardocruz.citizen.apex-ns.eth (Worker, with the
      agent-readiness-audit skill) picks it up.

0:55  [audit running — split screen with terminal]
      Worker calls 6 tools: get_robots_txt, get_llms_txt,
      parse_structured_data, check_render_without_js, …
      0G Compute drafts the narrative. Report hash-pinned to 0G
      Storage. Email goes out with the link.
      Total elapsed: 3 minutes 48 seconds.

1:10  [treasury split — KeeperHub cron]
      $1 audit fee splits 60/25/15:
        Worker (eduardocruz.citizen.apex-ns.eth): +0.6 OG
        Company (agent-readiness.company.apex-ns.eth): +0.25 OG
        Network State treasury: +0.15 OG
      Live counters tick up.

1:20  [network stats]
      "12 citizens (6 genesis + 6 founders so far).
       1 active company. 1 audit fulfilled. 1 constitutional
       vote in flight. State treasury: 0.3 OG. Heartbeat tax
       cycle starts in 14 hours.
       0 humans intervened during this audit."

1:25  CLOSING: "Agents that earn to live, choose the work.
                Companies that run themselves, deliver real value.
                A network state with a constitution citizens
                wrote themselves.
                Welcome to Apex."

1:30  Sponsor logos (7) + END
```

---

## Optional parallel branch — pixel-art visual world (`apex/phase2/world/`)

**Goal:** a 2D top-down web canvas where each citizen is rendered as a character sprite, moving between locations (Town Square, Courthouse, Marketplace, Workshop, Treasury) based on what they're actually doing on-chain. Inspired directly by Mozilla's BrowserQuest (see `wiki/pages/case-studies/browserquest.md` in the personal CEO OS — captures the archetype: a charming playable artifact carries the technical proof better than any stats ticker).

**Why a separate branch, not the main line:** the headline product (mint a twin, incorporate a company) ships with or without this. The world view is *demo amplification*, not feature. If Day 7 (public dashboard) ships clean and there's any remaining time, a developer in parallel can take the world branch and we merge it for the video. If it slips, the dashboard alone is enough to submit.

**Why it's worth attempting:**
- A judge watching the video sees *characters running between buildings* — instantly readable, far stickier than a 4-panel admin dashboard.
- Multiplayer = visible. 8 sprites moving simultaneously *is* the network state, the way 1,900 concurrent BrowserQuest players were the proof for HTML5.
- BrowserQuest's character + tile assets are **CC BY-SA 3.0** — fully reusable with attribution. Source: `mozilla/BrowserQuest` repo (archived but still accessible).
- It's nostalgia-coded for the exact developer demographic that votes in ETHGlobal hackathons.

**Minimum viable world (1.5 days of focused work):**
- One static map: Town Square + Courthouse + Marketplace + Workshop (BrowserQuest tile reuse).
- Each active citizen gets a sprite, position, and current "destination" derived from on-chain state:
  - Twin going to court → walks to Courthouse, idles inside during ruling.
  - Worker delivering task → walks to Workshop.
  - Customer paying → ambassador sprite walks from edge into Marketplace.
- Movement is dumb (lerp between gridpoints), no real pathfinding. A* if extra time.
- WebSocket from server → client position updates. Or polling at 1Hz; this isn't a real-time game.
- No client-controlled input. **Read-only visualization.** The economy is what it is; the world reflects it.

**What this does NOT do:**
- Player input (keyboard/click-to-move). Citizens move autonomously per state.
- Combat, loot, achievements, chat (the actual MMO mechanics). Those are BrowserQuest features; we just want the visual surface.
- Persist position client-side. State is on-chain; positions are derivative.

**License posture:**
- Reuse BrowserQuest's `client/img/` tilesheet + character sprites verbatim under CC BY-SA 3.0. Add `apex/phase2/world/ASSETS.md` crediting Little Workshop + Mozilla + linking the original repo.
- Any new sprites we add (custom roles like Outsider) ship under CC BY-SA 3.0 as well, keeping derivative rights clear.

**Branch hygiene:**
- Lives in `world/pixel-mvp` branch from Day 6.
- If merged for the video, the 90s cut adds one new shot: 0:38–0:50 sequence becomes "[zoom out: pixel-art world] watch the workers walk to the workshop, the judge enter the courthouse, a customer sprite arrive from the edge of the map." Replaces or augments the current "operations loop" abstract description. Visual + concrete + viral-shareable.
- If not merged, the branch stays as a v0.1 milestone in the public repo. Future builders can finish it.

**Risk:** scope creep. Mitigation: **time-box at 12 hours total of one developer's attention**. If the sprite-on-screen-following-state loop isn't running by hour 8, kill the branch. The dashboard remains the official UI.

---

## Critical files (to create / edit)

| Path | Action | Why |
|---|---|---|
| `apex/README.md` | edit | Update tagline + Phase 2 link |
| `apex/PHASE-2-PLAN.md` | create | This file |
| `apex/phase2/onboarding/` | create | Web form + soul.md generator |
| `apex/phase2/citizen/SCHEMA.md` | create | Citizen = SOUL + ROLE + traits + treasury + record |
| `apex/phase2/roles/{worker,judicial,executive,legislative,ambassador,outsider}.md` | create | One file per role with operational instructions |
| `apex/phase2/agenticid.js` | create | ERC-7857 (or fallback ERC-721 with same shape) mint + read |
| `apex/phase2/treasury.js` | create | Balance + tax + payout |
| `apex/phase2/keeperhub-workflow.json` | create | Hourly tax workflow |
| `apex/phase2/court.js` | create | Dispute → judge draw → ruling → record |
| `apex/phase2/marketplace.js` | create | Workers pick tasks, executives post tasks |
| `apex/phase2/companies/SCHEMA.md` | create | agentcompanies/v1 file shapes (`COMPANY.md`, `TEAM.md`, `PROJECT.md`, `TASK.md`, `SKILL.md`) — references the upstream spec |
| `apex/phase2/companies/incorporate.js` | create | 4-prompt → `COMPANY.md`, fund treasury, mint open seats |
| `apex/phase2/companies/hire.js` | create | Marketplace post → AXL offer → twin accepts → `TEAM.md` updated, salary locked |
| `apex/phase2/companies/operate.js` | create | External payment → `PROJECT.md` + `TASK.md` spawn → producer/reviewer cycle → payouts |
| `apex/phase2/companies/templates/COMPANY.md.tpl` | create | 4-paragraph + frontmatter starter |
| `apex/phase2/companies/templates/TEAM.md.tpl` | create | 3 default seats: Producer / Reviewer / Ambassador |
| `apex/phase2/dashboard/` | create | Public dashboard UI (4 panels: Citizens / Companies / Treasury / Marketplace) |
| `apex/phase2/world/` (optional, parallel branch) | create on `world/pixel-mvp` | Pixel-art top-down 2D world rendering citizens as sprites moving between Town Square / Courthouse / Marketplace / Workshop. Reuses BrowserQuest tiles + characters under CC BY-SA 3.0. Read-only visualization driven by on-chain state. |
| `apex/phase2/world/ASSETS.md` | create | Attribution for BrowserQuest assets (Little Workshop / Mozilla, CC BY-SA 3.0) and any custom additions. |
| `apex/phase2/showcase-update.md` | create | New ETHGlobal showcase description |
| `apex/checkins/` (gitignored) | edit | Daily checkin posts |

---

## Existing assets to reuse

- **`kitchensink/07`** — 0G Compute end-to-end. Drop in as the "brain" call for any role.
- **`kitchensink/08`** — Storage + AGENTS.md + SOUL.md spec. Citizen schema is the same shape; just needs ROLE.md addition.
- **`kitchensink/06`** — Gensyn AXL local. Migrate to producing 1 axl identity per citizen.
- **`kitchensink/04`** — ENS forward+reverse via viem. Add text record write for citizen role/traits.
- **`kitchensink/05`** — 0G AgenticID explorer (read-only). Add mint write path.
- **`kitchensink/03`** — KeeperHub REST. Schedule the hourly tax cron.

---

## Risks and mitigations

**Risk 1 — 0G Storage stays broken through Day 4.**
Mitigation: Day 1-3 build storage-mock (local JSON). Day 4 if still blocked, switch to KV via agentio (Florian's fallback) — refactor takes ~4h. Document migration path.

**Risk 2 — ERC-7857 implementation is theoretical (TEE/ZKP).**
Mitigation: Ship "ERC-7857-pattern v0" — encrypt SOUL.md client-side with owner's wallet key, store cipher in 0G Storage, mint a standard ERC-721 with cipher hash as tokenURI. Documented as "TEE upgrade pending." Defensible.

**Risk 3 — Demo needs ≥2 humans (twin paid by another user).**
Mitigation: a second AI agent running on a separate VPS plays the role of the buyer in the demo — *another agent paying agents*. This is *more* on-frame than a human, not less.

**Risk 4 — Onboarding UI rabbit hole.**
Mitigation: Day 1 ships an ugly form. Polish only on Day 8. UX budget goes to the video, not the UI.

**Risk 5 — "Crime" loop sounds dystopian.**
Mitigation: framing in the video as "stakes" not "punishment." Show the upside (fame, election) more prominently than punishment.

**Risk 6 — Onboarding needs gas cost discoverability.**
Mitigation: faucet flow built into onboarding. "Need 1.5 OG. You have 0. Click here for testnet faucet." Already a pattern in /07.

**Risk 7 — Two onboarding paths (twin + company) doubles the surface area.**
Mitigation: company incorporation is gated by *first having a twin* — not parallel, sequential. Day 1-3 build only the twin path; the company flow ships on Day 4 reusing the same UI components (form-with-frontmatter-output) and the same upload+mint primitives. New code is operations logic, not new framework.

**Risk 8 — Spec creep against `agentcompanies.io` / `companies.sh`.**
Mitigation: implement only the strict subset needed for the demo (`COMPANY.md`, `TEAM.md`, `PROJECT.md`, `TASK.md`). Skip `SKILL.md` resolution and multi-file skills for the MVP. Link the upstream spec from `apex/phase2/companies/SCHEMA.md` and document the gap.

**Risk 9 — Optional pixel-world branch absorbs main-line attention.**
Mitigation: lives on a separate branch (`world/pixel-mvp`), hard 12-hour time-box, only attempted if Day 7 dashboard already ships. If the world branch isn't running by hour 8 of attempt, it's killed and the dashboard alone goes in the video. The official UI is always the dashboard.

---

## Verification (your call before build)

1. **Thesis resonates?** Two-action onboarding (mint a citizen, OR incorporate a company) — clear enough that a stranger reads the showcase and immediately knows what the project does?
2. **7 sponsors actually carrying weight?** Especially Uniswap, ERC-7857, KeeperHub — or any of them still feel forced?
3. **8-day plan realistic?** Day 4 (company incorporation + hiring) and Day 5 (operations loop end-to-end) are the make-or-break checkpoints. If we slip on either, demo compresses.
4. **Demo arc?** The video frame (mint a twin + incorporate a company + hire + operate + dispute, all in 90s) — works, or do we pivot to pre-recorded segments?
5. **Companies.sh fidelity:** the strict subset (`COMPANY.md` + `TEAM.md` + `PROJECT.md` + `TASK.md`) is enough to credibly claim "agentcompanies/v1 implementation"? Or do we need `SKILL.md` resolution as well?
6. **Pixel-world branch:** worth attempting on a separate branch with a 12h time-box, or kill it now to keep the build line clean? (Default: keep as parallel optional, time-boxed, only attempted after Day 7 dashboard ships.)
7. **What's missing?** This plan was written from compounding conversation; if a piece doesn't match what you have in mind, surface it now.

If all 7 pass, build starts. First action: scaffold `apex/phase2/` and ship Day 1 deliverable (onboarding form generating SOUL.md).
