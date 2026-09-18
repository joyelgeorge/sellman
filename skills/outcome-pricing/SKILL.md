---
name: outcome-pricing
description: Design and test pricing for Taskman product faces, especially performance-based models priced as a share of verified recovered revenue or realised savings. Use for any pricing decision, pricing page, price experiment, discount, cap, or when comparing against competitor pricing.
---

# Outcome pricing

## Default model
**Zero base fee + percentage of verified outcome**, billed by Taskman after VERIFY. It matches the
no-call motion: the buyer doesn't need to be convinced of ROI in advance because they only pay from it.

## Price models to test (one at a time, via the experiments worker)

| Model | When it fits | Watch out for |
|---|---|---|
| % of verified outcome (e.g. 10–25%) | Outcome is measurable per period | Disputes about attribution → define "verified" in terms |
| Small base + lower % | Buyer wants predictability; you need to cover fixed costs | Base reintroduces purchase friction |
| Monthly cap on fee for first 90 days | Large accounts afraid of an open-ended bill | Cap too low → you subsidise big accounts |
| Flat tiers by volume | Outcome hard to attribute | Competes directly with $20–250/mo tools |

## Rules

1. **Define "verified" in plain language on the pricing page** — what counts, what window, what doesn't.
2. **Anchor against the buyer's loss, not competitor price.** The audit gives the anchor: "you lost ₹X
   last month; you pay 15% of what we get back".
3. **Know the competitor floor.** Research shows recovery tools from ~$20/month to $700+/month and
   procurement tools from ~$10K/year. Outcome pricing should be cheaper than those for small accounts and
   more profitable than them for large ones.
4. **Currency and tax.** Show INR for Indian buyers (GST-inclusive or exclusive — state which); USD elsewhere.
5. **Never change price for existing customers without notice.** Experiments apply to new audits only.
6. **Discounts need a reason** (annual prepay, case-study permission), never urgency theatre.

## Experiment design
- Unit of randomisation: audit session (so the offered price appears in the report)
- Primary metric: audit_completed → first_verified_fee within 45 days
- Secondary: 90-day revenue per audit (a low price that converts more can still lose)
- Minimum sample per arm set in `config/experiments.json`; strategist decides, not the bandit alone
