# ADR 0001 — Sell outcomes through product faces, never access to Taskman

**Status:** accepted · 2026-09-17

**Context.** Taskman is a private orchestration engine. Inviting customers into it would expose internals,
create support load, and force a general-purpose UI.

**Decision.** Each verified capability is sold as a narrow product face (name, page, listing, audit, price).
Customers interact with the face and its dashboard. Taskman runs underneath and reports verified outcomes.

**Consequences.** More small listings to maintain (automated by brain-diff tasks). Faces can be killed or
renamed independently. Pricing is per outcome, which matches Taskman's VERIFY → CHARGE loop.
