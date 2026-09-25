# Sellman charter

## One sentence

Sellman hunts requirements that a payer has already posted with money committed, then builds what the requirement asks for. It never builds first and hunts buyers after.

## The direction

```
payer posts requirement + commits money  ->  Sellman finds it  ->  Taskman builds to it  ->  submit  ->  payout
```

Never the reverse:

```
build a product  ->  find customers  ->  sign them up  ->  hope they pay        (killed)
```

## Is

- A hunt for **posted requirements**: bounties, prize pools, per-finding payout tables, funded challenges, grants and tenders with a published problem statement.
- A lane list (`LANES.md`) scored on one question: *is the money already committed to this requirement?*
- A builder's queue: each open lane names what Taskman has to make and the deadline.
- Agents that hunt and build. The operator's own account submits and receives payment.
- A ledger that stays honest: a payout is cash only when it lands.
- A researcher (Marrow) that thinks against the real Taskman brain.

## Is not

- A sales team. There are no customers to find and no users to sign up.
- A product looking for buyers. A lane without a posted requirement is not a lane.
- A growth team, a waitlist, or a funnel.
- An autosend or autosubmit system.
- A place that estimates cash.

## The test every lane must pass

1. **Posted.** The payer published the requirement: scope, problem statement, or target list.
2. **Committed.** The money is escrowed, a published pool, a published payout table, or a sanctioned budget, before anyone builds.
3. **No customer-finding.** Delivery is a submission to the payer's own venue.
4. **Open.** A standing program or a deadline in the future.
5. **Buildable.** Existing Taskman assets or a small build. No licensed human in the loop.
6. **Allowed.** The venue's terms permit how we would build it (Algora died on an automation clause).
7. **Reachable.** The payout rail reaches the operator in India.
8. **Novel.** Not killed in Taskman's `packages/core/territory/registry.js`.

Prefer pay-per-valid-output over shortlist funding, and shortlist funding over winner-take-all. A swarmed winner-take-all is dropped.

## The one human step

A payer pays a named person, so the operator holds one verified account per venue and presses submit. Everything before that is hunted and built by software.

## Success

A Taskman `settlements` row with `source` in `{stripe, paypal, bank, manual_receipt}` and a non-empty `externalRef`: a payout from a posted requirement.

Until then, Sellman reports **$0**. A pending bounty, a shortlist, or a leaderboard rank is not cash.

## Human effort test (applies to every lane)
Rank lanes by human minutes per rupee. A lane whose second and third payment need no new
human act (reorder, rate contract, standing bounty, self-serve checkout) beats a bigger lane
that needs fresh selling each time.
