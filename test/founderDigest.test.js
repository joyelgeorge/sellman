import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDigest } from '../src/workers/founderDigest.js';

test('formatDigest reports revenue in major units and lists pending approvals', () => {
  const text = formatDigest({
    revenue: { USD: 11000 },
    top: { channel: 'stripe_marketplace', cents: 11000 },
    approvals: [{ id: 1, kind: 'offer', summary: 'Offer "Leak Audit" for stripe.leak_audit' }],
    days: 7,
  });
  assert.match(text, /USD 110\.00/);
  assert.match(text, /Top channel: stripe_marketplace/);
  assert.match(text, /Pending approvals: 1/);
  assert.match(text, /#1  offer  Offer "Leak Audit"/);
});

test('formatDigest handles no revenue yet without throwing', () => {
  const text = formatDigest({ revenue: {}, top: null, approvals: [], days: 7 });
  assert.match(text, /none yet/);
  assert.match(text, /no attributed channel yet/);
});
