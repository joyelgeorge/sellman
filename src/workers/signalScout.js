import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { politeFetchText } from '../lib/fetchText.js';
import { scoreAccount } from '../scoring/leadScore.js';
import { readConfig } from '../lib/config.js';
import { log } from '../lib/log.js';

const logger = log('signal-scout');

export async function run({ maxSources = 5 } = {}) {
  const sources = (readConfig('sources.json').signal_scout ?? []).filter((s) => s.enabled).slice(0, maxSources);
  if (!sources.length) { logger.info('no enabled sources'); return { accounts: 0 }; }

  const icps = (await q(`SELECT definition FROM icps WHERE status='active'`)).map((r) => r.definition);
  if (!icps.length) { logger.info('no active ICPs'); return { accounts: 0 }; }

  const channels = readConfig('channels.json');
  const reachabilityWeights = Object.fromEntries(channels.map((c) => [c.key, c.status === 'active' ? c.reach_weight : 0]));

  const pages = [];
  for (const s of sources) {
    const text = await politeFetchText(s.url);
    if (!text) { logger.warn('fetch skipped (robots or error)', { url: s.url }); continue; }
    pages.push({ url: s.url, icp_key: s.icp_key, text });
  }
  if (!pages.length) return { accounts: 0 };

  const out = await runAgent('signal-scout', { icps, pages }, { worker: 'signal-scout' });

  let upserted = 0;
  for (const a of out.accounts ?? []) {
    const icp = icps.find((i) => i.icp_key === a.icp_key) ?? icps[0];
    const scored = scoreAccount({ evidence: a.evidence ?? [], disqualifiers: a.disqualifiers ?? [] }, icp, { reachabilityWeights });
    await q(
      `INSERT INTO accounts (domain, name, icp_key, jurisdiction, evidence, disqualifiers, score, score_why, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'signal-scout')
       ON CONFLICT (domain) DO UPDATE SET name=COALESCE(EXCLUDED.name, accounts.name), icp_key=EXCLUDED.icp_key,
         jurisdiction=COALESCE(EXCLUDED.jurisdiction, accounts.jurisdiction), evidence=EXCLUDED.evidence,
         disqualifiers=EXCLUDED.disqualifiers, score=EXCLUDED.score, score_why=EXCLUDED.score_why, updated_at=now()`,
      [a.domain, a.name ?? null, icp.icp_key, a.jurisdiction ?? null, JSON.stringify(a.evidence ?? []),
        JSON.stringify(a.disqualifiers ?? []), scored.score, scored]);
    upserted += 1;
  }
  logger.info('scored accounts', { accounts: upserted, sources: pages.length });
  return { accounts: upserted };
}
