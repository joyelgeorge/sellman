import { q } from '../db/pool.js';

export async function enqueue({ kind, refTable = null, refId = null, summary, payload = {} }) {
  const rows = await q(
    `INSERT INTO approvals (kind, ref_table, ref_id, summary, payload) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [kind, refTable, refId, summary, payload]);
  return rows[0].id;
}

export async function pending(limit = 50) {
  return q(`SELECT id, kind, summary, ref_table, ref_id, created_at FROM approvals
            WHERE status = 'pending' ORDER BY created_at LIMIT $1`, [limit]);
}

export async function show(id) {
  const rows = await q('SELECT * FROM approvals WHERE id = $1', [id]);
  return rows[0] ?? null;
}

// What approval actually changes. Deliberately small: approving only flips a status.
const EFFECTS = {
  offers: { approved: 'approved', rejected: 'draft' },
  content: { approved: 'approved', rejected: 'draft' },
  campaigns: { approved: 'approved', rejected: 'paused' },
  experiments: { approved: 'running', rejected: 'killed' },
};

export async function decide(id, decision, note = null) {
  if (!['approved', 'rejected'].includes(decision)) throw new Error('decision must be approved or rejected');
  const item = await show(id);
  if (!item) throw new Error(`approval ${id} not found`);
  if (item.status !== 'pending') throw new Error(`approval ${id} already ${item.status}`);

  await q('UPDATE approvals SET status=$2, note=$3, decided_at=now() WHERE id=$1', [id, decision, note]);

  // ICP changes carry their definition in the payload instead of a row id.
  if (item.kind === 'icp_change' && decision === 'approved') {
    for (const icp of item.payload?.icps ?? []) {
      await q(`INSERT INTO icps (key, definition, status, updated_at) VALUES ($1,$2,'active',now())
               ON CONFLICT (key) DO UPDATE SET definition=EXCLUDED.definition, status='active', updated_at=now()`,
      [icp.icp_key, icp]);
    }
    return { id, decision, applied_to: 'icps' };
  }

  const effect = EFFECTS[item.ref_table];
  if (effect && item.ref_id) {
    const nextStatus = effect[decision];
    if (item.ref_table === 'experiments' && decision === 'approved') {
      await q('UPDATE experiments SET status=$2, started_at=now() WHERE id=$1', [item.ref_id, nextStatus]);
    } else {
      await q(`UPDATE ${item.ref_table} SET status=$2 WHERE id = $1`, [item.ref_id, nextStatus]);
    }
  }
  return { id, decision, applied_to: item.ref_table ?? null };
}
