# FEEDBACK.md — Uniswap

Per Uniswap Foundation prize requirement at ETHGlobal Open Agents: this file
documents the builder experience using Uniswap's developer tools. Updated as
work happens, not retroactively.

Format inspired by [What Color is Your Function?] structure: each entry is
short, specific, reproducible.

## Tools used

| Tool                                                | Version  | Used where                                |
|-----------------------------------------------------|----------|-------------------------------------------|
| `uniswap-trading` Claude Code plugin                | 1.8.0    | kitchensink/01 (`swap-integration` skill), kitchensink/02 (`v4-sdk-integration` skill) |
| Trading API                                         | v1       | kitchensink/01 (POST `/quote`)            |
| Uniswap v4 StateView contract                       | mainnet  | kitchensink/02 (getSlot0, getLiquidity)   |
| `viem`                                              | ^2.21.0  | kitchensink/02 (RPC reads, ABI encoding, keccak256) |
| Universal Router contract addresses (reference)     | v2       | (read only — not yet executed)            |

## What worked well

- **`POST /quote` returns a complete, displayable answer in a single round
  trip** — pool address, gas estimate in USD, slippage echo, route hops,
  and Permit2 typed data are all in one response. For a frontend that just
  needs to show "1 WETH = X USDC", no follow-up call is required.
- **API key signup at developers.uniswap.org was instant**, no manual
  approval queue. From "I want to try Uniswap" to "I have a working
  quote" was ~5 minutes including signup.
- **Read-only quote works without any chain connection or RPC setup.**
  We were able to verify the integration with `curl` alone, no node
  packages installed.
- **`x-universal-router-version: 2.0` header makes version selection
  explicit at the request level** — easier to reason about than implicit
  routing differences.

## Bugs

_(Bugs found in Uniswap-published artifacts only — not in third-party
infra. Public RPC issues are noted in the v4 pool-state kitchensink's
own README, since they aren't a Uniswap-side problem.)_

## Documentation gaps

- **The `uniswap-ai` GitHub README does not link to the
  developers.uniswap.org Quick start.** Once you reach the developer
  portal, the post-signup page is excellent — a "Quick start" section
  with two tabs (Agent CLI / cURL) and a one-liner you can copy. The gap
  is the path *to* that page. Reading the GitHub repo, a developer
  installs plugins and tries the skill before realizing an API key is
  needed; the skill body mentions it but several screens down. A
  prominent "Get your API key at developers.uniswap.org" line at the top
  of the GitHub README would route people to the portal where the
  experience is already polished.
- **The `swapper` field on `POST /quote` is mandatory but is described
  with language that implies it must be the user's own wallet.** For a
  read-only quote, any valid 0x address (including `0x000…000`) works
  fine. Being explicit about this in the docs would help "I'm just
  evaluating, no wallet yet" use cases — they're common at the start of
  every integration.
- **The `uniswap-trading` skill is ~600 lines** and starts with a
  decision matrix between Trading API / Universal Router SDK / smart
  contract integration. For a developer whose first goal is "show me a
  price quote", this is overwhelming. A 20-line "minimum viable quote"
  fast-path at the top would let beginners see signal before the depth.
- **Two response shapes for `/quote` (CLASSIC vs UniswapX) are decided
  server-side based on chain, pair, size, and timing — there's no
  request-side flag to opt into one or the other.** The skill documents
  this well, but every consumer of `/quote` has to ship branching logic
  on `routing`. A `routing: "CLASSIC_ONLY"` request preference would
  let simple integrations skip the branch.
- **The portal's Quick start cURL example uses `autoSlippage: "DEFAULT"`,
  but the skill describes `autoSlippage` as a boolean.** Both seem
  accepted, but the discrepancy is confusing — is it `true | false`,
  is it the string `"DEFAULT" | "OFF"`, or both? A clear enum specification
  would help.
- **The portal Quick start defaults include three fields the skill never
  surfaces as standard:** `spreadOptimization: "EXECUTION"`,
  `urgency: "urgent"`, and `permitAmount: "FULL"`. If these are the
  recommended defaults, the skill should mention them. If they're
  optional knobs, the portal example shouldn't include them in the
  hello-world curl since they confuse "what's required vs what's tuning".
- **`@uniswap/v4-sdk@1.10.0` fails to load under Node strict ESM** with
  `ERR_UNSUPPORTED_DIR_IMPORT` because internal modules import
  `./entities` (a directory) without resolving to `./entities/index.js`.
  This blocks the `v4-sdk-integration` skill's recommended path on any
  modern Node project that opted into `"type": "module"`. The fix in our
  kitchensink/02 was to drop the SDK and compute `poolId` manually with
  viem (`encodeAbiParameters` + `keccak256`) — works, but means the
  skill's "ALWAYS use Pool.getPoolId()" rule is unenforceable without
  switching the host project to CommonJS or adding a transpiler. Either
  fix the package's import paths to be ESM-strict-compatible, or
  document the workaround in the skill itself.

## Feature requests

_(Specific. Tied to a real use case attempted.)_

## Comparisons / context

_(How this compared to alternatives we tried — relevant only if it sharpens
the feedback.)_
