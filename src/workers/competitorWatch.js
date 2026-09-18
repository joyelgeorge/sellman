import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { readConfig } from '../lib/config.js';
import { log } from '../lib/log.js';

const logger = log('competitor-watch');

export async function run() {
  const watchlist = readConfig('competitors.json');
  const snapshots = await q('SELECT competitor, snapshot, updated_at FROM competitor_snapshots');
  const out = await runAgent('competitor-analyst', {
    watchlist: Object.fromEntries(Object.entries(watchlist).filter(([k]) => !k.startsWith('_'))),
    last_snapshots: snapshots,
  }, { worker: 'competitor-watch' });

  for (const change of out.changes ?? []) {
    await q(`INSERT INTO insights (source, kind, body) VALUES ('competitor-analyst','competitor_change',$1)`, [JSON.stringify(change)]);
    await q(`INSERT INTO competitor_snapshots (competitor, snapshot, updated_at) VALUES ($1,$2, now())
             ON CONFLICT (competitor) DO UPDATE SET snapshot=EXCLUDED.snapshot, updated_at=now()`,
      [change.competitor, change]);
  }
  logger.info('watch done', { changes: (out.changes ?? []).length });
  return { changes: (out.changes ?? []).length };
}
