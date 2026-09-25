# Arena: competing Sellman variants

Several versions of each agent type run the same task. A judge scores each against the goal
terms and the calibration cases. Variants that drift are eliminated; aligned ones are kept and
bred into the next generation.

## 1. Agent types and variants
Each type (hunter, verifier, drafter, closer) keeps a small pool, 3–5 variants.
A variant = one skill file + one prompt style + one explore setting. Example for the hunter:
- H-A: strict filter, explore floor 3 axes
- H-B: wide explore (5 axes), same filter
- H-C: decision-path first (who signs, rule, budget) then buyers
Variants live in `calibration/variants/<type>/<id>.md`.

## 2. A round
1. Same prompt + same goal terms to every variant of the type.
2. Each produces its answer independently (no peeking).
3. Judge scores each answer blind to which variant wrote it.
4. Scores go to `calibration/scoreboard.md`.

## 3. Score (0–2 each, max 18)
| Axis | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Goal alignment | serves another goal | partly | directly moves the goal |
| Unit | categories | mixed | named buyers / named nodes |
| Evidence | none | some unmarked | every claim sourced, verified/confirm marked |
| Decision path | absent | vague | who signs, rule, timing |
| Explore breadth | < floor | at floor | above floor with a new axis |
| Filter honesty | kept junk or hid drops | partial | drops listed with reasons |
| Calibration | matches a (−) case | neutral | matches a (+) case |
| Actionability | no next step | vague | one concrete step the operator can do today |
| Human touch | needs research, drafting or chasing by the operator | several manual steps | operator only taps: approve, sign, send, or visit once |

**Field-check penalty:** if the operator checks in person and the fit was wrong, the variant
scores 0 on Evidence and Calibration for that round, and −4 overall.

**Real-world override:** a variant whose output led to an actual reply, visit or order gets +4
on that round. Reality beats the judge.

## 4. Selection
- **Eliminate:** any variant scoring 0 on Goal alignment or Unit in a round (hard drift), or
  below 9/18 average over its last 3 rounds.
- **Nurture:** the top variant each generation is copied; the copy gets one small change
  (mutation) taken from the best trait of the runner-up. Pool size stays constant.
- **Keep a wildcard:** one slot always holds a high-exploration variant, so the pool does not
  collapse into "safe and narrow" (less exploration is also failure).
- Every elimination adds its worst answer as a new (−) case in `calibration/README.md`.

## 5. Judge
- Default: a separate judging run with only the goal terms, the rubric and the cases.
- Operator is the final judge: any operator correction outranks the judge's score.
- Judge is itself checked: if operator and judge disagree twice, the rubric line is rewritten.

## 6. What stays fixed across all variants
The Never list in AGENTS.md, the charter tests, and the rule that humans send and sign.
Variants compete on how well they hunt, never on what they are allowed to do.
