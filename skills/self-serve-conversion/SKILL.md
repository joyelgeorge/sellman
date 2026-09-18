---
name: self-serve-conversion
description: Optimise the no-call path from first visit to paid — landing page, calculator, audit, install, activation, first verified fee — and write lifecycle messages for opted-in users. Use for onboarding flows, activation problems, drop-off analysis, trial or audit nurture emails, pricing page UX, and any "why aren't people converting" question.
---

# Self-serve conversion

## The funnel
visit → calculator_used → audit_started → audit_completed → install → first_verified_fee → retained_m3

Fix the **largest absolute drop** first, not the lowest percentage.

## Friction audit per step
For each step list: what the user must know, decide, and do. Remove one item per iteration.
Common fixes:
- Visit → calculator: put the calculator above the fold, no email gate
- Calculator → audit: carry their inputs into the audit start; offer CSV path for low-trust users
- Audit start → complete: read-only scopes explained inline; progress bar; resume link
- Audit → install: price computed from their data; one button; limits shown before install, not after
- Install → first fee: first recovery notification with the exact record; weekly "recovered so far"

## Lifecycle messages (opted-in only)
Triggered by events, never by calendar blasts. Each message contains the user's own number.
Templates must be approved once; sends then run automatically. Stop on install, unsubscribe, or data deletion.

## Questions instead of calls
When a user stalls, ask **one** in-product question ("What stopped you?" with 4 options + free text).
Answers go to `insights` and to Taskman as `lost_install_reason` signals.

## Don'ts
- No dark patterns: fake timers, pre-checked consent, hidden uninstall
- No email gate on the calculator
