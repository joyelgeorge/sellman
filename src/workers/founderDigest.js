// Weekly one-screen report to the operator: attributed revenue, top channel,
// pending approvals. Deterministic — no agent, no judgment call, just a read
// of tables other workers already wrote. Closes BRAINSTORM.md idea #29,
// which named this as wanted but never had a worker behind it.
import { q } from '../db/pool.js';
import { pending } from '../approvals/queue.js';
import { sendMail } from '../lib/mail.js';
import { env } from '../lib/env.js';
import { log } from '../lib/log.js';

const logger = log('founder-digest');

function sumRevenue(rows) {
  const totals = {};
  for (const r of rows) {
    for (const [currency, cents] of Object.entries(r.revenue_cents ?? {})) {
      totals[currency] = (totals[currency] ?? 0) + Number(cents);
    }
  }
  return totals;
}

function topChannel(rows) {
  const byChannel = new Map();
  for (const r of rows) {
    const cents = Object.values(r.revenue_cents ?? {}).reduce((a, b) => a + Number(b), 0);
    byChannel.set(r.channel_key, (byChannel.get(r.channel_key) ?? 0) + cents);
  }
  let best = null;
  for (const [channel, cents] of byChannel) if (!best || cents > best.cents) best = { channel, cents };
  return best;
}

export function formatDigest({ revenue, top, approvals, days = 7 }) {
  const revenueLine = Object.keys(revenue).length
    ? Object.entries(revenue).map(([c, cents]) => `${c} ${(cents / 100).toFixed(2)}`).join(', ')
    : 'none yet';
  const lines = [
    `Sellman weekly digest — last ${days} days`,
    ``,
    `Attributed verified revenue: ${revenueLine}`,
    `Top channel: ${top ? `${top.channel} (${(top.cents / 100).toFixed(2)} minor units)` : 'no attributed channel yet'}`,
    `Pending approvals: ${approvals.length}`,
    ...approvals.slice(0, 5).map((a) => `  #${a.id}  ${a.kind}  ${a.summary}`),
  ];
  return lines.join('\n');
}

export async function run({ days = 7 } = {}) {
  const rows = await q(
    `SELECT channel_key, revenue_cents FROM attribution_daily
      WHERE model='first_touch' AND day >= current_date - $1::int`, [days]);
  const revenue = sumRevenue(rows);
  const top = topChannel(rows);
  const approvals = await pending();

  const text = formatDigest({ revenue, top, approvals, days });
  const to = env('SELLMAN_OPERATOR_EMAIL');
  if (to) await sendMail({ to, subject: `Sellman weekly digest — ${new Date().toISOString().slice(0, 10)}`, text });
  else logger.warn('SELLMAN_OPERATOR_EMAIL not set — printing digest instead of mailing', { text });

  await q(`INSERT INTO insights (source, kind, body) VALUES ('founder-digest','report',$1)`, [{ text, revenue, top, pending_approvals: approvals.length }]);
  logger.info('digest sent', { mailed: Boolean(to), pending_approvals: approvals.length });
  return { revenue, top, pending_approvals: approvals.length };
}
