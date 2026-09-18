---
name: geo-content
description: Plan and write content that ranks in search and gets cited by AI assistants (generative engine optimization) — answer objects, calculators, comparison pages, benchmark data pages. Use for any blog post, landing page, SEO or GEO task, content calendar, "how do we get found", or when turning Taskman/audit data into public content.
---

# GEO + SEO content

Goal: when a buyer asks an AI assistant or search engine about the pain, the answer cites us — and the
page they land on starts an audit.

## What to build (in order of leverage)
1. **Calculators / free tools** — e.g. failed-payment leak calculator, UPI Autopay retry-window planner,
   renewal overpay estimator. Tools earn links and citations; they're the top of the audit funnel.
2. **Answer objects from our own data** — a page that answers one specific question with a number from
   anonymised Taskman/audit aggregates, a small table, method, sample size, and date.
3. **Comparison pages** — factual, dated, sourced tables vs. alternatives including "do nothing" and
   platform defaults. Update quarterly.
4. **Integration pages** — "[face] for [platform]" with real setup steps.
5. **Glossary pages** for terms buyers search (decline codes, mandate revocation, dunning).

## Answer-object template
```
# [Question exactly as buyers phrase it]
**Short answer:** 2–3 sentences with the number (if proof-backed) and its scope.
| Segment | Metric | Sample | Period |
|---|---|---|---|
**How we measured:** method, data source, exclusions.
**What this means for you:** 3 bullets.
**Check your own number:** [calculator / audit CTA]
Updated: YYYY-MM-DD
```

## Rules
- One question per page. Put the answer in the first 60 words.
- Numbers only from proof metrics or aggregates with sample size ≥ minimum; always show method and date.
- Cite external facts with links; paraphrase sources, never copy their text.
- Structured data (FAQ/HowTo/SoftwareApplication schema) where accurate.
- Separate Indian pages (₹, Razorpay/UPI, GST) from global pages.
- No mass-generated thin pages. Every page must answer something a real buyer asked (source it from
  community listener or audit free text).

## Measurement
- AI-referred sessions tracked as separate channels
- Monthly citation share: run a fixed prompt set across assistants, record whether we're cited
  (strategist owns the prompt set; don't change it mid-quarter)
- Calculator completions → audits started
