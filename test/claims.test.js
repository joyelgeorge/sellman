import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkClaims, extractNumericClaims } from '../src/guard/claims.js';

const caps = [
  { key: 'stripe.recovery', name: 'Failed payment recovery', status: 'verified',
    proof: { sample_accounts: 7, metrics: { recovery_rate_pct: 41.2 } } },
  { key: 'stripe.recovery_small', name: 'Tiny sample thing', status: 'verified',
    proof: { sample_accounts: 2, metrics: { recovery_rate_pct: 60 } } },
  { key: 'razorpay.mandate', name: 'Mandate drop-off detector', status: 'beta', proof: { sample_accounts: 1, metrics: { dropoff_found_pct: 12 } } },
  { key: 'tally.shrinkage', name: 'Stock variance check', status: 'planned' },
];
const codes = (r) => r.violations.map((v) => v.code);

test('verified capability with declared, backed number passes', () => {
  const r = checkClaims({ text: 'Recovered 41% of failed payments across 7 accounts in 60 days.',
    claimsUsed: ['stripe.recovery'], numbersUsed: [{ value: 41, metric_key: 'recovery_rate_pct' }], capabilities: caps });
  assert.equal(r.ok, true, JSON.stringify(r.violations));
});

test('number above proof is rejected', () => {
  const r = checkClaims({ text: 'Recover 55% of failed payments.', claimsUsed: ['stripe.recovery'],
    numbersUsed: [{ value: 55, metric_key: 'recovery_rate_pct' }], capabilities: caps });
  assert.ok(codes(r).includes('EXCEEDS_PROOF'));
});

test('undeclared number in text is rejected', () => {
  const r = checkClaims({ text: 'Get back $2,000 a month.', claimsUsed: ['stripe.recovery'], capabilities: caps });
  assert.ok(codes(r).includes('UNDECLARED_NUMBER'));
});

test('insufficient sample blocks numeric claims', () => {
  const r = checkClaims({ text: 'Recover 60% of failures.', claimsUsed: ['stripe.recovery_small'],
    numbersUsed: [{ value: 60, metric_key: 'recovery_rate_pct' }], capabilities: caps });
  assert.ok(codes(r).includes('INSUFFICIENT_SAMPLE'));
});

test('planned capability cannot be mentioned', () => {
  const r = checkClaims({ text: 'Try our stock checker.', claimsUsed: ['tally.shrinkage'], capabilities: caps });
  assert.ok(codes(r).includes('PLANNED_CAPABILITY'));
});

test('undeclared mention of a capability name is caught', () => {
  const r = checkClaims({ text: 'Also includes Stock variance check.', claimsUsed: [], capabilities: caps });
  assert.ok(codes(r).includes('UNDECLARED_CLAIM'));
});

test('beta requires early-access notice and no numbers', () => {
  const noNotice = checkClaims({ text: 'Find mandate drop-offs.', claimsUsed: ['razorpay.mandate'], capabilities: caps });
  assert.ok(codes(noNotice).includes('MISSING_EARLY_ACCESS_NOTICE'));
  const withNumber = checkClaims({ text: 'Early access: finds 12% drop-off.', claimsUsed: ['razorpay.mandate'],
    numbersUsed: [{ value: 12, metric_key: 'dropoff_found_pct' }], capabilities: caps });
  assert.ok(codes(withNumber).includes('NUMBER_ON_UNVERIFIED'));
  const ok = checkClaims({ text: 'Early access: find where UPI mandates drop off.', claimsUsed: ['razorpay.mandate'], capabilities: caps });
  assert.equal(ok.ok, true, JSON.stringify(ok.violations));
});

test('guarantee language needs a defined guarantee', () => {
  const text = 'Pay nothing unless we recover revenue — guaranteed.';
  assert.ok(codes(checkClaims({ text, claimsUsed: ['stripe.recovery'], capabilities: caps })).includes('BANNED_PHRASE'));
  assert.equal(checkClaims({ text, claimsUsed: ['stripe.recovery'], capabilities: caps, offer: { guarantee_defined: true } }).ok, true);
  assert.ok(codes(checkClaims({ text: 'Works 100% of the time', capabilities: caps })).includes('BANNED_PHRASE'));
});

test('extractNumericClaims ignores bare years and counts', () => {
  const found = extractNumericClaims('In 2026 we ran 3 steps and saw ₹1,20,000 and 15% and 3x');
  assert.deepEqual(found.map((f) => f.value), [120000, 15, 3]);
});
