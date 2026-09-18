// Pure diffing of the Taskman capability manifest and mapping of diffs to Sellman tasks.

export function diffCapabilities(prev = [], next = []) {
  const events = [];
  const before = new Map(prev.map((c) => [c.key, c]));
  const after = new Map(next.map((c) => [c.key, c]));

  for (const [key, cap] of after) {
    const old = before.get(key);
    if (!old) { events.push({ type: 'added', key, status: cap.status }); continue; }
    if (old.status !== cap.status) events.push({ type: 'status_changed', key, from: old.status, to: cap.status });
    const oldM = old.proof?.metrics ?? {};
    const newM = cap.proof?.metrics ?? {};
    for (const metric of new Set([...Object.keys(oldM), ...Object.keys(newM)])) {
      if (oldM[metric] !== newM[metric]) events.push({ type: 'metric_changed', key, metric, before: oldM[metric] ?? null, after: newM[metric] ?? null });
    }
    if ((old.proof?.sample_accounts ?? 0) !== (cap.proof?.sample_accounts ?? 0)) {
      events.push({ type: 'sample_changed', key, before: old.proof?.sample_accounts ?? 0, after: cap.proof?.sample_accounts ?? 0 });
    }
    if (JSON.stringify(old.limits ?? []) !== JSON.stringify(cap.limits ?? [])) events.push({ type: 'limits_changed', key });
  }
  for (const key of before.keys()) if (!after.has(key)) events.push({ type: 'removed', key });
  return events;
}

export function tasksForEvents(events, capabilitiesByKey = new Map()) {
  const tasks = [];
  const push = (kind, key, reason, priority = 5) => tasks.push({ kind, capability_key: key, reason, priority });

  for (const e of events) {
    // status_changed carries from/to; metric/sample events carry before/after values, not statuses.
    const status = e.type === 'status_changed' ? e.to : (e.status ?? capabilitiesByKey.get(e.key)?.status);
    switch (e.type) {
      case 'added':
        if (status === 'building') push('early_access_page', e.key, 'new capability in building', 6);
        if (status === 'beta') push('offer', e.key, 'new beta capability', 4);
        if (status === 'verified') { push('offer', e.key, 'new verified capability', 1); push('content', e.key, 'launch content', 2); }
        break;
      case 'status_changed':
        if (e.to === 'verified') {
          push('offer', e.key, `promoted ${e.from} → verified`, 1);
          push('content', e.key, 'launch content for verified capability', 2);
          push('listing', e.key, 'update marketplace listings', 2);
          push('notify_interested', e.key, 'email opted-in users whose audits showed this leak', 3);
        } else if (e.to === 'beta') {
          push('offer', e.key, `moved to beta from ${e.from}`, 4);
        } else if (e.to === 'building') {
          push('early_access_page', e.key, `moved to building from ${e.from}`, 6);
          if (e.from === 'beta' || e.from === 'verified') push('unpublish', e.key, `status regressed to ${e.to}`, 0);
        } else if (e.to === 'deprecated' || e.to === 'planned') {
          push('unpublish', e.key, `status regressed to ${e.to}`, 0);
        }
        break;
      case 'metric_changed':
      case 'sample_changed':
        if (status === 'verified') push('refresh_proof', e.key, `${e.type} ${e.metric ?? ''}`.trim(), 3);
        break;
      case 'limits_changed':
        push('refresh_limits', e.key, 'limits changed — update listings and pages', 1);
        break;
      case 'removed':
        push('unpublish', e.key, 'capability removed from manifest', 0);
        break;
      default: break;
    }
  }
  // De-duplicate by kind+key keeping the highest priority (lowest number).
  const best = new Map();
  for (const t of tasks) {
    const id = `${t.kind}:${t.capability_key}`;
    if (!best.has(id) || best.get(id).priority > t.priority) best.set(id, t);
  }
  return [...best.values()].sort((a, b) => a.priority - b.priority);
}
