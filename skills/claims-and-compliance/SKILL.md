---
name: claims-and-compliance
description: Keep every customer-facing statement truthful to Taskman's verified capabilities and compliant with privacy, anti-spam, and platform rules. Use for any drafting of public copy, emails, listings, posts, pricing pages, or when deciding whether something can be said or sent.
---

# Claims and compliance

## Claims ladder (mirrors `src/guard/claims.js`)
| Capability status | Allowed |
|---|---|
| planned | nothing public |
| building | early-access page stating it is not live |
| beta | "early access", no numbers, no outcome promises |
| verified | full selling; numbers ≤ proof metrics, sample ≥ minimum, with scope and period |
| deprecated | remove everywhere |

Every draft must return `claims_used: [capability_key, ...]` and `numbers_used: [{value, metric_key}]`.

## Phrases that need an explicit, enforceable basis
guaranteed · risk-free · never · always · 100% · instant · best · #1 · "trusted by" · "AI-powered" as proof

## Privacy (not legal advice — defaults to be checked by a lawyer)
- India (DPDP Act/Rules): treat marketing email as consent-based; consent must be specific and by clear
  affirmative action; honour deletion; full enforcement by May 2027
- EU/UK: B2B rules vary by country; default conservative
- US (CAN-SPAM): identify sender, postal address, working opt-out honoured promptly
- Store lawful basis and consent reference per contact; suppression is permanent unless the person re-opts-in

## Platform rules
Marketplaces, communities, and mailbox providers each have rules. Store a dated summary per platform and
re-check quarterly. When rules are unclear, don't post.

## Honesty rules
- Disclose affiliation in community posts
- Don't impersonate humans; don't create fake accounts or reviews
- Demo data is labelled as demo
