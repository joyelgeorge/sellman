---
name: icp-and-segmentation
description: Define and refine ideal customer profiles (ICPs) for a Taskman capability using observable firmographic and pain signals. Use whenever choosing who to sell to, scoring accounts, splitting a market into segments, deciding which segment to target next, or when conversion data suggests the current target is wrong — even if the request just says "who should we sell this to".
---

# ICP and segmentation

An ICP in Sellman is not a persona story. It is a **testable filter** that code can apply to an account,
plus a **pain hypothesis** that an audit can confirm or kill.

## Output shape

```json
{
  "icp_key": "saas_stripe_10k_100k_mrr",
  "capability_keys": ["stripe.failed_payment_recovery"],
  "must_have": ["uses Stripe Billing", "subscription pricing page", "self-serve signup"],
  "nice_to_have": ["monthly plans under $100", "B2C or prosumer"],
  "disqualifiers": ["enterprise invoicing only", "consent_required jurisdiction for outbound"],
  "observable_signals": [
    {"signal": "pricing page shows monthly plans", "source": "public website", "weight": 0.3},
    {"signal": "public complaints about billing or card failures", "source": "community/forum", "weight": 0.4}
  ],
  "pain_hypothesis": "Loses 2-5% of MRR monthly to failed payments beyond Stripe's default retries",
  "how_the_audit_confirms_it": "leak report shows non-retry leakage ≥ $X/month",
  "reachable_via": ["stripe_marketplace", "geo_content", "community"],
  "est_accounts": "rough order of magnitude with source",
  "confidence": "low|medium|high"
}
```

## Process

1. **Start from the capability, not the market.** Read the capability's `integrations`, `limits`, and
   `proof`. The ICP must sit entirely inside what the capability actually supports.
2. **Name must-haves that are observable without talking to anyone** — public website, marketplace
   listing, tech fingerprints, job posts, community posts. If a criterion can only be learned on a call,
   it is not a must-have.
3. **Write disqualifiers first-class.** Most wasted effort comes from accounts that look right but can't buy
   self-serve (procurement, enterprise invoicing, unsupported gateway).
4. **Attach a pain hypothesis with a number** and state how the free audit confirms it.
5. **List reachable channels.** An ICP with no self-serve channel is not an ICP for Sellman.
6. **Size roughly and cite.** Order of magnitude is enough; always say where the estimate came from.

## Choosing between segments

Score each on: pain size (from audits, not guesses) × self-serve reachability × fit with verified
capability × willingness to pay on outcome ÷ competition intensity. Prefer segments **priced out by
incumbents** (e.g. SMBs below enterprise tools' price floor).

## Refinement triggers

- Audit completion rate high but install rate low → pain real, offer or trust wrong (not ICP)
- Audits find small leaks → ICP wrong; move up-market or to a different leak type
- Installs churn after first month → verify the capability's limits match the ICP

## Don'ts

- Don't use protected attributes or personal characteristics of individuals as segmentation criteria.
- Don't include jurisdictions where outbound is consent-first as outbound targets — mark them inbound-only.
