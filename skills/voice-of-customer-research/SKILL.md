---
name: voice-of-customer-research
description: Extract the exact words buyers use for their pain, not the words the market or competitors use to describe it. Use when reading reviews, complaints, support threads, or community posts, and whenever a draft's language needs to sound like the buyer's own vocabulary rather than a category term.
---

# Voice of customer research

market-researcher answers "what is true about this market" (size, competitors, pricing). This skill
answers a narrower, differently-sourced question: "what specific words does the buyer use when they're
frustrated, at 11pm, about this exact problem" — and that vocabulary is what actually converts in a
headline or subject line, not the category language an industry report would use.

## Where to look
- Public reviews and complaints on the buyer's own platforms (Stripe/Razorpay community threads, G2/
  Capterra reviews of adjacent tools, Reddit/IndieHackers threads about the pain)
- Support-ticket language, where the operator has direct access to it (e.g. Tally partner conversations)
- The exact phrasing in `lost_install_reason` events — someone who saw the audit and didn't install is
  the highest-signal source of vocabulary this project has

## What to extract, and how to log it
- The complaint verbatim, short, with its source — log it to `insights` (`kind='voc_phrase'`) exactly as
  content-engine already reads it, not paraphrased. Paraphrasing at capture time loses the thing this
  skill exists to preserve.
- The gap between the buyer's word and the internal term for it (e.g. buyers say "Stripe just eats my
  money," never "non-retry leakage") — that gap is itself the finding worth surfacing to whoever writes
  headlines next.
- Frequency, not just presence — one person's odd phrasing isn't a pattern; the same complaint from five
  independent sources is.

## Rules
- A phrase found through allowed public access only (robots.txt checked, same as signal-scout) — this
  skill does not license scraping a platform's terms, or reading anything gated behind a login the
  operator doesn't already have.
- Never invent a customer quote to fill a gap. An empty voice-of-customer set is a real, reportable
  finding ("we don't know how buyers describe this yet"), not a reason to fabricate one.
