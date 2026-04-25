# CLAUDE.md — apex (ETHGlobal Open Agents)

## Commit attribution rule

ETHGlobal Open Agents requires transparency about AI tool usage. Every commit
created by an AI assistant in this repo MUST include a Co-Authored-By trailer.

Use exactly this trailer (no variations):

    Co-Authored-By: Claude Code <noreply@anthropic.com>

This applies to **every** commit where Claude Code wrote code, suggested code
that was kept verbatim, or generated config/docs. Human-only commits don't
need the trailer.

## AI-USAGE.md

Per the hackathon's audit policy, the repo also maintains AI-USAGE.md at root
listing each AI-assisted file/section. Update it as you go, not at the end.

## Kitchensink discipline

The first phase of this repo is exploration, not execution. Each exploration
gets its own folder under `kitchensink/`, numbered sequentially and dated:

    kitchensink/NN-YYYYMMDD-<sponsor-or-topic>/
        README.md       # what was tried, what worked, what didn't
        <code>          # minimal working artifact

No fixed cadence — could be one per day, could be three in an afternoon, could
be a long pause before the next. The unit is the **exploration**, not the day.
What carries weight: each folder is dated when it was done, sequentially
numbered, and contains a runnable artifact + a short README.

The discipline is borrowed in spirit from Jennifer Dewalt (180 websites in 180
days): minimum deliverable + immutable timestamp. The artifact doesn't need
to be impressive — it needs to be dated, public, and runnable.

The hackathon project itself moves to `apex/` once the partner alvo is locked.
Phase 2 starts whenever there's enough signal from kitchensink to commit. Until
then, no premature commitment to architecture.
