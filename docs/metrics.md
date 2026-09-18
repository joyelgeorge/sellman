# Metrics

## North Star
**Attributed verified revenue (monthly)** = Σ `revenue.verified_fee_cents` for accounts whose first-touch or
install source is a Sellman channel. Reported in ₹ and $.

## Funnel (per wedge, per channel)
visit → calculator_used → audit_started → audit_completed → install → first_verified_fee → month_3_retained

## Unit economics
- **Sellman cost** = AI calls + infra + paid tools, from `ai_calls` and `config/costs.json`
- **Cost ratio** = Sellman cost ÷ attributed revenue (target < 20% by Phase 3)
- **CAC by channel** = channel cost ÷ paying installs
- **Payback** = CAC ÷ monthly verified fee per customer

## Channel health
- Outbound: bounce rate (pause > 2%), complaint rate (alarm 0.1%, pause 0.2%), positive reply rate
- Marketplace: listing views → installs, install → audit completion
- Content/GEO: AI-referred sessions, monthly citation share on a fixed prompt set, calculator completions
- Community: approved posts → clicks → audits (per post, not per platform)

## Kill criteria (enforced by `experiments` worker)
- An arm with ≥ `MIN_ARM_EXPOSURES` and zero audits is paused
- An arm whose Wilson 95% upper bound is below the best arm's Wilson lower bound is paused
- Any agent with cost > budget for the month is paused until the strategist review

## Vanity metrics we don't track as goals
Followers, impressions without clicks, open rates (unreliable since mail privacy protections), "pipeline".
