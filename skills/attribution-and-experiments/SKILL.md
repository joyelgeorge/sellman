---
name: attribution-and-experiments
description: Attribute verified Taskman revenue to Sellman channels and design, read, and stop experiments across channels, offers, and prices. Use for weekly reviews, channel decisions, "what's working", budget allocation, A/B tests, bandits, or deciding what to kill.
---

# Attribution and experiments

## Attribution model
- **First touch** (discovery credit) and **install source** (conversion credit), both stored
- Revenue = Taskman `verified_fee_cents` joined on `source_ref`
- Report both; decide channel investment on install-source revenue, content investment on first-touch

## Experiment card (required before building anything)
```
hypothesis: If we [change], then [metric] improves by [amount] because [reason from evidence]
arms: control + ≤ 2 variants
unit: audit session | visitor | account
primary metric: (must connect to verified revenue within 45 days)
minimum exposures per arm: from config
kill criterion: explicit and numeric
max duration: weeks
cost cap:
```

## Reading results
- The experiments worker allocates with UCB1 and auto-pauses arms whose Wilson upper bound falls below the best arm's lower bound (after minimum exposures).
- Winners are **not** auto-scaled; the strategist proposes and the operator approves.
- Beware small numbers: under ~20 conversions per arm, report "inconclusive", not "winner".
- Check for novelty and seasonality (GST filing periods, month-end billing runs).

## Weekly strategist review format
1. Attributed verified revenue (this week, MTD, vs last month)
2. Funnel by channel with the biggest absolute drop highlighted
3. Experiments: running / paused / concluded
4. Brain changes that matter for selling
5. **≤ 3 bets** — each an experiment card
6. Cost vs. attributed revenue

## Don't
- Don't optimise opens, clicks, or impressions in isolation
- Don't run overlapping experiments on the same funnel step
