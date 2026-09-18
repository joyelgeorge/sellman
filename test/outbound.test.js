import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSend, deliverabilityState, isSuppressed, complianceFooter, listUnsubscribeHeaders } from '../src/guard/outbound.js';

const compliance = { default_mode: 'consent_required', cooldown_days: 90,
  jurisdictions: { US: { mode: 'opt_out_allowed' }, IN: { mode: 'consent_required' }, XX: { mode: 'blocked' } } };
const goodAccount = { evidence: [{ signal: 'pricing page', url: 'https://x.test/pricing' }], jurisdiction: 'US' };
const goodContact = { email: 'founder@x.test', jurisdiction: 'US', lawful_basis: 'legitimate_interest_b2b' };

test('eligible US contact passes', () => {
  assert.deepEqual(checkSend({ contact: goodContact, account: goodAccount, compliance }), { ok: true, reasons: [] });
});

test('India contact without consent is blocked', () => {
  const r = checkSend({ contact: { ...goodContact, jurisdiction: 'IN' }, account: goodAccount, compliance });
  assert.ok(r.reasons.includes('CONSENT_REQUIRED'));
});

test('unknown jurisdiction defaults to consent_required', () => {
  const r = checkSend({ contact: { ...goodContact, jurisdiction: undefined }, account: { ...goodAccount, jurisdiction: undefined }, compliance });
  assert.ok(r.reasons.includes('CONSENT_REQUIRED'));
});

test('cap, suppression, evidence, cooldown all enforced', () => {
  const r = checkSend({
    contact: goodContact,
    account: { jurisdiction: 'US', evidence: [], last_touched_at: new Date(Date.now() - 5 * 86_400_000).toISOString() },
    compliance, suppression: new Set(['@x.test']), sentToday: 30, dailyCap: 30,
  });
  for (const code of ['DAILY_CAP_REACHED', 'SUPPRESSED', 'NO_PUBLIC_EVIDENCE', 'COOLDOWN']) assert.ok(r.reasons.includes(code), code);
});

test('domain-level suppression', () => {
  assert.equal(isSuppressed('A@Example.com', new Set(['@example.com'])), true);
  assert.equal(isSuppressed('a@other.com', new Set(['@example.com'])), false);
});

test('deliverability thresholds', () => {
  assert.equal(deliverabilityState({ sent: 1000, bounced: 5, complaints: 0 }), 'ok');
  assert.equal(deliverabilityState({ sent: 1000, bounced: 18, complaints: 0 }), 'alarm');
  assert.equal(deliverabilityState({ sent: 1000, bounced: 25, complaints: 0 }), 'pause');
  assert.equal(deliverabilityState({ sent: 1000, bounced: 0, complaints: 3 }), 'pause');
  assert.equal(deliverabilityState({ sent: 20, bounced: 0, complaints: 0 }), 'insufficient_data');
  assert.equal(deliverabilityState({ sent: 20, bounced: 0, complaints: 1 }), 'pause');
});

test('footer and headers', () => {
  assert.throws(() => complianceFooter({ senderName: 'A' }));
  assert.match(complianceFooter({ senderName: 'A', postalAddress: 'B', unsubscribeUrl: 'https://u' }), /Unsubscribe/);
  assert.equal(listUnsubscribeHeaders('https://u')['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
});
