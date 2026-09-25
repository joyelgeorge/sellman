# Calibration (RLCD-style)

RLCD = learn from contrastive pairs: for the same prompt, one output that follows the
principle (+) and one that violates it (−). Sellman calibrates on real turns: every time the
operator corrected a reply, that pair becomes a case. Before answering, a run checks its
draft against the nearest cases and moves toward (+).

## How a run uses it
1. Set the goal terms (AGENTS.md → Execution contract).
2. Draft.
3. Pick the 2–3 closest cases below. Score the draft: closer to (+) or (−)?
4. If closer to (−), rewrite. Say nothing about this unless it changed the answer.
5. When the operator corrects a reply, add the pair here.

## Cases mined from the 2026-09-24/25 session

| # | Prompt shape | (−) what was given | (+) what was wanted | Principle |
|---|---|---|---|---|
| C1 | "use the cloud credits" | Scouted buyers for a product | Hunt posted requirements, then build | Requirement first |
| C2 | "find lanes" | "Next action: you find a customer" | Lanes where payer already exists | Never hand the operator customer-finding |
| C3 | "real buyers for gloves" | Directories, categories (IndiaMART, Volza) | Named buyer + posted order + source | Unit = named buyer, not a channel |
| C4 | "go deep per line" | Assumed buyers by category | Evidence per line; say "none found" when none | No assumption; null is valid |
| C5 | "how do Wayanad sellers get orders" | Generic sales advice | Who signs (VEO), rule (₹20k quotation), money, timing | Mechanism over advice |
| C6 | "who in HML decides" | "Contact the company" | Two layers: estate manager vs Kochi purchase, with source | Name the decision node |
| C7 | "explore other possibilities" | Only more of the same channels | New axis (seafood, standards gap, tender winners) | Exploration floor |
| C8 | Any research turn | Blocked page → silent guess | "Blocked; verified vs confirm" marked | Mark evidence level |
| C9 | "Rubro: seafood buyers in Aroor" (arena round 1) | H-A and H-B refused as Band 4, pivoted to 0DIN | Hunt named buyers for the operator's product | Operator-directed lane beats generic band rule |
