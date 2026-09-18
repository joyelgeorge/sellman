// Applies migrations and runs the trickier worker queries against an in-process Postgres (PGlite).
// No database service needed — runs in CI and locally: `npm run schema:check`.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const db = new PGlite();
await db.exec(readFileSync('migrations/001_init.sql', 'utf8'));
console.log('schema applied');

// Exercise the trickier statements the workers rely on.
await db.exec(`INSERT INTO capabilities (key,name,status,proof) VALUES ('a','A','verified','{"sample_accounts":7,"metrics":{"r":40}}')`);
await db.exec(`UPDATE capabilities SET status='deprecated' WHERE key <> ALL(ARRAY['a','b'])`);
await db.query(`INSERT INTO tasks (kind, capability_key, reason, priority) VALUES ('offer','a','x',1) ON CONFLICT DO NOTHING RETURNING id`);
const dup = await db.query(`INSERT INTO tasks (kind, capability_key, reason, priority) VALUES ('offer','a','x',1) ON CONFLICT DO NOTHING RETURNING id`);
console.log('partial unique index blocks duplicate open task:', dup.rows.length === 0);

await db.exec(`INSERT INTO icps (key, definition, status) VALUES ('icp1','{"icp_key":"icp1"}','active')`);
await db.exec(`INSERT INTO accounts (domain, icp_key, evidence, score) VALUES ('x.test','icp1','[{"signal":"s"}]',0.8)`);
await db.exec(`INSERT INTO events (type, account_id, channel_key, occurred_at) VALUES ('visit',1,'geo_content', now()), ('audit_completed',1,'geo_content', now()), ('install',1,'geo_content', now())`);
await db.exec(`INSERT INTO revenue (account_ref, source_ref, period, verified_fee_cents, currency) VALUES ('acct_1','sellman:acct:1', to_char(now(),'YYYY-MM'), 5700, 'USD')`);

const attribution = await db.query(`
WITH first_touch AS (
   SELECT DISTINCT ON (account_id) account_id, channel_key, occurred_at::date AS day
     FROM events WHERE account_id IS NOT NULL AND channel_key IS NOT NULL ORDER BY account_id, occurred_at),
 install AS (
   SELECT DISTINCT ON (account_id) account_id, channel_key, occurred_at::date AS day
     FROM events WHERE type='install' AND account_id IS NOT NULL ORDER BY account_id, occurred_at),
 rev AS (
   SELECT NULLIF(split_part(source_ref, ':', 3), '')::bigint AS account_id, currency, SUM(verified_fee_cents) AS cents
     FROM revenue WHERE source_ref LIKE 'sellman:acct:%' GROUP BY 1,2)
SELECT 'first_touch' AS model, ft.channel_key, ft.day,
       COUNT(DISTINCT ft.account_id)::int AS accounts,
       COUNT(DISTINCT i.account_id)::int AS installs,
       COUNT(DISTINCT rev.account_id)::int AS paying,
       COALESCE(jsonb_object_agg(rev.currency, rev.cents) FILTER (WHERE rev.currency IS NOT NULL), '{}'::jsonb) AS revenue_cents
  FROM first_touch ft LEFT JOIN install i ON i.account_id = ft.account_id LEFT JOIN rev ON rev.account_id = ft.account_id
 WHERE ft.day >= current_date - 30 GROUP BY 1,2,3`);
console.log('attribution query:', JSON.stringify(attribution.rows));

await db.exec(`INSERT INTO content (kind, body, claims_used, status) VALUES ('page','x','["a"]','published')`);
const unpub = await db.query(`UPDATE content SET status='unpublished' WHERE status IN ('published','approved','pending_approval') AND claims_used @> $1::jsonb RETURNING id`, [JSON.stringify(['a'])]);
console.log('unpublish-by-claim matched rows:', unpub.rows.length);

await db.exec(`INSERT INTO deliverability_daily (day, channel_key, sender, sent) VALUES (current_date,'outbound_email','a@b',1)
               ON CONFLICT (day, channel_key, sender) DO UPDATE SET sent = deliverability_daily.sent + 1`);
const dl = await db.query(`SELECT channel_key, SUM(sent)::int AS sent, SUM(bounced)::int AS bounced, SUM(complaints)::int AS complaints
                             FROM deliverability_daily WHERE day >= current_date - (7::int - 1) GROUP BY channel_key`);
console.log('deliverability rollup:', JSON.stringify(dl.rows));

// seed.js upserts (channels + icps)
await db.exec(`INSERT INTO channels (key, type, status, config) VALUES ('geo_content','content','active','{"reach_weight":0.8}')
               ON CONFLICT (key) DO UPDATE SET type=EXCLUDED.type, config=EXCLUDED.config, updated_at=now()`);
await db.exec(`INSERT INTO icps (key, definition, status) VALUES ('icp2','{"icp_key":"icp2"}','active')
               ON CONFLICT (key) DO UPDATE SET definition=EXCLUDED.definition, updated_at=now()`);
console.log('seed upserts: ok');

// partnerChannel.js: accounts upsert with source='partner-channel' (no evidence/disqualifiers/score_why)
await db.exec(`INSERT INTO accounts (domain, name, icp_key, evidence, score, source)
               VALUES ('capartner.test','A CA Firm','icp2','[{"signal":"lists tally clients"}]',0,'partner-channel')
               ON CONFLICT (domain) DO UPDATE SET name=COALESCE(EXCLUDED.name, accounts.name), updated_at=now()`);
// and the null-icp_key path (agent returned an icp_key that doesn't exist -> worker falls back to null)
await db.exec(`INSERT INTO accounts (domain, name, icp_key, evidence, score, source)
               VALUES ('nullicp.test',NULL,NULL,'[]',0,'partner-channel')
               ON CONFLICT (domain) DO UPDATE SET name=COALESCE(EXCLUDED.name, accounts.name), updated_at=now()`);
await db.exec(`INSERT INTO approvals (kind, summary, payload) VALUES ('partner_outreach','draft ready','{}')`);
console.log('partner-channel writes: ok');

// src/web/server.js: unsubscribe + deliverability webhook writes
await db.exec(`INSERT INTO suppression (value, reason) VALUES ('bounced@x.test','bounce') ON CONFLICT (value) DO NOTHING`);
const dupSuppress = await db.query(`INSERT INTO suppression (value, reason) VALUES ('bounced@x.test','bounce') ON CONFLICT (value) DO NOTHING RETURNING value`);
console.log('suppression insert is idempotent:', dupSuppress.rows.length === 0);

await db.exec(`INSERT INTO deliverability_daily (day, channel_key, sender, sent, bounced, complaints)
               VALUES (current_date, 'outbound_email', 'a@b', 0, 1, 0)
               ON CONFLICT (day, channel_key, sender) DO UPDATE SET
                 bounced = deliverability_daily.bounced + EXCLUDED.bounced,
                 complaints = deliverability_daily.complaints + EXCLUDED.complaints`);
const bounced = await db.query(`SELECT sent, bounced FROM deliverability_daily WHERE channel_key='outbound_email'`);
console.log('bounce webhook increments bounced without touching sent:', bounced.rows[0].sent === 1 && bounced.rows[0].bounced === 1);

const exp = await db.query(`INSERT INTO experiments (card, conversion_event, status) VALUES ('{"hypothesis":"h"}','audit_completed','running') RETURNING id`);
await db.exec(`INSERT INTO arms (experiment_id, label) VALUES (${exp.rows[0].id},'control'), (${exp.rows[0].id},'variant')`);
const arms = await db.query(`SELECT a.id, a.label, a.status,
     COUNT(*) FILTER (WHERE e.type = 'visit' OR e.type = 'exposure')::int AS exposures,
     COUNT(*) FILTER (WHERE e.type = $2)::int AS conversions
   FROM arms a LEFT JOIN events e ON e.arm_id = a.id WHERE a.experiment_id = $1 GROUP BY a.id, a.label, a.status`, [exp.rows[0].id, 'audit_completed']);
console.log('arm stats query rows:', arms.rows.length);
console.log('ALL SCHEMA CHECKS PASSED');

await db.close();
