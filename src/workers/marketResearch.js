import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { enqueue } from '../approvals/queue.js';
import { log } from '../lib/log.js';

const logger = log('market-research');

export async function run() {
  const capabilities = await q('SELECT key, name, status, wedge, summary, integrations, limits, proof FROM capabilities');
  const icps = (await q('SELECT definition, status FROM icps')).map((r) => ({ ...r.definition, status: r.status }));
  const auditAggregates = await q(
    `SELECT data->>'leak_type' AS leak_type, COUNT(*)::int AS n, ROUND(AVG((data->>'value_usd')::numeric), 2) AS avg_value
       FROM events WHERE type='audit_completed' AND data ? 'leak_type' GROUP BY 1 ORDER BY n DESC LIMIT 20`);

  const out = await runAgent('market-researcher', { capabilities, icps, audit_aggregates: auditAggregates }, { worker: 'market-research' });

  for (const f of out.findings ?? []) {
    await q(`INSERT INTO insights (source, kind, body) VALUES ('market-researcher','finding',$1)`, [JSON.stringify(f)]);
  }
  for (const qn of out.open_questions ?? []) {
    await q(`INSERT INTO insights (source, kind, body) VALUES ('market-researcher','finding',$1)`, [JSON.stringify({ open_question: qn })]);
  }

  const updates = out.icp_updates ?? [];
  if (updates.length) {
    for (const icp of updates) {
      await q(`INSERT INTO icps (key, definition, status) VALUES ($1,$2,'draft')
               ON CONFLICT (key) DO UPDATE SET definition=EXCLUDED.definition, updated_at=now()`, [icp.icp_key, icp]);
    }
    await enqueue({ kind: 'icp_change', summary: `${updates.length} ICP change(s) proposed`, payload: { icps: updates } });
  }
  logger.info('research done', { findings: (out.findings ?? []).length, icp_updates: updates.length });
  return { findings: (out.findings ?? []).length, icp_updates: updates.length };
}
