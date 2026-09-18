# Sellman

Sales department for [Taskman](https://github.com/joyelgeorge/Taskman).

Sellman creates **customers** by selling **live Taskman features**. It does not invite users, collect signups, or grow a waitlist.

> Settlements table is empty. Everything else is commentary.

## Why this repo exists

Taskman already has the engine: scanners, payout audit, four-gate job runner, drones, money-flow gates. What it did not have is a department whose only job is to find a specific human with a confirmed pain and sell them a feature that is already live.

The Taskman brain is explicit:

- Revenue is a row in `settlements` with a real rail and a non-empty `externalRef`.
- Scan is marketing. Fix is the product.
- Human sends every message. Software only prepares.
- Past failure: built supply without a paying demand.
- OSS bounties do not pay. Do not sell them.

Sellman is the staff, the skills, the crons, and the roadmap for that gap.

## What we sell (live only)

| Feature | Price | Rail |
| --- | --- | --- |
| Pre-launch security scan | $99 | [paypal.me/joyelgt/99](https://paypal.me/joyelgt/99) |
| Scan + verified fix PR | $249 or $80-125/finding or 20% contingency | [paypal.me/joyelgt/249](https://paypal.me/joyelgt/249) |
| Taskman Audit (payout CSV, files never leave the page) | $19/mo or $2/batch | [paypal.me/joyelgt](https://paypal.me/joyelgt) |
| Self-serve scan unlock | $5 | live at [scan.html](https://taskman-operator.web.app/scan.html) |

Wired (not for sale): usage metering, four-gate job runner. Ticketed (spec only): lead drones aimed at buyers.

## Hard rules

1. A customer is a buyer of a feature. A user is not a customer.
2. Charge without verify is refused.
3. Never fabricate cash. Null is a valid finance report.
4. Never autosend. `SENT` is a human log.
5. Ticketed work is not an offer. Do not sell the roadmap.

## Layout

```
AGENTS.md          department operating rules
CHARTER.md         what Sellman is and is not
ROADMAP.md         sequence to a real settlement
skills/            sales and marketing skills (gates)
agents/            named workers + charters
infra/crons.md     continuous jobs
```

Skills are written so a Taskman / Claude / Grok session can load them the same way `.claude/skills` is loaded in Taskman.

## Pipeline

```
scout (public signal)
  -> verify-buyer-before-contact
    -> draft-outreach-never-send
      -> human sends and logs SENT
        -> handle-the-reply
          -> price-the-feature
            -> close-to-settlement
```

Every step downstream of a lead has a skill. That is how Taskman stalled. Sellman will not skip a skill.

## Current position (2026-09-18)

- Taskman settlements: **0**
- Strongest lane: payout-audit-direct (live tool, one human marketing action from cash)
- Second lane: vibe-app security scan+fix (live scanner, fail-closed paywall)
- Constraint: human send. The machine cannot originate a trusted relationship.
