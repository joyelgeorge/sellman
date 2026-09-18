import { q } from '../db/pool.js';
import { runAgent } from '../agents/run.js';
import { checkClaims } from '../guard/claims.js';
import { checkSend, complianceFooter, listUnsubscribeHeaders } from '../guard/outbound.js';
import { enqueue } from '../approvals/queue.js';
import { readConfig } from '../lib/config.js';
import { env, envBool, envInt } from '../lib/env.js';
import { sendMail } from '../lib/mail.js';
import { log } from '../lib/log.js';

const logger = log('outbound-batch');
const CHANNEL = 'outbound_email';

export async function run() {
  if (!envBool('SELLMAN_OUTBOUND_ENABLED', false)) { logger.info('outbound disabled'); return { sent: 0, reason: 'disabled' }; }

  const channel = (await q('SELECT key, status, config FROM channels WHERE key=$1', [CHANNEL]))[0];
  if (!channel || channel.status !== 'active') { logger.info('channel not active'); return { sent: 0, reason: 'channel_not_active' }; }

  const compliance = readConfig('compliance.json');
  const dailyCap = envInt('SELLMAN_DAILY_SEND_CAP', channel.config?.daily_cap ?? 30);
  const sentToday = Number((await q(
    `SELECT COUNT(*)::int AS n FROM touches WHERE channel_key=$1 AND status='sent' AND sent_at::date = current_date`, [CHANNEL]))[0].n);
  if (sentToday >= dailyCap) return { sent: 0, reason: 'daily_cap' };

  const suppression = new Set((await q('SELECT value FROM suppression')).map((r) => r.value));
  const capabilities = await q('SELECT * FROM capabilities');
  const offerRow = (await q(`SELECT id, body FROM offers WHERE status='approved' ORDER BY updated_at DESC LIMIT 1`))[0];
  if (!offerRow) { logger.info('no approved offer'); return { sent: 0, reason: 'no_offer' }; }

  const campaign = (await q(
    `SELECT id, status FROM campaigns WHERE channel_key=$1 AND offer_id=$2 ORDER BY created_at DESC LIMIT 1`, [CHANNEL, offerRow.id]))[0]
    ?? (await q(`INSERT INTO campaigns (channel_key, offer_id, name) VALUES ($1,$2,$3) RETURNING id, status`,
      [CHANNEL, offerRow.id, `${offerRow.body.face_name ?? 'offer'} — evidence-led first touch`]))[0];

  const candidates = await q(
    `SELECT a.id AS account_id, a.domain, a.jurisdiction, a.evidence, a.last_touched_at, a.score,
            c.id AS contact_id, c.email, c.role, c.jurisdiction AS contact_jurisdiction, c.lawful_basis, c.consent_ref
       FROM accounts a JOIN contacts c ON c.account_id = a.id
      WHERE a.stage = 'identified' AND a.score > 0
      ORDER BY a.score DESC LIMIT 50`);

  const eligible = [];
  for (const row of candidates) {
    if (eligible.length + sentToday >= dailyCap) break;
    const check = checkSend({
      contact: { email: row.email, jurisdiction: row.contact_jurisdiction ?? row.jurisdiction, lawful_basis: row.lawful_basis, consent_ref: row.consent_ref },
      account: { evidence: row.evidence, last_touched_at: row.last_touched_at, jurisdiction: row.jurisdiction },
      compliance, suppression, sentToday: sentToday + eligible.length, dailyCap, channelStatus: channel.status,
    });
    if (check.ok) eligible.push(row); else logger.info('skipped', { domain: row.domain, reasons: check.reasons });
  }
  if (!eligible.length) return { sent: 0, reason: 'no_eligible_contacts' };

  const out = await runAgent('outbound-writer', {
    offer: offerRow.body,
    accounts: eligible.map((r) => ({ account_id: r.account_id, contact_id: r.contact_id, domain: r.domain, role: r.role, evidence: r.evidence })),
  }, { worker: 'outbound-batch' });

  const footer = complianceFooter({
    senderName: env('SELLMAN_SENDER_NAME', 'Sellman'),
    postalAddress: env('SELLMAN_POSTAL_ADDRESS', 'set SELLMAN_POSTAL_ADDRESS'),
    unsubscribeUrl: `${env('SELLMAN_UNSUBSCRIBE_BASE_URL', 'https://example.com/u')}/preview`,
  });

  let queued = 0; let sent = 0;
  for (const email of out.emails ?? []) {
    const target = eligible.find((e) => e.contact_id === email.contact_id) ?? eligible.find((e) => e.account_id === email.account_id);
    if (!target) continue;
    const guard = checkClaims({ text: `${email.subject}\n${email.body_text}`, claimsUsed: out.claims_used ?? [], numbersUsed: out.numbers_used ?? [], capabilities });
    if (!guard.ok) { logger.warn('email rejected by claims guard', { domain: target.domain, violations: guard.violations }); continue; }

    const unsubscribeUrl = `${env('SELLMAN_UNSUBSCRIBE_BASE_URL', 'https://example.com/u')}/${target.contact_id}`;
    const payload = {
      subject: email.subject,
      body: email.body_text + footer.replace('/preview', `/${target.contact_id}`),
      headers: listUnsubscribeHeaders(unsubscribeUrl, env('SELLMAN_SENDER_EMAIL')),
      evidence_url: email.evidence_url,
    };

    if (campaign.status !== 'approved') {
      const rows = await q(
        `INSERT INTO touches (account_id, contact_id, campaign_id, channel_key, payload, status)
         VALUES ($1,$2,$3,$4,$5,'held') RETURNING id`, [target.account_id, target.contact_id, campaign.id, CHANNEL, payload]);
      queued += 1;
      if (queued === 1) {
        await enqueue({ kind: 'campaign_first_send', refTable: 'campaigns', refId: campaign.id,
          summary: `First send of campaign #${campaign.id} (${(out.emails ?? []).length} drafts held)`,
          payload: { sample: payload, touch_id: rows[0].id } });
      }
      continue;
    }

    await sendMail({ to: target.email, subject: payload.subject, text: payload.body, headers: payload.headers });
    await q(`INSERT INTO touches (account_id, contact_id, campaign_id, channel_key, payload, status, sent_at)
             VALUES ($1,$2,$3,$4,$5,'sent', now())`, [target.account_id, target.contact_id, campaign.id, CHANNEL, payload]);
    await q(`UPDATE accounts SET last_touched_at=now(), stage='contacted', updated_at=now() WHERE id=$1`, [target.account_id]);
    await q(`INSERT INTO deliverability_daily (day, channel_key, sender, sent) VALUES (current_date,$1,$2,1)
             ON CONFLICT (day, channel_key, sender) DO UPDATE SET sent = deliverability_daily.sent + 1`,
      [CHANNEL, env('SELLMAN_SENDER_EMAIL', 'unknown')]);
    sent += 1;
  }
  logger.info('done', { sent, held_for_approval: queued });
  return { sent, held: queued };
}
