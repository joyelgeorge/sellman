import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { checkClaims } from '../guard/claims.js';
import { enqueue } from '../approvals/queue.js';
import { envInt } from '../lib/env.js';
import { log } from '../lib/log.js';

const logger = log('offer-architect');

function offerText(offer) {
  return [offer.face_name, offer.promise, offer.mechanism, offer.risk_reversal, offer.time_to_value,
    offer.effort_required, ...(offer.limits ?? []), offer.cta,
    JSON.stringify(offer.price ?? {})].filter(Boolean).join('\n');
}

export async function run({ limit = 3 } = {}) {
  const tasks = await q(
    `SELECT id, capability_key, reason FROM tasks
      WHERE kind IN ('offer','refresh_proof','refresh_limits') AND status='open'
      ORDER BY priority, created_at LIMIT $1`, [limit]);
  if (!tasks.length) return { handled: 0 };

  const capabilities = await q('SELECT * FROM capabilities');
  const icps = await q(`SELECT key, definition FROM icps WHERE status IN ('active','draft')`);
  const competitors = await q('SELECT competitor, snapshot FROM competitor_snapshots');
  const minSample = envInt('MIN_PROOF_SAMPLE', 5);
  let handled = 0;

  for (const task of tasks) {
    await q(`UPDATE tasks SET status='running', updated_at=now() WHERE id=$1`, [task.id]);
    const capability = capabilities.find((c) => c.key === task.capability_key);
    if (!capability) { await q(`UPDATE tasks SET status='skipped', updated_at=now() WHERE id=$1`, [task.id]); continue; }

    try {
      const out = await runAgent('offer-architect', {
        capability,
        icps: icps.filter((i) => (i.definition.capability_keys ?? []).includes(capability.key)).map((i) => i.definition),
        competitors: competitors.map((c) => c.snapshot),
        reason: task.reason,
      }, { worker: 'offer-architect' });

      for (const offer of out.offers ?? []) {
        const guard = checkClaims({
          text: offerText(offer),
          claimsUsed: out.claims_used ?? offer.capability_keys ?? [],
          numbersUsed: out.numbers_used ?? [],
          capabilities,
          offer: { guarantee_defined: Boolean(offer.risk_reversal) && offer.price?.model?.includes('percent') },
          minSample,
        });
        const status = guard.ok ? 'pending_approval' : 'rejected_by_guard';
        const rows = await q(
          `INSERT INTO offers (capability_key, icp_key, body, guard_result, status) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [capability.key, offer.icp_key ?? null, offer, guard, status]);
        if (guard.ok) {
          await enqueue({ kind: 'offer', refTable: 'offers', refId: rows[0].id,
            summary: `Offer "${offer.face_name}" for ${capability.key} → ${offer.icp_key ?? 'unassigned ICP'}`,
            payload: { offer } });
        } else {
          logger.warn('offer rejected by claims guard', { capability: capability.key, violations: guard.violations });
        }
      }
      await q(`UPDATE tasks SET status='done', result=$2, updated_at=now() WHERE id=$1`, [task.id, { offers: (out.offers ?? []).length }]);
      handled += 1;
    } catch (err) {
      await q(`UPDATE tasks SET status='failed', result=$2, updated_at=now() WHERE id=$1`, [task.id, { error: err.message }]);
      logger.error('task failed', { task: task.id, error: err.message });
    }
  }
  return { handled };
}
