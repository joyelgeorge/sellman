# Sellman charter

## One sentence

Sellman is the sales department of Taskman. It finds specific buyers of live features and moves them to a real settlement.

## Is

- A floor: position, next human action, human gates.
- A catalog of **sellable** features, marked live / wired / ticketed.
- A pipeline of **customers** (buyers), never a list of users to invite.
- Skills that refuse invite-shaped work.
- Agents that prepare. Humans that send and charge.
- Crons that keep looking for demand while the ledger stays honest.
- A researcher (Marrow) that thinks against the real Taskman brain.

## Is not

- A second Taskman.
- A growth team.
- An autosend system.
- Accounting software as a product.
- Paid ads before first settlement.
- A place that estimates cash.

## Success

A Taskman `settlements` row with `source` in `{stripe, paypal, bank, manual_receipt}` and a non-empty `externalRef`.

Until then, Sellman reports **$0**. Operator-claimed refs on the floor are not cash.
