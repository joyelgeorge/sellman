# Architect + scout pass — 2026-09-24

Band 3 (score / kill), not Band 4. Nothing was built, nothing was sent.
Settlements: **$0**. Sources are public search results only; direct page
fetches were blocked by this environment's network policy, so ratings and
pricing pages behind those hosts are **unverified**.

## 1. Sellman's live-feature table is stale — checked against Taskman

Source of truth: Taskman `packages/core/territory/registry.js` (HEAD `bf622fc`).

| Sellman `main` says | Taskman registry says |
| --- | --- |
| Pre-launch scan $99, scan+fix $249, $5 scan unlock — **live** | `vibe-app-security` **KILLED 2026-09-21** on measurement: ~420 deployed apps, 0 real findings; 2 disclosures, 0 replies |
| Taskman Audit $19/mo or $2/batch | `audit-tool-contingency` **ACTIVE**, **20% contingency**, nothing if nothing recovered. "Bottleneck is inbound demand, not code." |

**The only live, sellable feature is the payout-reconciliation audit at 20%
contingency.** Selling the scan lanes now would break "never sell work as if it
were live". README updated in the same commit.

## 2. `full-build` branch — do not merge as-is

- Unrelated history (no common ancestor with `main`).
- Deletes `AGENTS.md`, `CHARTER.md`, and all ten gate skills
  (`verify-buyer-before-contact`, `draft-outreach-never-send`, `close-to-settlement`, …).
- `src/workers/outboundBatch.js` **sends mail from software**: after one
  first-send approval per campaign, it calls `sendMail()` (Resend) for every
  later touch, up to 30/day. Off by default, but the path exists.
- The scout has no targets: `config/sources.json` holds only disabled
  `example.com` placeholders, and the ICPs are Stripe and Razorpay, neither
  of which is a live feature.

Worth porting to `main`: `src/guard/claims.js`, `src/guard/robots.js`,
`config/compliance.json` (consent-required default), and the draft-only
`partnerChannel` / `communityListener` workers. Before any port,
`outboundBatch` has to become draft-only: queue each draft, and a human sends
and logs `SENT`.

## 3. Taskman's new tasks (2026-09-24) — gate results

Taskman ranked lanes 4 and 8 as P0 because they are self-serve, the only way
around the audit lane's demand bottleneck. Scouted the gates that public
signal can answer.

### Lane 4 — Seller Reimbursement Recovery · Gate 1 "Is India actually thin?" → **No. Kill rule met on count.**

Rule in the task file: *three well-rated incumbents → stop.*

Claim-filing players (the lane's actual product):
- **Robnu**: Indian agentic OMS; files returns/claims with video evidence inside claim windows. **Free; permanently free under 25 orders/day**, which is exactly the small self-serve seller lane 4 was counting on. Amazon/AJIO/Meesho live, Flipkart Q4 2026.
- **TrackVid**: Flipkart SPF claim automation.
- **SunTec India**: India-based agency filing Amazon reimbursement claims for sellers.

Reconciliation SaaS in the same buyer's budget: eVanik, Ecommatrics (from
₹299/mo), Recarya, TheEcomWay, TheSellerBuddy, Cybiqon, Unicommerce.

"Well-rated" is **unverified** (review hosts blocked). The count is not in doubt.

### Lane 4 · Gate 3 "Do marketplace terms allow third-party claims?" → **No ban found; not cleared.**

No public ban surfaced, and several firms file claims on sellers' behalf openly.
The primary source is Seller Central (authenticated), so this is still open.
Headwinds on the Amazon side:
- FBA reimbursement at **manufacturing cost, not sale price** since 2025; sellers report recoveries down 50–75%.
- Claim windows shortened to ~60 days (Oct 2025).

Both shrink any contingency base.

### Lane 8 — DPDP Compliance Autopilot · Gate 2 "Who else sells it?" → **Crowded, with a free tier.**

India-native DPDP consent tooling found: Digital Anumati (**free plan**, INR,
22 languages), ConsentiQo, DPDP.ai (startup tiers), CookieYes (SMB, extended to
DPDP), Consently, dpdpact.co.in CMP. "Top 10 DPDP CMP" listicles already exist.
Registering as a Consent Manager needs ₹2 crore net worth, so Taskman could only
integrate one, not be one. Gate 1 (the platforms bundle it themselves) was not checked.

## 4. Verdict

Neither lane opens a new demand surface. Both fail at the same point: a
free incumbent already serves the self-serve buyer. Lanes 4 and 8 are not
live features, so Sellman cannot sell them either way.

The position is unchanged:
- Settlements: **0**
- Strongest live feature: payout-reconciliation audit, 20% contingency
- Next human action: find one person with a payout mismatch and send them the audit link yourself

Paste-ready for Taskman: sections 3 map one-to-one onto
`docs/tasks/2026-09-24-lane04-*.md` (Gates 1, 3) and `lane08-*.md` (Gate 2).

## Sources
- https://robnu.com/ · https://robnu.com/guides/flipkart-spf-claim
- https://trackvid.in/blogs/flipkart-spf-claim-automation.html
- https://www.suntecindia.com/amazon-reimbursement-services.html
- https://www.evanik.ai/payment-reconciliation · https://ecommatrics.com/ · https://www.recarya.com/ · https://www.theecomway.com/ · https://thesellerbuddy.com/payment-reconciliation · https://unicommerce.com/blog/amazon-flipkart-payment-reconciliation-guide/
- https://goaura.com/blog/amazon-reimbursement-services · https://www.esellerhub.com/blog/amazon-fba-reimbursement-policy-change-2025/
- https://blog.securedapp.io/best-consent-management-platforms-in-india-for-dpdp-compliance-in-2026-and-2027/ · https://kavachone.com/consentiqo-dpdp-consent-manager · https://www.dpdp.ai/ · https://www.consently.in/blog/dpdp-act-compliance-cost-india-2026 · https://myitmanager.in/consent-manager-india-dpdp-act/
