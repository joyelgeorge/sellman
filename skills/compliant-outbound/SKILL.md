---
name: compliant-outbound
description: Write and run low-volume, evidence-led outbound email that respects deliverability rules and privacy law. Use for any cold email, sequence, follow-up, prospect message, or when someone proposes increasing send volume, adding mailboxes, or buying lists.
---

# Compliant outbound

Outbound in Sellman is a precision instrument, not a volume engine. Code enforces the hard limits
(`src/guard/outbound.js`); this skill covers how to write messages worth receiving.

## Hard rules (enforced in code — don't try to work around them)
- Global daily cap across all mailboxes (default 30). More mailboxes ≠ more sends.
- Contact jurisdiction `consent_required` (default: India, Germany, Canada, unknown) → blocked without consent reference
- Suppression list checked at send time
- Every email: real sender identity, postal address, one-click unsubscribe, List-Unsubscribe headers
- Kill switch: bounce > 2% or complaint rate > 0.2% (trailing 7 days) pauses the channel
- No purchased personal-data lists, no scraped LinkedIn data, no provider rotation to dodge limits

## When an account qualifies for a send
All of: fits an ICP must-have set · stored public evidence of the pain (URL + date) · a verified capability
that addresses it · jurisdiction allows it · not contacted in last 90 days.

## Message structure (under 90 words)
1. **Evidence line** — the specific, public thing you noticed. Link it.
2. **Implication** — what that usually costs, at proof level only.
3. **Offer** — the free audit, and what they'll see.
4. **Easy out** — "Not relevant? Reply 'no' and you won't hear from us again."

No meeting ask. No fake familiarity. No "just following up". At most one follow-up after 5 business days,
adding new information (not a reminder).

## Personalisation that's allowed
Company-level public facts: pricing page, product, public posts, marketplace listings, job posts.
Not allowed: personal social media details, inferred personal characteristics.

## Measure
Positive reply rate and audits started per 100 sends. Opens aren't a success metric.
