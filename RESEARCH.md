# Sellman research — September 2026

Scope: where Taskman's current wedges can find paying customers without sales calls, what the
competition charges, which channels still work, and which rules constrain an autonomous sales system.
Figures below come from vendor blogs and industry reports; many are marketing material from companies
selling in the same space, so treat single numbers as directional and re-verify before using any of
them in customer-facing copy (the claims guard will not let unverified numbers out anyway).

---

## 1. Wedge A — Stripe revenue recovery

**Market shape.** The category has split into dunning tools that mostly email customers to update cards,
and recovery engines that re-attempt charges intelligently and only contact the customer as a fallback.
Vendors commonly cited: FlyCode, Stripe Smart Retries, Butter, Revaly, Redux, Churnkey, Churn Buster,
Paddle Retain, Vindicia, Baremetrics Recover.
Source: https://www.flycode.com/blog/best-failed-payment-recovery-tools-2026

**Pricing in the market.**
- Churn Buster starts around $249/month; Churnkey's strongest features sit in $700+/month tiers; Stunning ~$120/month.
  Source: https://churnward.com/blog/best-dunning-software/
- Low-price entrants are already here: Recurflux advertises plans from $20–59/month and supports Stripe, Paddle, Razorpay, Cashfree, RevenueCat.
  Source: https://recurflux.com/resources/guides/best-failed-payment-recovery-software-2026
- Butter uses performance pricing (a cut of recovered revenue); Churnkey is flat monthly.
  Source: https://churntools.com/blog/best-dunning-tools-comparison

**The uncomfortable finding.** One comparison argues Stripe's free Smart Retries is enough for most
businesses under ~$250K MRR, with paid tools becoming meaningful above that.
Source: https://churntools.com/blog/best-dunning-tools-comparison

**Implication for Sellman.** "Better retries" alone is a crowded, price-collapsing position. Sellman should
position Taskman on (a) pay-only-on-verified-recovery with zero base fee, and (b) leakage *beyond* failed
retries — refunds, disputes, trial leaks, expired-card cohorts, silent downgrades — which is what the
LISTEN/DETECT architecture is good at. The free leak audit must prove the non-retry leakage exists, or this
wedge should be deprioritised.

**Distribution.** Stripe removed mandatory payments KYC onboarding for app distribution in April 2026,
separating app distribution requirements from payment requirements, which lowers the barrier to publishing.
Source: https://docs.stripe.com/changelog/dahlia/2026-04-22/app-distribution-capability
Review rules include: same app name in listing and manifest, disclosing obvious limitations, a clear way to
unauthenticate from the Dashboard, and (since Feb 2025) declaring sandbox install support in the manifest.
Source: https://docs.stripe.com/stripe-apps/review-changelog

---

## 2. Wedge A-India — UPI Autopay / Razorpay recurring recovery

- UPI AutoPay is described as the cheapest recurring rail for tickets up to ₹15,000; e-NACH for higher values.
  Source: https://razorpay.com/blog/cheapest-payment-gateway-for-recurring-billing-e-nach-upi-autopay-and-subscription/
- Failure data conflicts: one Razorpay post says UPI Autopay success rates often sit at 30–50%; another guide
  puts failure at 8–15%. The difference is probably definitional (mandate registration vs. debit), which is
  itself a detector opportunity — measure it for real per merchant.
  Sources: https://razorpay.com/blog/payment-gateway-reliability-india-businesses-2026/ ·
  https://productgrowth.in/insights/fintech/upi-autopay-guide/
- Rules constrain retries: norm cited as one original attempt plus up to three retries, and a pre-debit
  notification at least 24 hours before each debit.
  Source: https://razorpay.com/blog/master-recurring-payments-upi-autopay-guide/
- **Platform risk:** Razorpay introduced its own Intelligent Retry Engine (beta) at FTX 2026.
  Source: https://razorpay.com/blog/upi-autopay-with-intelligent-revenue-protect/

**Implication.** Don't sell "retries" against the gateway. Sell cross-gateway leakage visibility and
compliant recovery orchestration (mandate registration drop-off, pre-debit notification gaps, revocation
cohorts) for Indian SaaS/D2C running Razorpay + Cashfree + cards.

---

## 3. Wedge B — Silent Renegotiation (B2B contracts / SaaS spend)

- Incumbents are priced for mid-market and up: Tropic cited from ~$10K–14.5K/year; Vertice (now including
  Vendr) from ~$35K/year.
  Sources: https://www.varisource.com/blog/saas-spend-management-software-comparison ·
  https://www.varisource.com/blog/saas-procurement-platform-guide
- Tropic reported negotiating $362M of spend in H1 2025 at a 15.5% average savings rate.
  Source: https://www.varisource.com/blog/best-saas-spend-management-software
- One guide says companies with fewer than ~40 vendors and under ~$200K annual software spend usually
  won't recover the cost of these tools; it also notes AI surcharges pushing renewals up 10–25%.
  Source: https://www.varisource.com/blog/best-saas-procurement-software-guide
- Shared-savings (pay only when savings land) already exists at the broad end (Varisource).

**Implication.** The underserved segment is exactly the one the incumbents price out: SMBs under ~$200K
software spend. A self-serve "renewal calendar + overpay estimate" audit, then pay-on-savings, is a
no-call motion that incumbents structurally can't copy at their cost base.

---

## 4. Wedge C — Tally shrinkage / reconciliation

- TallyShop is the in-product marketplace for add-ons built by **authorised Tally Partners**, with try-before-buy.
  Source: https://help.tallysolutions.com/extend-using-tally-shop-add-ons-tally/
- The Tally Developer Hub publishes a playbook covering solution design, marketplace listing, and pricing.
  Source: https://developer.tallysolutions.com/
- Existing partners already sell ready-made TDL add-ons (WhatsApp sender, e-invoice, barcode) across retail,
  pharma, manufacturing.
  Source: https://precisiontech.in/apps/tally/tally-tdl-addons/

**Implication.** Distribution runs through partner status or a revenue-share deal with an existing
authorised partner. The one retailer you have access to is the pilot → case study (with written permission)
→ listing path. CA firms and Tally partners are a natural referral channel that needs no calls once a
partner link and dashboard exist.

---

## 5. Channels

### Outbound email — the weakest channel for a solo, autonomous operator
- Average cold reply rate ~3.43%, top performers >10% (Instantly, billions of emails).
  Source: https://instantly.ai/cold-email-benchmark-report-2026
- A 100K paired-email study found AI-written emails spam-flagged at 8% vs 3% for human-written, with lower
  inbox placement.
  Source: https://www.digitalapplied.com/blog/ai-sdr-real-performance-100k-email-analysis-2026
- Google requires SPF, DKIM, aligned DMARC, one-click unsubscribe, and spam rates under 0.3% (target
  under 0.1%); enforcement ramped in Nov 2025 to temporary then permanent rejections.
  Source: https://mailflowauthority.com/ai-email/email-deliverability-ai-sdr-agents
- Non-compliant mail is increasingly rejected at the server rather than filed as spam.
  Source: https://www.lacleo.ai/blog/cold-email-benchmarks-deliverability-2026

**Decision:** outbound is capped, evidence-led, and gated (see ADR 0003). No free-tier mailbox rotation to
reach volume — that pattern is what gets domains and provider accounts shut down.

### Marketplaces — primary
Stripe App Marketplace (wedge A), TallyShop via partner (wedge C), HubSpot marketplace (apps can now carry
MCP server components, with ecosystem review before installed customers get access).
Source: https://developers.hubspot.com/docs/apps/developer-platform/add-features/mcp-registry

### AI search (GEO) + free tools — primary compounding channel
- G2's 2026 report is cited as showing 51% of software buyers start research with an AI chatbot more often
  than Google; self-contained "answer" blocks with data tables are claimed to earn more citations.
  Source: https://www.mersel.ai/generative-engine-optimization
- Caution: much GEO data is produced by GEO vendors. Measure citation share ourselves (strategist agent
  runs a fixed prompt set monthly) rather than trusting published multipliers.

### MCP / agent registries — early, cheap option
- Public MCP directories (Smithery, Glama, PulseMCP) passed ~1,000 servers by Q2 2026.
  Source: https://www.digitalapplied.com/blog/mcp-servers-for-marketing-25-servers-reviewed-2026
- RevTech vendors (Apollo, ZoomInfo, 6sense, others) shipped MCP servers in mid-2026, framed as a new
  distribution channel serving both humans and agents.
  Source: https://gzconsulting.substack.com/p/mcp-enterprise-software-distribution-channel

**Idea:** a public read-only "leak audit" MCP server so a merchant's own AI assistant can run the free audit.

---

## 6. Compliance constraints that shape the design

- **India DPDP Rules 2025** notified Nov 2025; phased, with full substantive enforcement by 13 May 2027 and
  penalties up to ₹250 crore; Consent Manager registration opens Nov 2026.
  Source: https://www.syslabs.in/blog/dpdp-act-2026-compliance-guide-india
- Consent must be free, specific, informed, unambiguous, by clear affirmative action; bundled or pre-checked
  consent doesn't qualify.
  Source: https://secureprivacy.ai/blog/india-dpdp-act-phase-1
- Practitioner guides treat commercial email to Indian recipients as opt-in.
  Source: https://signalplug.com/blog/email-laws-india

**Design consequence:** `config/compliance.json` defaults India (and other consent-first jurisdictions) to
`consent_required` — cold outbound to those contacts is blocked by code. Indian customers come through
inbound, marketplaces, partners, and audits. Rules differ by country; have the defaults checked by a lawyer
before sending anything.

---

## 7. Summary: where to point Sellman first

| Rank | Motion | Why |
|---|---|---|
| 1 | Free leak audit → self-serve install, pay on verified outcome | Proof replaces the sales call; matches Taskman's VERIFY/CHARGE |
| 2 | Stripe App Marketplace listing | Buyers are already inside the money stream; lower onboarding friction since Apr 2026 |
| 3 | GEO content + calculators built from real audit data | Compounds; data nobody else has |
| 4 | Renegotiation audit for sub-$200K software spend SMBs | Segment priced out by incumbents |
| 5 | Tally shrinkage via partner channel (Kerala pilot first) | Real access already exists; partner does the relationship |
| 6 | Capped, evidence-led outbound (non-consent-first jurisdictions only) | Useful for learning messaging, not for scale |

**2026-09-18 update — this ranking wasn't checked against Taskman's own numbers until now.** Taskman scores
every territory it has tried against a weighted rubric (`packages/core/territory/scoring.js` in the Taskman
repo, not a vendor blog — verifiable directly). Distribution carries 0.35 of the weight, and it's the one
dimension this whole file was ranking on secondhand (marketplace friction, incumbent pricing) rather than
first-hand (does the operator already have permission to talk to this buyer). Run against that scorer:

| Motion | Distribution label | Score |
|---|---|---|
| Tally duplicate-invoice/shrinkage audit | `relationship_exists` (retailer access already in hand) | **0.92** |
| Stripe App Marketplace recovery (rank 2 above) | `buyers_already_searching`, but large build + crowded | 0.62 |
| Vibe-coded-app security audit (not in this file at all — Taskman's own current in-flight lane) | `must_create_demand`, capped | 0.50 |
| Renegotiation audit, sub-$200K spend (rank 4 above) | `must_create_demand`, capped, large build | 0.46 |

Source: Taskman `packages/core/territory/registry.js` (`EXPLORED_TERRITORIES`) and `scoring.js`, run
2026-09-18. This doesn't override the table above — the Stripe/GEO/marketplace research is still real and
still worth having — but it says the *rank* should put Tally above Stripe, and it flags that Wedge D
(vibe-coded-app security) is a live Taskman lane this document never accounted for. See `BRAINSTORM.md`
items #30–32 for what follows from that.
