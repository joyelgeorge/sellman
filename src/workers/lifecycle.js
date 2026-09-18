import { q } from '../db/pool.js';
import { checkClaims } from '../guard/claims.js';
import { complianceFooter, listUnsubscribeHeaders, isSuppressed } from '../guard/outbound.js';
import { env } from '../lib/env.js';
import { sendMail } from '../lib/mail.js';
import { log } from '../lib/log.js';

const logger = log('lifecycle');

/** Triggers are event-driven and only fire for contacts who opted in. */
const TRIGGERS = [
  { name: 'audit_completed_no_install_d3', sql:
    `SELECT e.account_id, e.data FROM events e
      WHERE e.type='audit_completed' AND e.occurred_at < now() - interval '3 days'
        AND e.occurred_at > now() - interval '10 days'
        AND NOT EXISTS (SELECT 1 FROM events i WHERE i.account_id = e.account_id AND i.type='install')` },
];

function fill(template, vars) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(vars[key] ?? '')); 
}

export async function run() {
  const capabilities = await q('SELECT * FROM capabilities');
  const suppression = new Set((await q('SELECT value FROM suppression')).map((r) => r.value));
  let sent = 0;

  for (const trigger of TRIGGERS) {
    const template = (await q(
      `SELECT id, title, body, meta, claims_used, numbers_used FROM content
        WHERE kind='email_template' AND status='approved' AND meta->>'trigger' = $1 LIMIT 1`, [trigger.name]))[0];
    if (!template) continue;

    const guard = checkClaims({ text: `${template.title}\n${template.body}`, claimsUsed: template.claims_used ?? [], numbersUsed: template.numbers_used ?? [], capabilities });
    if (!guard.ok) { logger.warn('approved template now fails the guard — skipping', { template: template.id, violations: guard.violations }); continue; }

    for (const row of await q(trigger.sql)) {
      const contact = (await q(
        `SELECT id, email FROM contacts WHERE account_id=$1 AND opted_in_lifecycle = true LIMIT 1`, [row.account_id]))[0];
      if (!contact || isSuppressed(contact.email, suppression)) continue;
      const already = await q(
        `SELECT 1 FROM touches WHERE contact_id=$1 AND channel_key='lifecycle' AND payload->>'trigger'=$2 LIMIT 1`, [contact.id, trigger.name]);
      if (already.length) continue;

      const vars = { audited_loss: row.data?.value_usd ?? '', top_leak_type: row.data?.leak_type ?? '' };
      const unsubscribeUrl = `${env('SELLMAN_UNSUBSCRIBE_BASE_URL', 'https://example.com/u')}/${contact.id}`;
      const body = fill(template.body, vars) + complianceFooter({
        senderName: env('SELLMAN_SENDER_NAME', 'Sellman'),
        postalAddress: env('SELLMAN_POSTAL_ADDRESS', 'set SELLMAN_POSTAL_ADDRESS'),
        unsubscribeUrl,
      });
      await sendMail({ to: contact.email, subject: fill(template.title, vars), text: body, headers: listUnsubscribeHeaders(unsubscribeUrl, env('SELLMAN_SENDER_EMAIL')) });
      await q(`INSERT INTO touches (account_id, contact_id, channel_key, payload, status, sent_at)
               VALUES ($1,$2,'lifecycle',$3,'sent', now())`, [row.account_id, contact.id, { trigger: trigger.name, template_id: template.id }]);
      sent += 1;
    }
  }
  logger.info('lifecycle done', { sent });
  return { sent };
}
