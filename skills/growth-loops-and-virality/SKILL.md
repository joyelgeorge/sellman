---
name: growth-loops-and-virality
description: Design mechanisms where a customer's own action brings the next customer, so distribution compounds without spend or a sales conversation. Use when a channel is capped by how many people you can individually reach, and whenever proposing a referral, share, embed, or milestone mechanic.
---

# Growth loops and virality

Every channel in `config/channels.json` today is Sellman reaching out (content, community, outbound) or
a marketplace listing waiting to be found. None of them is *the customer's own use of the product*
bringing the next customer in. That's the gap this skill fills — it is a different question from
"how do we reach more people" (distribution) and closer to "how does one customer's action create the
next lead automatically."

## Loop shapes that fit a no-sales-calls operator
- **Share the number, not the product.** A milestone badge ("₹1 lakh recovered this quarter," opt-in,
  from BRAINSTORM.md #12) is shareable because it's the customer's win, not an ad for Sellman.
- **Embeddable proof.** A small "leak-free, verified by [audit]" badge a customer can put on their own
  status page or pricing page — value to them (trust signal) doubles as distribution.
- **Referral only where the underlying claim survives scrutiny.** Referring a friend to a free audit
  costs the referrer nothing and risks nothing — that asymmetry is what makes a loop compound instead of
  fizzle after the first push.
- **The audit itself, forwarded.** README.md already names this: "founders forward it to co-founders."
  This skill's job is making that forwarding intentional — a report designed to be sent, not just read.

## What kills a loop
- Any mechanic that requires the referrer to vouch for something unverified — they won't, and if they
  do, it's a claims-guard violation waiting to surface.
- Incentivized sharing with no disclosure (BRAINSTORM.md's rejected list already forbids incentivized,
  undisclosed reviews — the same logic applies to referral incentives).
- A loop that only works once per customer. Design for the action being cheap enough to repeat
  (forwarding a new milestone) rather than a one-time signup bonus.

## Measuring it
A loop is only real if `events`/`attribution_daily` shows a channel-of-referral distinct from the
referrer's own first-touch channel — track it as its own `channel_key` (e.g. `referral`) from day one,
even before volume justifies a dashboard for it.
