# Brainstorm — first pass

Ideas are tagged **[now]** (fits Phase 0–2), **[next]** (Phase 3–4), **[later]**, or **[no]** (considered and rejected).
The strategist agent reads this file as a backlog; move ideas into `experiments` with a hypothesis and a kill criterion before building them.

---

## Big frames

**1. Taskman is the engine; Sellman sells product faces.** [now]
Every verified capability becomes its own small product with a name, one-page site, listing, and price —
e.g. a "Leak Audit for Stripe", a "Renewal Radar", a "Stock Variance Check for Tally". Customers buy the
face; Taskman runs underneath. You can kill or rename a face without touching the engine.

**2. The audit is the salesman.** [now]
A no-call business needs something that does what a sales call does: diagnose, quantify, build trust, and
ask for the order. A free, read-only audit with *their* numbers does all four. The report ends in one
button. Every wedge gets an audit before it gets an ad.

**3. Sellman tells Taskman what to build.** [now]
Audit results, early-access signups, calculator inputs, and lost-install reasons are the best demand data
Taskman will ever get. They flow into Taskman's DISCOVER side process as ranked signals — so DISCOVER is
fed by buyers, not by idea generation.

**4. Brain-diff launches.** [now]
When a capability flips to `verified` in Taskman, Sellman auto-drafts: changelog post, listing update,
opted-in email to users whose audit showed that leak type, and a GEO page. You approve the batch once.

---

## Channel ideas

5. **Stripe App Marketplace first listing.** [now] Buyers are literally inside the money stream.
6. **Leak calculator** (no connection needed) → "want the real number? run the audit". [now]
7. **Answer-object pages from real aggregates**: "What share of failed payments are expired cards for
   ₹500–₹2,000 subscriptions?" answered with Taskman data. Data nobody else can publish. [next]
8. **Community listener**: find people describing the pain on Reddit, IndieHackers, Stripe/Razorpay
   community threads; draft a genuinely useful answer; disclose affiliation; you approve each post. [now]
9. **Public MCP "leak audit" server** so a merchant's own AI assistant can run the audit. Listed in MCP
   registries. Cheap to try, and agents don't need persuading. [next]
10. **Partner links for CA firms and Tally partners**: revenue share, self-serve dashboard, no calls.
    They already have the relationship you don't want to maintain. [next]
11. **Stripe/Razorpay consultants & agencies** as referrers — they get asked "why is churn high?" weekly. [next]
12. **Shareable recovery milestones** ("₹1 lakh recovered this quarter") with opt-in public badge. [later]
13. **Quarterly leakage benchmark report** — citable by AI engines and newsletters. Needs data consent in
    customer terms from day one. [later]
14. **Evidence-led outbound only**: send only when public evidence of the pain exists (e.g. their pricing
    page shows subscription tiers AND their community forum shows billing complaints). Hard daily cap. [now]

## Offer & pricing ideas

15. **Zero base, % of verified outcome** (recovery or savings). Incumbents can't match on cost base. [now]
16. **Cap the fee** per month for the first 90 days — removes the "what if it's huge" fear. [now]
17. **Audit-to-offer personalisation**: price shown in the report is computed from their audited leak. [next]
18. **Pricing bandit** on audit→paid conversion between two or three price models. [next]
19. **Annual prepay discount** once recovery is steady (improves cash for you). [later]

## India-specific

20. **Cross-gateway leakage view for Razorpay + Cashfree + cards** — the gateway can optimise its own
    retries but has no reason to show you what's leaking across gateways. [next]
21. **UPI Autopay mandate registration drop-off detector** — the silent leak before the first debit. [next]
22. **Tally shrinkage pilot → Kerala retail clusters** via Tally partners; Malayalam report. [next]
23. **GST-period reconciliation hook** — pitch the variance check when books are being closed anyway. [later]

## Wedge B (Silent Renegotiation)

24. **Renewal Radar audit**: connect Gmail invoices or upload bank/Stripe exports → renewal calendar +
    overpay estimate → "let the agent draft the renegotiation, you approve the send". [next]
25. **AI surcharge detector**: flag renewals where vendors bundled AI add-ons into price increases. [next]

## Internal machinery ideas

26. **Cost-aware agents**: each agent has a monthly budget; the kill switch pauses agents whose cost per
    attributed rupee is rising. [now]
27. **Claims ledger**: every published sentence with a number links to the Taskman proof it came from. [now]
28. **Lost-install interviews without calls**: one-question in-app survey when someone runs an audit and
    doesn't install. [next]
29. **Weekly one-screen report** to your phone: attributed revenue, top channel, 3 pending approvals. [now]

---

## Rejected (and why)

- **[no] Free-tier mailbox rotation to reach high send volume.** Violates provider terms, gets domains
  blocked, and AI-written cold mail is already penalised by filters. Kills the sending domain you need
  later for transactional mail.
- **[no] Scraping LinkedIn or buying personal-data lists.** Terms-of-service and DPDP/GDPR exposure; the
  audit + marketplace motion doesn't need it.
- **[no] AI personas posing as human SDRs.** Dishonest, and platforms remove accounts that do it.
- **[no] Fake-door pages for capabilities that don't exist.** Early-access pages must say clearly the
  feature isn't live.
- **[no] Fake or incentivised-without-disclosure reviews on marketplaces.** Delisting risk.
- **[no] Inviting customers into Taskman itself.** Taskman stays private; customers get product faces.

---

## Session addendum — 2026-09-18, checked against Taskman's own scoring

Taskman scores every lane it has actually tried in `packages/core/territory/scoring.js`, weighted 0.35
on one question: who says yes without a sales conversation. Running that scorer against the wedges this
file assumes surfaced a mismatch worth recording before it gets built into the brain contract.

30. **[now] Wedge D — vibe-coded-app security is missing from this file entirely.** It's Taskman's own
    current in-flight lane (2 disclosures sent, waiting on reply) and its critical finding (2026-09-08)
    names it as the only validated-paying market found so far. `RESEARCH.md`/`ROADMAP.md` predate that
    finding and default to Wedge A (Stripe) instead. Scored: `must_create_demand`, capped at 0.50 —
    same cap as Wedge A's audit-only entry and the existing `audit-tool-contingency` lane. Add it as a
    fourth wedge and a fourth product face; don't let Sellman's channel-building imply it doesn't exist.

31. **[now] Re-rank Wedge A against Wedge C before building either audit.** Scored against the same
    rubric: Tally duplicate-invoice/shrinkage = 0.92 (`relationship_exists` — a retailer already
    reachable, no sales call needed). Stripe App Marketplace recovery = 0.62 (`buyers_already_searching`,
    but a large build against incumbents already at $120–700/mo, crowded). Renegotiation (Wedge B) =
    0.46, capped (`must_create_demand`, large build, nobody asking yet). The roadmap's Phase 1 gate
    picks Wedge A by default; the scorer says Wedge C is the one with a distribution advantage nothing
    else on this list has. Worth an explicit decision, not an inherited default.

32. **[next] Read the wedge/channel priority live from Taskman's registry instead of hardcoding it here.**
    `packages/core/territory/registry.js` already carries `distribution`, `economics`, and `rail` per
    lane, and it changes as lanes get proven or killed (see `isNovel()` / `VERDICT`). `brain-sync` already
    reads Taskman's manifest hourly — extending that read to include the registry's ranking would let
    offer-architect and strategist re-rank which product face gets the marketing push automatically when
    a lane's verdict flips, instead of the roadmap's phase order silently going stale the way it did here.

33. **[later] A single scoring vocabulary across both repos.** Sellman's ICP/channel selection and
    Taskman's territory scoring currently use different mental models for the same question (who buys
    without being sold to). If Sellman ever needs its own scorer rather than reading Taskman's, reuse the
    same dimension names (`distribution`, `payoutReach`, `feasibilityWithAssets`, `saturation`) so a
    finding in one repo is legible in the other without translation.
