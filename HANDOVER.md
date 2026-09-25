# Handover — Sellman + Rubro (2026-09-25)

Branch: `claude/free-cloud-credits-bmp9pk` (not merged to main; no PR opened).
Settlements: **$0**. Rubro orders: **0**.

## 1. What Sellman is now
- Requirement-first: hunt buyers who already need/fund the thing, then build or sell. Never build-then-sell.
- Operator-directed lanes (Rubro gloves) are open Band 3 work.
- Every prompt sets goal terms (AGENTS.md → Execution contract). Follow-ups inherit them.
- Every skill = Explore (floor) + Filter. Evidence of current use before any call/visit.
- Minimum human touch: software prepares; operator only approves, signs, sends, calls.
- Calibration: `calibration/README.md` (cases C1–C11 from operator corrections). Add a case for every correction.
- Arena: `calibration/arena.md` — variants compete, scored /18, drifters eliminated. Scoreboard in `calibration/scoreboard.md`.

## 2. Rubro Rubber Industries (the live lane)
- Product: industrial-grade natural rubber gauntlet gloves, 10"–22", diamond grip. Heavy Duty and Household lines too.
- Price/pair: 10" ₹60 · 12" ₹72 · 14" ₹84 · 16" ₹96 · 18" ₹108 · 20" ₹120 · 22" ₹132. MOQ 500 pairs.
- Kozhuvanal, Kottayam 686584 · 6238778438 · Kerala MSME.
- Price benchmark: compare only against industrial grade (e.g. ₹225 neoprene 18"). Household ₹80 gloves are a different grade.

## 3. Lane status
| Lane | Status | File |
| --- | --- | --- |
| Edayar IDA, Aluva (7 electroplating, 3 battery, chemical units, CMRL) | **Hottest — strong fit, confirm by call**; unit names still needed | hunts/rubro-hot-leads.md |
| Aroor seafood (Penver, Seafood Park India, Geo Aquatic, +5) | Fit unverified — peeling uses thin latex; ask about ice/brine/cleaning first | hunts/rubro-aroor-seafood.md |
| Kochi resellers (Shenoys, Jimco, Akash Sales, Quexti) | Listing-based; one call each | hunts/rubro-hot-leads.md |
| Government (HKS tenders, GeM, KMSCL) | Parked — verified use but slow; get Udyam/DSC before March | hunts/rubro-wayanad-playbook.md, rubro-order-kit.md |
| Tea estates | **Killed** — operator field-checked: not used | hunts/rubro-wayanad-playbook.md |

## 4. Open tasks
See `hunts/TASKS.md`. Top three:
1. [software] Name the Edayar units + phone numbers.
2. [operator] Calls: Penver (+91 478 283 2200), Seafood Park (0478 287 1375), resellers.
3. [operator] Confirm GST incl./extra, delivery time, trial quantity below 500.

## 5. Known limits
- This cloud environment blocks many sites (tender portals, IndiaMART detail pages, 0din.ai). A session on the operator's own machine (`claude remote-control`) can reach them.
- No messages are ever sent by software.

## 6. Other lanes (Taskman side)
- `LANES.md`: 0DIN GenAI bug bounty (gate: read automation terms), huntr (active in Taskman), RBI/IndiaAI/iDEX watch.
- Taskman's vibe-app security lane was killed 2026-09-21; payout audit is the only live Taskman feature (20% contingency).

## 7. File map
AGENTS.md · CHARTER.md · LANES.md · ROADMAP.md · calibration/ · hunts/ · skills/hunt-the-requirement/
