import { q } from '../db/pool.js';
import { deliverabilityState } from '../guard/outbound.js';
import { readConfig } from '../lib/config.js';
import { loadAgent, listAgents } from '../agents/spec.js';
import { log } from '../lib/log.js';

const logger = log('kill-switch');

export async function run() {
  const compliance = readConfig('compliance.json');
  const d = compliance.deliverability ?? {};
  const actions = [];

  // 1. Deliverability per channel over the trailing window.
  const rows = await q(
    `SELECT channel_key, SUM(sent)::int AS sent, SUM(bounced)::int AS bounced, SUM(complaints)::int AS complaints
       FROM deliverability_daily WHERE day >= current_date - ($1::int - 1) GROUP BY channel_key`,
    [d.window_days ?? 7]);
  for (const r of rows) {
    const state = deliverabilityState(r, d);
    if (state === 'pause') {
      await q(`UPDATE channels SET status='paused', paused_reason=$2, updated_at=now() WHERE key=$1 AND status='active'`,
        [r.channel_key, `deliverability: ${r.bounced} bounces / ${r.complaints} complaints of ${r.sent} sends`]);
      actions.push({ type: 'channel_paused', channel: r.channel_key, ...r });
    } else if (state === 'alarm') {
      actions.push({ type: 'deliverability_alarm', channel: r.channel_key, ...r });
    }
  }

  // 2. Agent budgets.
  const spend = await q(
    `SELECT agent, SUM(cost_usd) AS spent FROM ai_calls
      WHERE created_at >= date_trunc('month', now()) AND agent IS NOT NULL GROUP BY agent`);
  const spentBy = new Map(spend.map((r) => [r.agent, Number(r.spent)]));
  for (const name of listAgents()) {
    const spec = loadAgent(name);
    const spent = spentBy.get(name) ?? 0;
    if (spent >= spec.budgetUsdMonth) {
      await q(`INSERT INTO agent_state (agent, status, paused_reason) VALUES ($1,'paused',$2)
               ON CONFLICT (agent) DO UPDATE SET status='paused', paused_reason=EXCLUDED.paused_reason, updated_at=now()`,
        [name, `budget ${spent.toFixed(2)}/${spec.budgetUsdMonth} USD`]);
      actions.push({ type: 'agent_paused', agent: name, spent });
    }
  }

  // 3. Error storms: an agent failing repeatedly in the last hour.
  const failures = await q(
    `SELECT agent, COUNT(*)::int AS n FROM agent_runs
      WHERE started_at > now() - interval '1 hour' AND status <> 'ok' GROUP BY agent HAVING COUNT(*) >= 5`);
  for (const f of failures) {
    await q(`INSERT INTO agent_state (agent, status, paused_reason) VALUES ($1,'paused',$2)
             ON CONFLICT (agent) DO UPDATE SET status='paused', paused_reason=EXCLUDED.paused_reason, updated_at=now()`,
      [f.agent, `${f.n} failures in the last hour`]);
    actions.push({ type: 'agent_paused', agent: f.agent, failures: f.n });
  }

  if (actions.length) await q(`INSERT INTO insights (source, kind, body) VALUES ('kill-switch','kill_switch',$1)`, [JSON.stringify(actions)]);
  logger.info('checked', { actions: actions.length });
  return { actions };
}
