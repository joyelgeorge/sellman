// Experiment arm statistics.
// - Allocation uses UCB1 (explore under-sampled arms).
// - Kill decisions use Wilson score intervals: pause an arm only when its upper bound is below the
//   best arm's lower bound. Deterministic, so every pause is reproducible and auditable.

export function wilson(conversions, exposures, z = 1.96) {
  if (!exposures) return { low: 0, high: 1, mean: 0 };
  const p = conversions / exposures;
  const z2 = z * z;
  const denom = 1 + z2 / exposures;
  const centre = (p + z2 / (2 * exposures)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / exposures + z2 / (4 * exposures * exposures))) / denom;
  return { low: Math.max(0, centre - margin), high: Math.min(1, centre + margin), mean: p };
}

export function scoreArms(arms, { c = Math.SQRT2, z = 1.96 } = {}) {
  const total = arms.reduce((s, a) => s + (a.exposures ?? 0), 0);
  return arms.map((a) => {
    const n = a.exposures ?? 0;
    const k = a.conversions ?? 0;
    const w = wilson(k, n, z);
    const bonus = n > 0 && total > 1 ? c * Math.sqrt(Math.log(total) / n) : Infinity;
    return { ...a, mean: w.mean, ucb: w.mean + bonus, low: w.low, high: w.high };
  });
}

/**
 * Arms to pause once they have enough exposures:
 * - zero conversions, or
 * - Wilson upper bound below the best mature arm's Wilson lower bound (clearly dominated).
 */
export function armsToPause(arms, { minExposures = 100, z = 1.96 } = {}) {
  const scored = scoreArms(arms.filter((a) => a.status !== 'paused'), { z });
  const mature = scored.filter((a) => a.exposures >= minExposures);
  if (mature.length === 0) return [];
  const best = mature.reduce((b, a) => (a.low > b.low ? a : b));
  return mature
    .filter((a) => a.id !== best.id && (a.conversions === 0 || a.high < best.low))
    .map((a) => ({ id: a.id, reason: a.conversions === 0 ? 'zero_conversions' : 'dominated', mean: a.mean, high: a.high, bestLow: best.low }));
}

/** Next arm to allocate traffic to (UCB1). */
export function nextArm(arms, opts) {
  const active = arms.filter((a) => a.status !== 'paused');
  if (active.length === 0) return null;
  const scored = scoreArms(active, opts);
  return scored.reduce((best, a) => (a.ucb > best.ucb ? a : best));
}
