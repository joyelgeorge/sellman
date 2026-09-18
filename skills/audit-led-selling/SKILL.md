---
name: audit-led-selling
description: Design free, read-only audits that replace the sales call — diagnose, quantify the buyer's loss with their own data, and ask for the install. Use when creating a lead magnet, a demo, a trial, a proof asset, an onboarding report, or whenever a buyer would normally "need a call" to be convinced.
---

# Audit-led selling

A sales call does four jobs: diagnose, quantify, build trust, ask. A good audit does all four without a human.

## Audit anatomy
1. **Entry with minimum trust:** calculator (no data) → CSV upload → read-only restricted key. Offer all three.
2. **Time to report:** under 5 minutes for connected data; show progress honestly.
3. **Report sections:**
   - Headline number: estimated loss last period, with the method visible
   - Breakdown by leak type, each with count, value, and example records (their own)
   - What's recoverable vs. not (be honest — credibility is the product)
   - What turning it on would do, stated at the capability's proof level only
   - Price computed from their numbers
   - One button to install / enable
4. **Shareable link** (tokenised, expiring, no PII in URL) — the report gets forwarded internally.
5. **Data promise:** read-only, what's stored, how long, delete button. Required for DPDP/GDPR trust.

## Rules
- The audit must be useful even if they never buy.
- Don't inflate estimates. If uncertain, show a range and the assumption.
- Never require a meeting to see results.
- Every audit writes anonymised demand signals back to Taskman (`POST /brain/signals`).
- Audit results for a capability that isn't `verified` can show the *leak*, but not promise the *fix*.

## Follow-up (only for users who opted in)
- Day 0: report link + one-line summary of their biggest leak
- Day 3: "your leak since the audit" re-computed number, if still connected
- Day 10: last message; explain how to delete data
Stop immediately on unsubscribe or install.

## Metrics
calculator → audit start rate · audit completion · median audited loss · audit → install · install → first verified fee
