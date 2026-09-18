---
name: close-to-settlement
lane: finance
---

# close-to-settlement

Trigger: they paid, or claim they paid.

## Rule

externalRef required. Rail in {paypal, stripe, bank, manual_receipt}. Units in cents. Taskman recordSettlement is the only cash.

## Kill

Dashboard money, verbal yes, empty ref, charge without verify.
