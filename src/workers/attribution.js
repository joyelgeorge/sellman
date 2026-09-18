import { q } from '../db/pool.js';
import { log } from '../lib/log.js';

const logger = log('attribution');

/**
 * Joins funnel events with Taskman's verified fees.
 * first_touch  = earliest channel that produced any event for the account
 * install_source = channel on the install event
 */
export async function run({ days = 30 } = {}) {
  const rows = await q(
    `WITH first_touch AS (
        SELECT DISTINCT ON (account_id) account_id, channel_key, occurred_at::date AS day
          FROM events WHERE account_id IS NOT NULL AND channel_key IS NOT NULL
         ORDER BY account_id, occurred_at
     ),
     install AS (
        SELECT DISTINCT ON (account_id) account_id, channel_key, occurred_at::date AS day
          FROM events WHERE type='install' AND account_id IS NOT NULL
         ORDER BY account_id, occurred_at
     ),
     rev AS (
        SELECT NULLIF(split_part(source_ref, ':', 3), '')::bigint AS account_id, currency, SUM(verified_fee_cents) AS cents
          FROM revenue WHERE source_ref LIKE 'sellman:acct:%' GROUP BY 1,2
     )
     SELECT 'first_touch' AS model, ft.channel_key, ft.day,
            COUNT(DISTINCT ft.account_id)::int AS accounts,
            COUNT(DISTINCT i.account_id)::int AS installs,
            COUNT(DISTINCT rev.account_id)::int AS paying,
            COALESCE(jsonb_object_agg(rev.currency, rev.cents) FILTER (WHERE rev.currency IS NOT NULL), '{}'::jsonb) AS revenue_cents
       FROM first_touch ft
       LEFT JOIN install i ON i.account_id = ft.account_id
       LEFT JOIN rev ON rev.account_id = ft.account_id
      WHERE ft.day >= current_date - ($1::int)
      GROUP BY 1,2,3
     UNION ALL
     SELECT 'install_source', i.channel_key, i.day,
            COUNT(DISTINCT i.account_id)::int, COUNT(DISTINCT i.account_id)::int,
            COUNT(DISTINCT rev.account_id)::int,
            COALESCE(jsonb_object_agg(rev.currency, rev.cents) FILTER (WHERE rev.currency IS NOT NULL), '{}'::jsonb)
       FROM install i LEFT JOIN rev ON rev.account_id = i.account_id
      WHERE i.day >= current_date - ($1::int)
      GROUP BY 1,2,3`, [days]);

  for (const r of rows) {
    await q(
      `INSERT INTO attribution_daily (day, channel_key, model, visits, audits_completed, installs, paying_accounts, revenue_cents)
       VALUES ($1,$2,$3,$4,0,$5,$6,$7)
       ON CONFLICT (day, channel_key, model) DO UPDATE SET visits=EXCLUDED.visits, installs=EXCLUDED.installs,
         paying_accounts=EXCLUDED.paying_accounts, revenue_cents=EXCLUDED.revenue_cents`,
      [r.day, r.channel_key, r.model, r.accounts, r.installs, r.paying, r.revenue_cents]);
  }

  const audits = await q(
    `SELECT channel_key, occurred_at::date AS day, COUNT(*)::int AS n FROM events
      WHERE type='audit_completed' AND channel_key IS NOT NULL AND occurred_at >= current_date - ($1::int)
      GROUP BY 1,2`, [days]);
  for (const a of audits) {
    await q(`UPDATE attribution_daily SET audits_completed=$3 WHERE day=$1 AND channel_key=$2 AND model='first_touch'`,
      [a.day, a.channel_key, a.n]);
  }

  logger.info('attributed', { rows: rows.length });
  return { rows: rows.length };
}
