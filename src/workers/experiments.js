import { q } from '../db/pool.js';
import { armsToPause, scoreArms } from '../scoring/ucb.js';
import { readConfig } from '../lib/config.js';
import { log } from '../lib/log.js';

const logger = log('experiments');

export async function run() {
  const cfg = readConfig('experiments.json');
  const running = await q(`SELECT id, card, conversion_event FROM experiments WHERE status='running'`);
  const report = [];

  for (const exp of running) {
    const arms = await q(
      `SELECT a.id, a.label, a.status,
              COUNT(*) FILTER (WHERE e.type = 'visit' OR e.type = 'exposure')::int AS exposures,
              COUNT(*) FILTER (WHERE e.type = $2)::int AS conversions
         FROM arms a LEFT JOIN events e ON e.arm_id = a.id
        WHERE a.experiment_id = $1 GROUP BY a.id, a.label, a.status`, [exp.id, exp.conversion_event]);

    const scored = scoreArms(arms);
    const toPause = armsToPause(arms, { minExposures: cfg.min_exposures_per_arm });
    for (const p of toPause) {
      await q(`UPDATE arms SET status='paused', paused_reason=$2 WHERE id=$1 AND status='active'`,
        [p.id, `${p.reason}: mean ${p.mean.toFixed(4)}, upper ${p.high?.toFixed?.(4) ?? '—'} vs best lower ${p.bestLow.toFixed(4)}`]);
    }

    const totalConversions = arms.reduce((s, a) => s + a.conversions, 0);
    const active = arms.filter((a) => a.status === 'active').length - toPause.length;
    if (active <= 1 && totalConversions >= cfg.min_conversions_to_declare_winner) {
      await q(`UPDATE experiments SET status='concluded', ended_at=now() WHERE id=$1`, [exp.id]);
    }
    report.push({ experiment: exp.id, hypothesis: exp.card?.hypothesis, arms: scored.map(({ id, label, exposures, conversions, mean, low, high }) => ({ id, label, exposures, conversions, mean, low, high })), paused: toPause });
  }

  if (report.length) await q(`INSERT INTO insights (source, kind, body) VALUES ('experiments','finding',$1)`, [JSON.stringify(report)]);
  logger.info('evaluated', { experiments: report.length });
  return { experiments: report.length, report };
}
