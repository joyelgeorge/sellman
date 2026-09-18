---
name: offer-design
description: Turn a verified Taskman capability into a sellable offer — promise, proof, mechanism, price, risk reversal, and limits — for a specific ICP. Use whenever a capability becomes verified, when packaging a new product face, when conversion from audit to install is weak, or when anyone asks "how do we sell this feature".
---

# Offer design

An offer is what the buyer is actually deciding on. Customers never buy "Taskman"; they buy a specific
outcome attached to their money stream.

## The offer object

```json
{
  "face_name": "short, plain product name",
  "capability_keys": ["..."],
  "icp_key": "...",
  "promise": "outcome in the buyer's words, no number unless proof backs it",
  "mechanism": "one sentence on how it works (why it's believable)",
  "proof": [{"type": "metric|audit|case_study", "ref": "capability proof key or content id"}],
  "price": {"model": "percent_of_verified|base_plus_percent|flat", "details": {}},
  "risk_reversal": "what happens if it doesn't work (must be real and enforceable)",
  "time_to_value": "how long until the buyer sees their first result",
  "effort_required": "what the buyer must do — aim for one connection and zero meetings",
  "limits": ["copied from capability limits, never softened"],
  "cta": "single next action, usually 'Run the free audit'"
}
```

## Principles

1. **Value = size of outcome × likelihood they believe it ÷ (time to value × effort).** Improve the
   denominator first — it's cheaper than bigger promises.
2. **The audit is part of the offer.** Every offer's first step is a free, read-only diagnosis with the
   buyer's own numbers.
3. **Mechanism beats adjectives.** "Retries at the time the card is most likely to succeed based on the
   decline code" is more persuasive than "AI-powered recovery".
4. **Risk reversal must be structural.** Pay-on-verified-outcome is the strongest form. Don't write
   "guaranteed" unless the price model makes it literally true.
5. **Limits are part of the offer.** Stating unsupported gateways up front prevents churn and marketplace
   rejection.
6. **One face, one outcome, one CTA.** If the offer needs "and also", split it into two faces.

## Checklist before submitting for approval
- [ ] Every capability key is `verified` (or `beta` with early-access framing and no numbers)
- [ ] Every number traces to a proof metric
- [ ] Price model matches `outcome-pricing` skill rules
- [ ] Limits copied verbatim from the capability
- [ ] Effort to start is one connection or one upload
