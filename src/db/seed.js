// Loads config/*.json into Postgres so channels, ICPs, and the competitor
// watchlist exist without hand-inserting rows. Safe to re-run: channels and
// ICPs are upserted from the file (the file is the source of truth until an
// approved icp_change payload updates a row); competitor snapshots are only
// seeded if the competitor doesn't exist yet, so competitor-watch's own dated
// snapshots are never clobbered by a re-seed.
import { q } from './pool.js';
import { readConfig } from '../lib/config.js';
import { log } from '../lib/log.js';

const logger = log('seed');

export function channelRows(channels = []) {
  return channels.map((c) => ({
    key: c.key,
    type: c.type,
    status: c.status ?? 'active',
    config: { reach_weight: c.reach_weight ?? 0.5, ...(c.daily_cap ? { daily_cap: c.daily_cap } : {}) },
  }));
}

export function icpRows(icps = []) {
  return icps.map((definition) => ({ key: definition.icp_key, definition }));
}

export function competitorRows(competitors = {}) {
  const rows = [];
  for (const [category, list] of Object.entries(competitors)) {
    if (category.startsWith('_') || !Array.isArray(list)) continue;
    for (const entry of list) rows.push({ competitor: entry.name, snapshot: { category, ...entry } });
  }
  return rows;
}

export async function seed() {
  const channels = channelRows(readConfig('channels.json'));
  for (const c of channels) {
    await q(
      `INSERT INTO channels (key, type, status, config) VALUES ($1,$2,$3,$4)
       ON CONFLICT (key) DO UPDATE SET type=EXCLUDED.type, config=EXCLUDED.config, updated_at=now()`,
      [c.key, c.type, c.status, c.config]);
  }

  const icps = icpRows(readConfig('icps.seed.json'));
  for (const i of icps) {
    await q(
      `INSERT INTO icps (key, definition, status) VALUES ($1,$2,'active')
       ON CONFLICT (key) DO UPDATE SET definition=EXCLUDED.definition, updated_at=now()`,
      [i.key, i.definition]);
  }

  const competitors = competitorRows(readConfig('competitors.json'));
  let competitorsSeeded = 0;
  for (const c of competitors) {
    const rows = await q(
      `INSERT INTO competitor_snapshots (competitor, snapshot) VALUES ($1,$2)
       ON CONFLICT (competitor) DO NOTHING RETURNING competitor`,
      [c.competitor, c.snapshot]);
    if (rows.length) competitorsSeeded += 1;
  }

  logger.info('seeded', { channels: channels.length, icps: icps.length, competitors_new: competitorsSeeded });
  return { channels: channels.length, icps: icps.length, competitors_new: competitorsSeeded };
}
