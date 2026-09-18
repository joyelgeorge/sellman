# Sellman roadmap — to real, repeatable revenue

"Successful sales" is defined by money gates, not by activity. A phase is done when its gate is met,
not when its tasks are ticked. If a gate isn't met by its time-box, the strategist agent must propose
a pivot (different wedge, segment, or channel) instead of more of the same.

**North Star:** verified revenue Taskman earned from Sellman-sourced customers (monthly, in ₹ and $).
**Guardrail:** Sellman's total running cost (AI + infra + tools) < 20% of attributed revenue by Phase 3.

---

## Phase 0 — Foundation (Week 0–1)
Goal: Sellman can read Taskman's truth and cannot lie about it.

- [ ] Taskman exposes `/brain/manifest` (or read-only `brain` schema) per `docs/brain-contract.md`
- [ ] `brain-sync` worker running hourly; capability diffs create Sellman tasks
- [ ] Claims guard + outbound guard + kill switch live, with tests passing in CI
- [ ] Approval queue working (CLI now; digest email/Telegram later)
- [ ] Postgres schema migrated; cost logging on every AI call
- [ ] Sending domain separate from the product domain; SPF/DKIM/DMARC; one-click unsubscribe; suppression table

**Gate:** at least one Taskman capability with status `verified` and a proof metric Sellman can cite.
If none exists, Sellman's only job is selling *audits* (which are real) and collecting demand signals.

---

## Phase 1 — Proof asset (Weeks 1–4)
Goal: a free audit that shows a stranger money they're losing, without talking to them.

- [ ] Leak Audit v1 for wedge A: read-only Stripe restricted key or CSV export → report with ₹/$ found,
      broken down by leak type, and a one-click "turn on recovery" CTA
- [ ] Audit report page is shareable (founders forward it to co-founders — free distribution)
- [ ] Offer v1 from `offer-architect`: promise, price (pay on verified recovery), guarantee, limits
- [ ] Landing page + leak calculator (works without connecting anything)
- [ ] 10 audits on real accounts: your own, friendly founders, communities where you're already a member
- [ ] Every audit writes demand signals back to Taskman (which leak types are largest)

**Gate:** 10 real audits completed; median audited leak large enough that the fee would exceed ~3× the
customer's perceived effort. If audits find little non-retry leakage, drop wedge A to secondary and move
Phase 1 to wedge B (renegotiation audit).

---

## Phase 2 — First distribution, first money (Weeks 3–8)
Goal: first paying customer who arrived without a conversation.

- [ ] Stripe App Marketplace submission (listing copy passes claims guard; sandbox support declared)
- [ ] 8–12 GEO "answer object" pages built from real audit aggregates (not generic blog posts)
- [ ] Comparison pages against incumbents — factual, dated, claims-guarded
- [ ] Community listener live: drafts helpful answers where people ask about the pain; you approve each post
- [ ] Outbound pilot: ≤ 30 evidence-led emails/day total, only to `opt_out_allowed` jurisdictions, only
      where public evidence of the pain exists; kill switch armed
- [ ] Attribution: UTM + install source + Taskman billing event joined per account

**Gate:** first verified fee collected by Taskman from a Sellman-sourced customer.
Time-box: 8 weeks. Miss → strategist proposes a wedge/segment switch with evidence.

---

## Phase 3 — Repeatability (Months 2–4)
Goal: a channel that produces paying installs every week without you touching it.

- [ ] 10 paying customers
- [ ] Channel bandit running across ≥ 3 channels; losers auto-paused after minimum sample
- [ ] Pricing experiment: % of recovery vs. small base + lower % (bandit on audit→paid conversion)
- [ ] Lifecycle automation for opted-in users: audit done → not installed → nudge with their own numbers
- [ ] Case-study autopilot: milestone reached → in-app permission request → anonymised or named story
- [ ] Monthly benchmark snapshot from anonymised Taskman outcomes (requires consent in customer terms)
- [ ] Cost guardrail met (< 20% of attributed revenue)

**Gate:** ≥ 1 channel producing ≥ 2 paying installs/week for 4 consecutive weeks, CAC payback < 3 months.

---

## Phase 4 — Second wedge + India track (Months 4–9)
Goal: stop depending on one wedge and one marketplace.

- [ ] Wedge B (Silent Renegotiation) audit for sub-$200K software-spend SMBs; pay on realised savings
- [ ] India track: cross-gateway leakage for Razorpay/Cashfree/UPI Autopay merchants — inbound, partner,
      and marketplace only (consent-first jurisdiction)
- [ ] Wedge C (Tally shrinkage): Kerala retailer pilot → written permission case study → authorised-partner
      revenue-share deal or partner application → TallyShop listing
- [ ] Partner portal: CA firms / Tally partners / Stripe consultants get referral links and a self-serve dashboard
- [ ] Public read-only "leak audit" MCP server + registry listings; HubSpot marketplace evaluation
- [ ] Early-access pages for Taskman capabilities in `building` status (clearly marked not live) → signup
      counts feed Taskman's DISCOVER side process

**Gate:** ≥ 30% of monthly attributed revenue from outside wedge A; ≥ 2 marketplaces live.

---

## Phase 5 — Compounding (Months 9–18)
Goal: Sellman's marginal customer costs less every quarter.

- [ ] Quarterly "State of revenue leakage" report from Taskman's anonymised data — the citable asset AI
      engines and journalists reference
- [ ] Localised pages (Malayalam/Hindi for Tally segment; English for global SaaS)
- [ ] Referral loop inside the product: shareable recovery milestones
- [ ] Self-optimising offer catalog: every new `verified` capability auto-drafts offer + listing + page within 24h
- [ ] Churn-save and expansion motions driven by Taskman usage data (still no calls)

**Gate:** attributed revenue grows month over month for 6 months with flat or falling Sellman cost.

---

## Always-on (from Phase 0)

| Cadence | Job |
|---|---|
| 15 min | Kill switch: deliverability, error rates, spend caps |
| Hourly | Brain sync + capability diff → tasks |
| Daily | Signal scout, outbound batch (gated), community listener, attribution refresh |
| Weekly | Strategist review (≤ 3 bets), competitor watch, content batch, experiment evaluation |
| Monthly | GEO citation-share measurement, pricing review, roadmap gate check, cost vs. revenue |

## Anti-goals
- No "pipeline" or "MQL" targets. No vanity follower counts.
- No selling capabilities Taskman hasn't verified.
- No volume outbound, scraped personal data, fake reviews, or AI pretending to be a human.
- No roadmap phase advances on activity alone.
