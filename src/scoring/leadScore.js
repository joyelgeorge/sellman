// Deterministic account scoring against an ICP. Returns 0..1 plus an explanation.

export function scoreAccount(account, icp, { reachabilityWeights = {} } = {}) {
  const evidence = account.evidence ?? [];
  const evidencedSignals = new Set(evidence.map((e) => String(e.signal).toLowerCase()));

  if ((account.disqualifiers ?? []).length > 0) {
    return { score: 0, fit: 0, pain: 0, reach: 0, why: [`disqualified: ${account.disqualifiers.join(', ')}`] };
  }

  const mustHaves = icp.must_have ?? [];
  const mustMet = mustHaves.filter((m) => evidencedSignals.has(String(m).toLowerCase())).length;
  const fit = mustHaves.length ? mustMet / mustHaves.length : 0;

  const signals = icp.observable_signals ?? [];
  const totalWeight = signals.reduce((s, x) => s + (x.weight ?? 0), 0) || 1;
  const painWeight = signals
    .filter((s) => evidencedSignals.has(String(s.signal).toLowerCase()))
    .reduce((s, x) => s + (x.weight ?? 0), 0);
  const pain = Math.min(1, painWeight / totalWeight);

  const channels = icp.reachable_via ?? [];
  const reach = channels.length
    ? Math.max(...channels.map((c) => reachabilityWeights[c] ?? 0.5))
    : 0;

  // Fit gates everything: a partial fit can't be rescued by strong pain signals.
  const score = Number((fit * (0.6 * pain + 0.4 * reach)).toFixed(4));
  return {
    score, fit, pain, reach,
    why: [`must-haves ${mustMet}/${mustHaves.length}`, `pain ${pain.toFixed(2)}`, `reach ${reach.toFixed(2)}`],
  };
}
