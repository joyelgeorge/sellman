# Sellman

Requirement hunter for [Taskman](https://github.com/joyelgeorge/Taskman).

Sellman finds requirements that a payer has **already posted with money committed**, and Taskman builds what they ask for. It does not build a product and then look for customers. It does not collect signups, invite users, or grow a waitlist.

> Settlements table is empty. Everything else is commentary.

## Why this repo exists

Taskman's measured history is one failure repeated: build supply, then look for demand, then stall at the payment step. Every lane that died, died there. The payout audit is live and priced, and its bottleneck is "inbound demand, not code."

Sellman turns the direction around. The payer has already said what they need and set the money aside. Sellman's job is to find that, check it is real and open, and hand Taskman a spec to build to.

The Taskman brain still holds:

- Revenue is a row in `settlements` with a real rail and a non-empty `externalRef`.
- A human submits every deliverable. Software hunts and builds.
- Past failure: built supply without a paying demand.

## The direction

```
payer posts requirement + commits money
  -> hunt-the-requirement      (find it, pass the eight tests in CHARTER.md)
    -> LANES.md                (scored, with deadline and build step)
      -> Taskman builds        (to the posted spec, nothing more)
        -> operator submits    (the one human step)
          -> close-to-settlement
```

## Hard rules

1. No posted requirement, no build.
2. No customer-finding, no signups, no waitlists. The payer already exists.
3. Never fabricate cash. A pending bounty or a shortlist is not money.
4. Never autosend or autosubmit.
5. Respect each venue's terms on automation.

## Layout

```
AGENTS.md          operating rules and bands
CHARTER.md         what Sellman is, and the eight tests a lane must pass
LANES.md           open, watched, and killed lanes
ROADMAP.md         sequence to a real settlement
skills/            hunt-the-requirement is the default skill
agents/            named workers + charters
infra/             crons and dated scout reports
```

Retired with the old direction (kept for history, never loaded as a next step): `demand-from-public-signal`, `verify-buyer-before-contact`, `draft-outreach-never-send`, `handle-the-reply`, `selling-the-feature`, `feature-cartography`, `price-the-feature`.

## Current position (2026-09-24)

- Settlements: **0**
- Strongest open lane: 0DIN GenAI bug bounty ($500–$15,000 per valid report, standing program). See `LANES.md`.
- Next build step: once 0DIN's automation terms are read, build a harness that tests in-scope models and drafts reports for the operator to submit.
- Killed: vibe-app security (Taskman, 2026-09-21). Scouted and dropped: seller-reimbursement and DPDP kit (free incumbents; also product-first).
