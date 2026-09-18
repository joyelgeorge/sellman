import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signUnsubscribeToken, verifyUnsubscribeToken } from '../src/web/tokens.js';
import { validateEvent, eventRow, EVENT_TYPES } from '../src/web/events.js';
import { parseDeliverabilityEvent, deliverabilityIncrement } from '../src/web/webhooks.js';

test('unsubscribe token round-trips and rejects tampering', () => {
  const token = signUnsubscribeToken('Founder@Example.com', 'secret');
  assert.equal(verifyUnsubscribeToken(token, 'secret'), 'founder@example.com');
  assert.equal(verifyUnsubscribeToken(token, 'wrong-secret'), null);
  assert.equal(verifyUnsubscribeToken(token + 'x', 'secret'), null);
  assert.equal(verifyUnsubscribeToken('not-a-token', 'secret'), null);
  assert.equal(verifyUnsubscribeToken(token, ''), null);
});

test('event validation: type and identity are required', () => {
  assert.equal(validateEvent({ type: 'visit', anon_id: 'a1' }).ok, true);
  assert.equal(validateEvent({ type: 'visit', account_id: 5 }).ok, true);
  assert.deepEqual(validateEvent({ type: 'nope', anon_id: 'a1' }).reasons, ['UNKNOWN_TYPE']);
  assert.deepEqual(validateEvent({ type: 'visit' }).reasons, ['MISSING_IDENTITY']);
  assert.deepEqual(validateEvent(null).reasons, ['NOT_AN_OBJECT']);
  assert.ok(EVENT_TYPES.includes('audit_completed'));
});

test('eventRow orders values for the INSERT', () => {
  const row = eventRow({ type: 'install', account_id: 3, channel_key: 'geo_content', utm: { src: 'x' } });
  assert.deepEqual(row, ['install', 3, null, 'geo_content', null, '{"src":"x"}', '{}']);
});

test('deliverability webhook: requires email and channel_key', () => {
  assert.equal(parseDeliverabilityEvent({ email: 'a@b.com', channel_key: 'outbound_email' }, 'bounce').ok, true);
  assert.deepEqual(parseDeliverabilityEvent({ channel_key: 'x' }, 'bounce').reasons, ['MISSING_EMAIL']);
  assert.deepEqual(parseDeliverabilityEvent({ email: 'a@b.com' }, 'bounce').reasons, ['MISSING_CHANNEL_KEY']);
  assert.deepEqual(parseDeliverabilityEvent({ email: 'a@b.com', channel_key: 'x' }, 'nope').reasons, ['UNKNOWN_KIND']);
});

test('deliverability increment marks exactly one counter', () => {
  assert.deepEqual(deliverabilityIncrement({ sender: 's' }, 'bounce'), { sender: 's', bounced: 1, complaints: 0 });
  assert.deepEqual(deliverabilityIncrement({}, 'complaint'), { sender: 'unknown', bounced: 0, complaints: 1 });
});
