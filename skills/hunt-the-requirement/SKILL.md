---
name: hunt-the-requirement
lane: hunt
---

# hunt-the-requirement

Default skill. Trigger: every session, every "revenue", every "what next", and whenever a lane closes.

## Rule

Find a requirement a payer has already posted with money committed. Only then build. A product without a posted requirement is Band 4 and closed.

## Where requirements with money attached live

- Per-finding payout programs: AI/LLM bug bounties, OSS bounty programs, audit contests.
- Funded challenges with published problem statements: government innovation challenges, central-bank and ministry hackathons, defence challenges.
- Prize pools with a public spec and metric.
- Grants and tenders with a published scope and budget.

## Procedure

1. Check Taskman's `packages/core/territory/registry.js`. A killed lane stays killed under any name.
2. For each candidate, answer the eight tests in `CHARTER.md`. Any "no" drops it.
3. Read the venue's terms before scoring. An automation ban changes what we can build.
4. Rank: pay-per-valid-output, then shortlist funding, then winner-take-all. Drop swarmed winner-take-all.
5. Write each survivor into `LANES.md`: payer, requirement, money, deadline, what Taskman builds, rail, open gates, source.

## Output

The lanes, scored, with one recommendation and the first build step. No customer list, no outreach draft.

## Kill

A lane dies when the deadline passes, the pool is swarmed, the terms forbid our method, or the rail cannot reach the operator. Record why in `LANES.md`.
