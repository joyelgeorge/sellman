# ADR 0004 — Claims about Taskman are enforced in code

**Status:** accepted · 2026-09-17

**Context.** Autonomous content generation drifts toward overclaiming. Marketplace reviews, consumer
protection rules, and trust all punish claims that the product can't back.

**Decision.** Every customer-facing draft declares the capability keys it references. `src/guard/claims.js`
checks the text against capability status and proof metrics before anything reaches the approval queue.
Prompts also instruct agents on this, but the prompt is not the control.

**Consequences.** Some copy will be blander until Taskman has proof. That's intended: it pushes effort
toward generating real proof (audits, verified recoveries) instead of better adjectives.
