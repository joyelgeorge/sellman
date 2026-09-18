# ADR 0003 — Outbound is capped, evidence-led, and jurisdiction-gated

**Status:** accepted · 2026-09-17

**Context.** 2026 mailbox providers reject non-compliant bulk mail; AI-written cold email is flagged more
often; India (DPDP) and several other jurisdictions treat commercial email as opt-in.

**Decision.**
- Global daily cap (default 30) across all mailboxes and domains — adding mailboxes does not raise it
- Send only when stored public evidence of the pain exists for that account
- Contacts in `consent_required` jurisdictions are blocked without a consent reference
- Suppression checked at send time; one-click unsubscribe and sender identity in every email
- Kill switch: bounce > 2% or complaint > 0.2% over trailing 7 days pauses the channel
- No free-tier provider rotation to multiply volume

**Consequences.** Outbound will never be the scale channel. It's a messaging-learning channel and a way
to reach accounts with very specific, visible pain.
