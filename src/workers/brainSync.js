import { q } from '../db/pool.js';
import { fetchManifest, pushSignals } from '../brain/client.js';
import { diffCapabilities, tasksForEvents } from '../brain/diff.js';
import { log } from '../lib/log.js';

const logger = log('brain-sync');

export async function run() {
  const manifest = await fetchManifest();
  const next = manifest.capabilities ?? [];
  const prev = await q('SELECT key, status, limits, proof FROM capabilities');

  const events = diffCapabilities(prev, next);

  for (const cap of next) {
    await q(
      `INSERT INTO capabilities (key, name, status, wedge, summary, integrations, limits, pricing_hint, proof, synced_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT (key) DO UPDATE SET name=EXCLUDED.name, status=EXCLUDED.status, wedge=EXCLUDED.wedge,
         summary=EXCLUDED.summary, integrations=EXCLUDED.integrations, limits=EXCLUDED.limits,
         pricing_hint=EXCLUDED.pricing_hint, proof=EXCLUDED.proof, synced_at=now()`,
      [cap.key, cap.name, cap.status, cap.wedge ?? null, cap.summary ?? null,
        JSON.stringify(cap.integrations ?? []), JSON.stringify(cap.limits ?? []),
        cap.pricing_hint ?? null, JSON.stringify(cap.proof ?? {})]);
  }
  const presentKeys = next.map((c) => c.key);
  if (presentKeys.length) await q(`UPDATE capabilities SET status='deprecated' WHERE key <> ALL($1)`, [presentKeys]);

  for (const e of events) {
    await q('INSERT INTO brain_events (type, capability_key, detail) VALUES ($1,$2,$3)', [e.type, e.key, e]);
  }

  const tasks = tasksForEvents(events, new Map(next.map((c) => [c.key, c])));
  let opened = 0;
  for (const t of tasks) {
    const res = await q(
      `INSERT INTO tasks (kind, capability_key, reason, priority) VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING RETURNING id`, [t.kind, t.capability_key, t.reason, t.priority]);
    opened += res.length;
  }

  // Verified revenue from Taskman — the North Star input.
  for (const c of manifest.customers ?? []) {
    await q(
      `INSERT INTO revenue (account_ref, source_ref, period, verified_fee_cents, currency, synced_at)
       VALUES ($1,$2,$3,$4,$5, now())
       ON CONFLICT (account_ref, period, currency) DO UPDATE SET verified_fee_cents=EXCLUDED.verified_fee_cents,
         source_ref=COALESCE(EXCLUDED.source_ref, revenue.source_ref), synced_at=now()`,
      [c.account_ref, c.source_ref ?? null, c.period, c.verified_fee_cents, c.currency]);
  }

  // Flush queued demand signals back to Taskman.
  const outbox = await q('SELECT id, payload FROM signals_outbox WHERE sent_at IS NULL LIMIT 200');
  if (outbox.length) {
    try {
      await pushSignals(outbox.map((r) => r.payload));
      await q('UPDATE signals_outbox SET sent_at = now() WHERE id = ANY($1)', [outbox.map((r) => r.id)]);
    } catch (err) {
      logger.warn('signal push failed', { error: err.message });
    }
  }

  logger.info('synced', { capabilities: next.length, events: events.length, tasks_opened: opened, signals: outbox.length });
  return { capabilities: next.length, events: events.length, tasks_opened: opened };
}
