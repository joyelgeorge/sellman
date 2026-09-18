import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { enqueue } from '../approvals/queue.js';
import { log } from '../lib/log.js';

const logger = log('strategist');

async function gather() {
  const [revenue, funnel, experiments, brain, insights, competitors, costs, tasks] = await Promise.all([
    q(`SELECT currency, SUM(verified_fee_cents) AS cents, COUNT(DISTINCT account_ref)::int AS accounts
         FROM revenue WHERE period = to_char(now(),'YYYY-MM') GROUP BY currency`),
    q(`SELECT channel_key, model, SUM(visits)::int AS visits, SUM(audits_completed)::int AS audits,
              SUM(installs)::int AS installs, SUM(paying_accounts)::int AS paying
         FROM attribution_daily WHERE day >= current_date - 28 GROUP BY 1,2 ORDER BY paying DESC`),
    q(`SELECT id, card, status FROM experiments WHERE status IN ('running','pending_approval')`),
    q(`SELECT type, capability_key, detail, created_at FROM brain_events WHERE created_at > now() - interval '7 days' ORDER BY created_at DESC LIMIT 40`),
    q(`SELECT source, kind, body FROM insights WHERE created_at > now() - interval '7 days' ORDER BY created_at DESC LIMIT 40`),
    q(`SELECT competitor, snapshot, updated_at FROM competitor_snapshots ORDER BY updated_at DESC LIMIT 20`),
    q(`SELECT agent, ROUND(SUM(cost_usd), 2) AS spent FROM ai_calls WHERE created_at >= date_trunc('month', now()) GROUP BY agent`),
    q(`SELECT kind, status, COUNT(*)::int AS n FROM tasks GROUP BY 1,2`),
  ]);
  return { revenue, funnel, experiments, brain_events: brain, insights, competitors, agent_costs: costs, tasks };
}

function renderReport(out, context, date) {
  const money = context.revenue.map((r) => `${r.currency} ${(Number(r.cents) / 100).toFixed(2)} (${r.accounts} accounts)`).join(' · ') || 'none yet';
  const lines = [
    `# Sellman weekly review — ${date}`, '',
    `**Attributed verified revenue this month:** ${money}`,
    `**Headline:** ${out.summary?.headline ?? '—'}`,
    `**Biggest funnel drop:** ${out.summary?.biggest_drop ?? '—'}`, '',
    '## Funnel (last 28 days)', '',
    '| Channel | Model | Visits | Audits | Installs | Paying |', '|---|---|---|---|---|---|',
    ...context.funnel.map((f) => `| ${f.channel_key} | ${f.model} | ${f.visits} | ${f.audits} | ${f.installs} | ${f.paying} |`),
    '', '## Roadmap gate',
    `- Phase: ${out.gate_check?.phase ?? '—'} — **${out.gate_check?.status ?? '—'}**`,
    `- Evidence: ${out.gate_check?.evidence ?? '—'}`,
    out.gate_check?.pivot ? `- Proposed pivot: ${out.gate_check.pivot}` : '',
    '', '## Bets proposed (need your approval)',
    ...(out.bets ?? []).map((b, i) => `\n### ${i + 1}. ${b.hypothesis ?? b.name ?? 'bet'}\n` +
      `- Primary metric: ${b.primary_metric ?? '—'}\n- Arms: ${(b.arms ?? []).map((a) => a.label ?? a).join(', ') || '—'}\n` +
      `- Kill criterion: ${b.kill_criterion ?? '—'}\n- Max duration: ${b.max_duration ?? '—'} · Cost cap: ${b.cost_cap ?? '—'}`),
    '', '## Risks', ...(out.risks ?? []).map((r) => `- ${r}`),
    '', '## Spend this month',
    ...context.agent_costs.map((c) => `- ${c.agent}: $${c.spent}`),
  ];
  return lines.filter((l) => l !== '').join('\n');
}

export async function run() {
  const context = await gather();
  const roadmap = readFileSync(resolve(process.cwd(), 'ROADMAP.md'), 'utf8').slice(0, 6000);
  const out = await runAgent('strategist', { ...context, roadmap }, { worker: 'strategist' });

  const date = new Date().toISOString().slice(0, 10);
  mkdirSync(resolve(process.cwd(), 'reports'), { recursive: true });
  const path = resolve(process.cwd(), 'reports', `weekly-${date}.md`);
  writeFileSync(path, renderReport(out, context, date));

  await q(`INSERT INTO insights (source, kind, body) VALUES ('strategist','report',$1)`, [JSON.stringify(out)]);

  for (const bet of out.bets ?? []) {
    const rows = await q(
      `INSERT INTO experiments (card, conversion_event, status) VALUES ($1,$2,'pending_approval') RETURNING id`,
      [bet, bet.primary_metric_event ?? 'audit_completed']);
    for (const arm of bet.arms ?? []) {
      await q(`INSERT INTO arms (experiment_id, label, variant) VALUES ($1,$2,$3)`,
        [rows[0].id, arm.label ?? String(arm), typeof arm === 'object' ? arm : {}]);
    }
    await enqueue({ kind: 'bet', refTable: 'experiments', refId: rows[0].id,
      summary: `Bet: ${bet.hypothesis ?? 'experiment'}`, payload: bet });
  }

  logger.info('weekly review written', { path, bets: (out.bets ?? []).length });
  return { report: path, bets: (out.bets ?? []).length };
}
